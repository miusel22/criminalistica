const mongoose = require('mongoose');

const carpetaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carpeta',
    default: null
  }
}, {
  timestamps: true
});

// Virtual for indiciados
carpetaSchema.virtual('indiciados', {
  ref: 'Indiciado',
  localField: '_id',
  foreignField: 'carpetaId'
});

// Virtual for subcarpetas
carpetaSchema.virtual('subCarpetas', {
  ref: 'Carpeta',
  localField: '_id',
  foreignField: 'parentId'
});

// Instance method to convert to dictionary format similar to Flask
carpetaSchema.methods.toDict = async function(includeIndiciados = false) {
  const carpeta = this.toObject();
  
  // Get subcarpetas
  const subCarpetas = await mongoose.model('Carpeta')
    .find({ parentId: this._id })
    .lean();
    
  const result = {
    id: carpeta._id,
    nombre: carpeta.nombre,
    owner_id: carpeta.ownerId,
    parent_id: carpeta.parentId,
    sub_carpetas: []
  };
  
  // Recursively get subcarpetas data
  for (const sub of subCarpetas) {
    const subCarpetaInstance = new (mongoose.model('Carpeta'))(sub);
    const subData = await subCarpetaInstance.toDict(true);
    result.sub_carpetas.push(subData);
  }
  
  if (includeIndiciados) {
    const indiciados = await mongoose.model('Indiciado')
      .find({ carpetaId: this._id })
      .lean();
    result.indiciados = indiciados.map(ind => ({
      id: ind._id,
      nombres: ind.nombres,
      apellidos: ind.apellidos,
      cc: ind.cc,
      alias: ind.alias,
      // Add other fields as needed
    }));
  }
  
  return result;
};

// Transform output
carpetaSchema.methods.toJSON = function() {
  const carpeta = this.toObject();
  delete carpeta.__v;
  return carpeta;
};

module.exports = mongoose.model('Carpeta', carpetaSchema);
