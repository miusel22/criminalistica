const mongoose = require('mongoose');

const indiciadoSchema = new mongoose.Schema({
  // Información básica del indiciado
  sectorQueOpera: {
    type: String,
    trim: true,
    maxLength: 200,
    default: ''
  },
  
  // Datos personales (mantenemos nombres para compatibilidad, pero lo llamaremos nombre)
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  
  apellidos: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  
  alias: {
    type: String,
    trim: true,
    maxLength: 100,
    default: ''
  },
  
  // Documento de identidad (actualizado desde cc)
  documentoIdentidad: {
    tipo: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    numero: {
      type: String,
      required: false,
      trim: true,
      maxLength: 50,
      default: ''
    },
    expedidoEn: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    }
  },
  
  // Fecha de nacimiento ampliada
  fechaNacimiento: {
    fecha: {
      type: Date
    },
    lugar: {
      type: String,
      trim: true,
      maxLength: 200,
      default: ''
    }
  },
  
  // Edad (calculada o manual)
  edad: {
    type: Number,
    min: 0,
    max: 120
  },
  
  // Información familiar
  hijoDe: {
    type: String,
    trim: true,
    maxLength: 200,
    default: ''
  },
  
  // Género
  genero: {
    type: String,
    enum: ['Masculino', 'Femenino', 'Otro', ''],
    default: ''
  },
  
  // Estado civil con opciones definidas
  estadoCivil: {
    type: String,
    enum: ['Soltero', 'Casado', 'Unión Libre', 'Viudo', 'Divorciado', 'Separado', ''],
    default: ''
  },
  
  // Nacionalidad
  nacionalidad: {
    type: String,
    trim: true,
    maxLength: 100,
    default: ''
  },
  
  // Información de contacto y ubicación
  residencia: {
    type: String,
    trim: true,
    maxLength: 300,
    default: ''
  },
  
  // Dirección específica
  direccion: {
    type: String,
    trim: true,
    maxLength: 500,
    default: ''
  },
  
  telefono: {
    type: String,
    trim: true,
    maxLength: 50,
    default: ''
  },
  
  // Email
  email: {
    type: String,
    trim: true,
    maxLength: 255,
    default: ''
  },
  
  // Información académica y laboral
  estudiosRealizados: {
    type: String,
    trim: true,
    maxLength: 500,
    default: ''
  },
  
  profesion: {
    type: String,
    trim: true,
    maxLength: 200,
    default: ''
  },
  
  oficio: {
    type: String,
    trim: true,
    maxLength: 200,
    default: ''
  },
  
  // Información física detallada
  senalesFisicas: {
    estatura: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    peso: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    contexturaFisica: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    colorPiel: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    colorOjos: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    colorCabello: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    marcasEspeciales: {
      type: String,
      trim: true,
      maxLength: 1000,
      default: ''
    }
  },
  
  // Señales físicas detalladas adicionales
  senalesFisicasDetalladas: {
    complexion: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    formaCara: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    tipoCabello: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    largoCabello: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    formaOjos: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    formaNariz: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    formaBoca: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    },
    formaLabios: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    }
  },
  
  // Información delictiva
  bandaDelincuencial: {
    type: String,
    trim: true,
    maxLength: 300,
    default: ''
  },
  
  delitosAtribuidos: {
    type: String,
    trim: true,
    maxLength: 1000,
    default: ''
  },
  
  // Antecedentes
  antecedentes: {
    type: String,
    trim: true,
    maxLength: 2000,
    default: ''
  },
  
  // Información jurídica
  situacionJuridica: {
    type: String,
    trim: true,
    maxLength: 500,
    default: ''
  },
  
  // Observaciones generales
  observaciones: {
    type: String,
    trim: true,
    maxLength: 2000,
    default: ''
  },
  
  // Foto del indiciado (mejorada)
  foto: {
    filename: {
      type: String,
      default: ''
    },
    originalName: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 0
    },
    path: {
      type: String,
      default: ''
    }
  },
  
  // Documentos relacionados (array de archivos)
  documentosRelacionados: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    descripcion: String,
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],
  
  // URL de Google Earth
  googleEarthUrl: {
    type: String,
    trim: true,
    maxLength: 1000,
    default: ''
  },
  
  // Metadatos del registro (actualizado para el nuevo sistema)
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Referencia al subsector (en lugar de carpetaId)
  subsectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    required: true
  },
  
  // Mantener carpetaId para compatibilidad (opcional)
  carpetaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carpeta'
  },
  
  // Estado del registro
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimización de consultas
indiciadoSchema.index({ ownerId: 1 });
indiciadoSchema.index({ subsectorId: 1 });
indiciadoSchema.index({ nombre: 1, apellidos: 1 });
indiciadoSchema.index({ 'documentoIdentidad.numero': 1 });
indiciadoSchema.index({ activo: 1 });

