const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
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
  // For hierarchical structure: null = sector, parentId = subsector
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    default: null
  },
  // Type to differentiate between sector, subsector, and indiciado
  type: {
    type: String,
    enum: ['sector', 'subsector', 'indiciado'],
    required: true,
    default: 'sector'
  },
  // Optional description field
  descripcion: {
    type: String,
    trim: true,
    maxLength: 500
  },
  // Location information (only for sectors, not subsectors or indiciados)
  ubicacion: {
    departamento: {
      id: {
        type: String,
        trim: true
      },
      nombre: {
        type: String,
        trim: true
      }
    },
    ciudad: {
      id: {
        type: String,
        trim: true
      },
      nombre: {
        type: String,
        trim: true
      }
    },
    // Allow custom cities not in the official list
    ciudadPersonalizada: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate names at the same level and type
sectorSchema.index({ 
  ownerId: 1, 
  parentId: 1, 
  nombre: 1, 
  type: 1 
}, { unique: true });

// Virtual for child elements (subsectors for sectors, indiciados for subsectors)
sectorSchema.virtual('children', {
  ref: 'Sector',
  localField: '_id',
  foreignField: 'parentId'
});

// Instance method to convert to dictionary format
sectorSchema.methods.toDict = async function(includeChildren = false, maxDepth = 2, currentDepth = 0) {
  const sector = this.toObject();
  
  const result = {
    id: sector._id,
    nombre: sector.nombre,
    owner_id: sector.ownerId,
    parent_id: sector.parentId,
    type: sector.type,
    descripcion: sector.descripcion,
    ubicacion: sector.ubicacion,
    created_at: sector.createdAt,
    updated_at: sector.updatedAt
  };
  
  // Include children if requested and within depth limits
  if (includeChildren && currentDepth < maxDepth) {
    if (sector.type === 'sector') {
      // Get subsectors from Sector table
      result.subsectores = [];
      const subsectores = await mongoose.model('Sector')
        .find({ 
          parentId: this._id, 
          type: 'subsector' 
        })
        .sort({ nombre: 1 })
        .lean();
        
      for (const subsector of subsectores) {
        const subsectorInstance = new (mongoose.model('Sector'))(subsector);
        const subsectorData = await subsectorInstance.toDict(true, maxDepth, currentDepth + 1);
        result.subsectores.push(subsectorData);
      }
    } else if (sector.type === 'subsector') {
      // Get indiciados from Indiciado table (not from Sector table)
      result.indiciados = [];
      const Indiciado = mongoose.model('Indiciado');
      const indiciados = await Indiciado
        .find({ 
          subsectorId: this._id,
          activo: true
        })
        .sort({ nombre: 1, apellidos: 1 })
        .lean();
        
      for (const indiciado of indiciados) {
        result.indiciados.push({
          id: indiciado._id,
          nombre: `${indiciado.nombre} ${indiciado.apellidos}`,
          owner_id: indiciado.ownerId,
          parent_id: indiciado.subsectorId,
          type: 'indiciado',
          descripcion: indiciado.documentoIdentidad?.numero ? `Documento: ${indiciado.documentoIdentidad.numero}` : 'Sin documento',
          // Campos adicionales para mostrar en la UI
          documentoNumero: indiciado.documentoIdentidad?.numero,
          edad: indiciado.edad,
          profesion: indiciado.profesion,
          delitosAtribuidos: indiciado.delitosAtribuidos,
          situacionJuridica: indiciado.situacionJuridica,
          foto: indiciado.foto?.filename,
          fotoUrl: indiciado.foto?.filename ? `/uploads/${indiciado.foto.filename}` : null,
          created_at: indiciado.createdAt,
          updated_at: indiciado.updatedAt
        });
      }
      
      // Get vehículos from Vehiculo table
      result.vehiculos = [];
      const Vehiculo = mongoose.model('Vehiculo');
      const vehiculos = await Vehiculo
        .find({ 
          subsectorId: this._id,
          activo: true
        })
        .sort({ marca: 1, linea: 1, placa: 1 })
        .lean();
        
      for (const vehiculo of vehiculos) {
        result.vehiculos.push({
          id: vehiculo._id,
          nombre: `${vehiculo.marca} ${vehiculo.linea} - ${vehiculo.placa}`.trim(),
          owner_id: vehiculo.ownerId,
          parent_id: vehiculo.subsectorId,
          type: 'vehiculo',
          descripcion: vehiculo.tipoVehiculo ? `Tipo: ${vehiculo.tipoVehiculo}` : 'Sin tipo especificado',
          // Campos adicionales para mostrar en la UI
          marca: vehiculo.marca,
          linea: vehiculo.linea,
          modelo: vehiculo.modelo,
          placa: vehiculo.placa,
          tipoVehiculo: vehiculo.tipoVehiculo,
          color: vehiculo.color,
          estado: vehiculo.estado,
          propietario: vehiculo.propietario?.nombre,
          fotos: vehiculo.fotos?.length > 0 ? vehiculo.fotos : [],
          fotoUrl: vehiculo.fotos?.length > 0 ? `/uploads/vehiculos/${vehiculo.fotos[0].filename}` : null,
          created_at: vehiculo.createdAt,
          updated_at: vehiculo.updatedAt
        });
      }
    }
  }
  
  return result;
};

// Static method to get sector hierarchy for a user or global access
sectorSchema.statics.getSectorHierarchy = async function(ownerId = null) {
  // Build query based on whether ownerId is provided
  const query = {
    type: 'sector',
    parentId: null
  };
  
  // Only filter by ownerId if provided (for backward compatibility)
  if (ownerId !== null && ownerId !== undefined) {
    query.ownerId = ownerId;
  }
  
  const sectors = await this.find(query).sort({ nombre: 1 });
  
  const result = [];
  for (const sector of sectors) {
    const sectorData = await sector.toDict(true);
    result.push(sectorData);
  }
  
  return result;
};

// Static method to validate parent-child relationship
sectorSchema.statics.validateHierarchy = async function(parentId, childType, userId, userRole = 'viewer') {
  if (!parentId) {
    // Root level - only sectors allowed
    return childType === 'sector';
  }
  
  // For admin/editor users, don't restrict by ownership
  let query = { _id: parentId };
  if (!['admin', 'editor'].includes(userRole)) {
    query.ownerId = userId;
  }
  
  const parent = await this.findOne(query);
  if (!parent) {
    const errorMsg = ['admin', 'editor'].includes(userRole) 
      ? 'Parent not found' 
      : 'Parent not found or doesn\'t belong to user';
    throw new Error(errorMsg);
  }
  
  // Validate hierarchy rules
  if (parent.type === 'sector' && childType === 'subsector') {
    return true;
  } else if (parent.type === 'subsector' && childType === 'indiciado') {
    return true;
  } else {
    throw new Error(`Invalid hierarchy: cannot create ${childType} under ${parent.type}`);
  }
};

// Pre-save validation
sectorSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified('parentId') || this.isModified('type')) {
      // For pre-save validation, we assume admin privileges if no user context
      // The actual role validation should happen at the controller level
      await mongoose.model('Sector').validateHierarchy(
        this.parentId, 
        this.type, 
        this.ownerId,
        'admin' // Default to admin to allow flexibility
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-remove middleware to handle cascade deletion
sectorSchema.pre('findOneAndDelete', async function(next) {
  try {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (docToDelete) {
      await deleteChildren(docToDelete._id);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-remove middleware for deleteMany operations
sectorSchema.pre('deleteMany', async function(next) {
  try {
    const query = this.getQuery();
    const docsToDelete = await this.model.find(query);
    
    for (const doc of docsToDelete) {
      await deleteChildren(doc._id);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

async function deleteChildren(parentId) {
  const children = await mongoose.model('Sector').find({ parentId: parentId });

  for (const child of children) {
    // If the child is a subsector, it might have more children
    if (child.type === 'subsector') {
      await deleteChildren(child._id); // Recursive call
    }
    
    // If the child is a subsector, delete related indiciados and vehículos
    if (child.type === 'subsector') {
      await mongoose.model('Indiciado').deleteMany({ subsectorId: child._id });
      await mongoose.model('Vehiculo').deleteMany({ subsectorId: child._id });
    }

    // Delete the child itself
    await mongoose.model('Sector').findByIdAndDelete(child._id);
  }
}

// Transform output
sectorSchema.methods.toJSON = function() {
  const sector = this.toObject();
  delete sector.__v;
  return sector;
};

module.exports = mongoose.model('Sector', sectorSchema);
