const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
  // Información básica del vehículo
  sectorQueOpera: {
    type: String,
    trim: true,
    maxLength: 200,
    default: ''
  },
  
  // Tipo de vehículo
  tipoVehiculo: {
    type: String,
    enum: ['Taxi', 'Automóvil', 'Motocicleta', 'Camioneta', 'Camión', 'Bus', 'Microbus', 'Furgón', 'Tractocamión', 'Otro'],
    required: true
  },
  
  // Información técnica del vehículo
  marca: {
    type: String,
    trim: true,
    maxLength: 100,
    default: ''
  },
  
  linea: {
    type: String,
    trim: true,
    maxLength: 100,
    default: ''
  },
  
  modelo: {
    type: String,
    trim: true,
    maxLength: 10,
    default: ''
  },
  
  // Identificación del vehículo
  placa: {
    type: String,
    trim: true,
    maxLength: 20,
    default: ''
  },
  
  numeroChasis: {
    type: String,
    trim: true,
    maxLength: 50,
    default: ''
  },
  
  numeroMotor: {
    type: String,
    trim: true,
    maxLength: 50,
    default: ''
  },
  
  // Características físicas
  color: {
    type: String,
    trim: true,
    maxLength: 50,
    default: ''
  },
  
  cilindraje: {
    type: String,
    trim: true,
    maxLength: 20,
    default: ''
  },
  
  combustible: {
    type: String,
    enum: ['Gasolina', 'Diesel', 'Gas', 'Eléctrico', 'Híbrido', 'Otro', ''],
    default: ''
  },
  
  // Información de propiedad
  propietario: {
    nombre: {
      type: String,
      trim: true,
      maxLength: 200,
      default: ''
    },
    documento: {
      tipo: {
        type: String,
        enum: ['CC', 'CE', 'TI', 'NIT', 'Pasaporte', 'Otro', ''],
        default: ''
      },
      numero: {
        type: String,
        trim: true,
        maxLength: 50,
        default: ''
      }
    },
    telefono: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    direccion: {
      type: String,
      trim: true,
      maxLength: 500,
      default: ''
    }
  },
  
  // Información legal
  soat: {
    numeroPoliza: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    vigencia: {
      type: Date
    },
    aseguradora: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    }
  },
  
  tecnomecanica: {
    numero: {
      type: String,
      trim: true,
      maxLength: 50,
      default: ''
    },
    vigencia: {
      type: Date
    },
    cda: {
      type: String,
      trim: true,
      maxLength: 100,
      default: ''
    }
  },
  
  // Estado del vehículo
  estado: {
    type: String,
    enum: ['Activo', 'Inmovilizado', 'Retenido', 'Decomisado', 'Destruido', 'Otro'],
    default: 'Activo'
  },
  
  // Información del incidente/caso
  fechaIncidente: {
    type: Date
  },
  
  lugarIncidente: {
    type: String,
    trim: true,
    maxLength: 500,
    default: ''
  },
  
  tipoIncidente: {
    type: String,
    trim: true,
    maxLength: 200,
    default: ''
  },
  
  // Observaciones y notas
  observaciones: {
    type: String,
    trim: true,
    maxLength: 2000,
    default: ''
  },
  
  caracteristicasParticulares: {
    type: String,
    trim: true,
    maxLength: 1000,
    default: ''
  },
  
  // Fotos del vehículo
  fotos: [{
    filename: {
      type: String,
      default: ''
    },
    originalName: {
      type: String,
      default: ''
    },
    descripcion: {
      type: String,
      trim: true,
      maxLength: 200,
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
    },
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Documentos relacionados (licencias, comparendos, etc.)
  documentosRelacionados: [{
    filename: String,
    originalName: String,
    descripcion: String,
    mimeType: String,
    size: Number,
    path: String,
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],
  
  // URL de Google Earth para ubicación del incidente
  googleEarthUrl: {
    type: String,
    trim: true,
    maxLength: 1000,
    default: ''
  },
  
  // Metadatos del registro
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Referencia al subsector
  subsectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sector',
    required: true
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
vehiculoSchema.index({ ownerId: 1 });
vehiculoSchema.index({ subsectorId: 1 });
vehiculoSchema.index({ placa: 1 });
vehiculoSchema.index({ marca: 1, linea: 1 });
vehiculoSchema.index({ tipoVehiculo: 1 });
vehiculoSchema.index({ activo: 1 });

// Virtual para identificación completa del vehículo
vehiculoSchema.virtual('identificacion').get(function() {
  const partes = [];
  if (this.marca) partes.push(this.marca);
  if (this.linea) partes.push(this.linea);
  if (this.modelo) partes.push(this.modelo);
  if (this.placa) partes.push(`Placa: ${this.placa}`);
  return partes.join(' ');
});

// Pre-remove middleware for cascade deletion cleanup
vehiculoSchema.pre('deleteMany', async function(next) {
  try {
    const query = this.getQuery();
    const vehiculos = await this.model.find(query);
    
    // Log deletion for audit
    console.log(`Deleting ${vehiculos.length} vehículos with cascade cleanup`);
    
    // TODO: Add file cleanup logic here if needed
    // for (const vehiculo of vehiculos) {
    //   if (vehiculo.fotos && vehiculo.fotos.length > 0) {
    //     // Delete photo files from filesystem
    //   }
    //   if (vehiculo.documentosRelacionados && vehiculo.documentosRelacionados.length > 0) {
    //     // Delete related document files
    //   }
    // }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to get photo URLs
vehiculoSchema.methods.getFotoUrls = function() {
  return this.fotos.map(foto => {
    if (foto.filename) {
      return {
        ...foto.toObject(),
        url: `/uploads/vehiculos/${foto.filename}`
      };
    }
    return foto;
  });
};

// Instance method to convert to dictionary format
vehiculoSchema.methods.toDict = async function() {
  const vehiculo = this.toObject();
  
  return {
    id: vehiculo._id,
    sectorQueOpera: vehiculo.sectorQueOpera,
    tipoVehiculo: vehiculo.tipoVehiculo,
    marca: vehiculo.marca,
    linea: vehiculo.linea,
    modelo: vehiculo.modelo,
    placa: vehiculo.placa,
    numeroChasis: vehiculo.numeroChasis,
    numeroMotor: vehiculo.numeroMotor,
    color: vehiculo.color,
    cilindraje: vehiculo.cilindraje,
    combustible: vehiculo.combustible,
    propietario: vehiculo.propietario,
    soat: {
      numeroPoliza: vehiculo.soat.numeroPoliza,
      vigencia: vehiculo.soat.vigencia ? vehiculo.soat.vigencia.toISOString().split('T')[0] : null,
      aseguradora: vehiculo.soat.aseguradora
    },
    tecnomecanica: {
      numero: vehiculo.tecnomecanica.numero,
      vigencia: vehiculo.tecnomecanica.vigencia ? vehiculo.tecnomecanica.vigencia.toISOString().split('T')[0] : null,
      cda: vehiculo.tecnomecanica.cda
    },
    estado: vehiculo.estado,
    fechaIncidente: vehiculo.fechaIncidente ? vehiculo.fechaIncidente.toISOString().split('T')[0] : null,
    lugarIncidente: vehiculo.lugarIncidente,
    tipoIncidente: vehiculo.tipoIncidente,
    observaciones: vehiculo.observaciones,
    caracteristicasParticulares: vehiculo.caracteristicasParticulares,
    fotos: this.getFotoUrls(),
    documentosRelacionados: vehiculo.documentosRelacionados,
    googleEarthUrl: vehiculo.googleEarthUrl,
    subsectorId: vehiculo.subsectorId,
    ownerId: vehiculo.ownerId,
    activo: vehiculo.activo,
    identificacion: this.identificacion,
    createdAt: vehiculo.createdAt,
    updatedAt: vehiculo.updatedAt
  };
};

// Método estático para búsqueda
vehiculoSchema.statics.buscar = function(ownerId, query) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    ownerId,
    activo: true,
    $or: [
      { placa: searchRegex },
      { marca: searchRegex },
      { linea: searchRegex },
      { 'propietario.nombre': searchRegex },
      { 'propietario.documento.numero': searchRegex },
      { sectorQueOpera: searchRegex },
      { numeroChasis: searchRegex },
      { numeroMotor: searchRegex }
    ]
  });
};

// Transform output
vehiculoSchema.methods.toJSON = function() {
  const vehiculo = this.toObject();
  delete vehiculo.__v;
  return vehiculo;
};

module.exports = mongoose.model('Vehiculo', vehiculoSchema);