// Virtual for documentos
indiciadoSchema.virtual('documentos', {
  ref: 'Documento',
  localField: '_id',
  foreignField: 'indiciadoId'
});

// Virtual para nombre completo
indiciadoSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellidos}`.trim();
});

// Método para calcular edad automáticamente si hay fecha de nacimiento
indiciadoSchema.methods.calcularEdad = function() {
  if (!this.fechaNacimiento.fecha) return null;
  
  const today = new Date();
  const birthDate = new Date(this.fechaNacimiento.fecha);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Pre-save para actualizar edad automáticamente
indiciadoSchema.pre('save', function(next) {
  if (this.fechaNacimiento.fecha && !this.edad) {
    this.edad = this.calcularEdad();
  }
  next();
});

// Pre-remove middleware for cascade deletion (cleanup related documents if needed)
indiciadoSchema.pre('deleteMany', async function(next) {
  try {
    const query = this.getQuery();
    const indiciados = await this.model.find(query);
    
    // Here you can add cleanup logic for related documents
    // For example, if there are related files, delete them
    // For now, we'll just log the deletion
    console.log(`Deleting ${indiciados.length} indiciados with cascade cleanup`);
    
    // TODO: Add file cleanup logic here if needed
    // for (const indiciado of indiciados) {
    //   if (indiciado.foto && indiciado.foto.filename) {
    //     // Delete photo file from filesystem
    //   }
    //   if (indiciado.documentosRelacionados && indiciado.documentosRelacionados.length > 0) {
    //     // Delete related document files
    //   }
    // }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to get photo URL
indiciadoSchema.methods.getFotoUrl = function() {
  if (this.foto && this.foto.filename) {
    return `/uploads/${this.foto.filename}`;
  }
  return null;
};

// Instance method to convert to dictionary format
indiciadoSchema.methods.toDict = async function() {
  const indiciado = this.toObject();
  
  // Get documentos
  const documentos = await mongoose.model('Documento')
    .find({ indiciadoId: this._id })
    .lean();
    
  return {
    id: indiciado._id,
    sectorQueOpera: indiciado.sectorQueOpera,
    nombre: indiciado.nombre,
    apellidos: indiciado.apellidos,
    nombreCompleto: this.nombreCompleto,
    alias: indiciado.alias,
    documentoIdentidad: indiciado.documentoIdentidad,
    fechaNacimiento: {
      fecha: indiciado.fechaNacimiento.fecha ? indiciado.fechaNacimiento.fecha.toISOString().split('T')[0] : null,
      lugar: indiciado.fechaNacimiento.lugar
    },
    edad: indiciado.edad,
    hijoDe: indiciado.hijoDe,
    genero: indiciado.genero,
    estadoCivil: indiciado.estadoCivil,
    nacionalidad: indiciado.nacionalidad,
    residencia: indiciado.residencia,
    direccion: indiciado.direccion,
    telefono: indiciado.telefono,
    email: indiciado.email,
    estudiosRealizados: indiciado.estudiosRealizados,
    profesion: indiciado.profesion,
    oficio: indiciado.oficio,
    senalesFisicas: indiciado.senalesFisicas,
    senalesFisicasDetalladas: indiciado.senalesFisicasDetalladas,
    bandaDelincuencial: indiciado.bandaDelincuencial,
    delitosAtribuidos: indiciado.delitosAtribuidos,
    antecedentes: indiciado.antecedentes,
    situacionJuridica: indiciado.situacionJuridica,
    observaciones: indiciado.observaciones,
    foto: indiciado.foto,
    fotoUrl: this.getFotoUrl(),
    documentosRelacionados: indiciado.documentosRelacionados,
    googleEarthUrl: indiciado.googleEarthUrl,
    subsectorId: indiciado.subsectorId,
    ownerId: indiciado.ownerId,
    activo: indiciado.activo,
    createdAt: indiciado.createdAt,
    updatedAt: indiciado.updatedAt,
    documentos: documentos.map(doc => ({
      id: doc._id,
      filename: doc.originalFilename,
      upload_date: doc.uploadDate.toISOString(),
      url: `/uploads/documentos/${doc.filename}`
    }))
  };
};

// Método estático para búsqueda
indiciadoSchema.statics.buscar = function(ownerId, query) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    ownerId,
    activo: true,
    $or: [
      { nombre: searchRegex },
      { apellidos: searchRegex },
      { alias: searchRegex },
      { 'documentoIdentidad.numero': searchRegex },
      { sectorQueOpera: searchRegex }
    ]
  });
};

// Transform output
indiciadoSchema.methods.toJSON = function() {
  const indiciado = this.toObject();
  delete indiciado.__v;
  return indiciado;
};

module.exports = mongoose.model('Indiciado', indiciadoSchema);
