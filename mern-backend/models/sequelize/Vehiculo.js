const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Vehiculo = sequelize.define('Vehiculo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Información básica del vehículo
  sectorQueOpera: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '',
    field: 'sector_que_opera'
  },
  tipoVehiculo: {
    type: DataTypes.ENUM('Taxi', 'Automóvil', 'Motocicleta', 'Camioneta', 'Camión', 'Bus', 'Microbus', 'Furgón', 'Tractocamión', 'Otro'),
    allowNull: false,
    field: 'tipo_vehiculo'
  },
  // Información técnica
  marca: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  linea: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  modelo: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: ''
  },
  // Identificación del vehículo
  placa: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: ''
  },
  numeroChasis: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '',
    field: 'numero_chasis'
  },
  numeroMotor: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '',
    field: 'numero_motor'
  },
  // Características físicas
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: ''
  },
  cilindraje: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: ''
  },
  combustible: {
    type: DataTypes.ENUM('Gasolina', 'Diesel', 'Gas', 'Eléctrico', 'Híbrido', 'Otro'),
    allowNull: true
  },
  // Información del propietario (como JSONB)
  propietario: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      nombre: '',
      documento: { tipo: '', numero: '' },
      telefono: '',
      direccion: ''
    }
  },
  // Información legal (como JSONB)
  soat: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      numeroPoliza: '',
      vigencia: null,
      aseguradora: ''
    }
  },
  tecnomecanica: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      numero: '',
      vigencia: null,
      cda: ''
    }
  },
  // Estado del vehículo
  estado: {
    type: DataTypes.ENUM('Activo', 'Inmovilizado', 'Retenido', 'Decomisado', 'Destruido', 'Otro'),
    allowNull: true,
    defaultValue: 'Activo'
  },
  // Información del incidente
  fechaIncidente: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_incidente'
  },
  lugarIncidente: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '',
    field: 'lugar_incidente'
  },
  tipoIncidente: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '',
    field: 'tipo_incidente'
  },
  // Observaciones
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  caracteristicasParticulares: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
    field: 'caracteristicas_particulares'
  },
  // Fotos del vehículo (como JSONB array)
  fotos: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  // Documentos relacionados (como JSONB array)
  documentosRelacionados: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'documentos_relacionados'
  },
  // URL de Google Earth
  googleEarthUrl: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    defaultValue: '',
    field: 'google_earth_url'
  },
  // Metadatos del registro
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id'
  },
  subsectorId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'subsector_id'
  },
  // Estado del registro
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'vehiculos',
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['subsector_id'] },
    { fields: ['placa'] },
    { fields: ['marca', 'linea'] },
    { fields: ['tipo_vehiculo'] },
    { fields: ['activo'] },
    { fields: ['estado'] }
  ]
});

// Métodos de instancia
Vehiculo.prototype.getFotoUrls = function() {
  if (!this.fotos || !Array.isArray(this.fotos)) return [];
  
  return this.fotos.map(foto => {
    // Si ya tiene una URL de Cloudinary, usarla
    if (foto.url && foto.url.includes('cloudinary.com')) {
      return foto;
    }
    // Si tiene path de Cloudinary, usarlo como URL
    if (foto.path && foto.path.includes('cloudinary.com')) {
      return {
        ...foto,
        url: foto.path
      };
    }
    // Fallback para archivos locales (desarrollo)
    if (foto.filename) {
      return {
        ...foto,
        url: `/uploads/vehiculos/${foto.filename}`
      };
    }
    return foto;
  });
};

Vehiculo.prototype.getDocumentosRelacionadosUrls = function() {
  const docs = this.documentosRelacionados || [];
  
  if (!Array.isArray(docs)) {
    console.log('⚠️ documentosRelacionados no es array:', typeof docs);
    return [];
  }
  
  return docs.map(documento => {
    // Si ya tiene una URL de Cloudinary, usarla
    if (documento.url && documento.url.includes('cloudinary.com')) {
      return documento;
    }
    // Si tiene path de Cloudinary, usarlo como URL
    if (documento.path && documento.path.includes('cloudinary.com')) {
      return {
        ...documento,
        url: documento.path
      };
    }
    // Fallback para archivos locales (desarrollo)
    if (documento.filename) {
      return {
        ...documento,
        url: `/uploads/vehiculos/documentos/${documento.filename}`
      };
    }
    return documento;
  });
};

Vehiculo.prototype.toDict = function() {
  const vehiculo = this.toJSON();
  
  return {
    id: vehiculo.id,
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
      numeroPoliza: vehiculo.soat?.numeroPoliza || '',
      vigencia: vehiculo.soat?.vigencia ? new Date(vehiculo.soat.vigencia).toISOString().split('T')[0] : null,
      aseguradora: vehiculo.soat?.aseguradora || ''
    },
    tecnomecanica: {
      numero: vehiculo.tecnomecanica?.numero || '',
      vigencia: vehiculo.tecnomecanica?.vigencia ? new Date(vehiculo.tecnomecanica.vigencia).toISOString().split('T')[0] : null,
      cda: vehiculo.tecnomecanica?.cda || ''
    },
    estado: vehiculo.estado,
    fechaIncidente: vehiculo.fechaIncidente ? new Date(vehiculo.fechaIncidente).toISOString().split('T')[0] : null,
    lugarIncidente: vehiculo.lugarIncidente,
    tipoIncidente: vehiculo.tipoIncidente,
    observaciones: vehiculo.observaciones,
    caracteristicasParticulares: vehiculo.caracteristicasParticulares,
    fotos: this.getFotoUrls(),
    documentosRelacionados: this.getDocumentosRelacionadosUrls(),
    googleEarthUrl: vehiculo.googleEarthUrl,
    subsectorId: vehiculo.subsectorId,
    ownerId: vehiculo.ownerId,
    activo: vehiculo.activo,
    identificacion: this.getIdentificacion(),
    createdAt: vehiculo.createdAt,
    updatedAt: vehiculo.updatedAt
  };
};

Vehiculo.prototype.getIdentificacion = function() {
  const partes = [];
  if (this.marca) partes.push(this.marca);
  if (this.linea) partes.push(this.linea);
  if (this.modelo) partes.push(this.modelo);
  if (this.placa) partes.push(`Placa: ${this.placa}`);
  return partes.join(' ') || 'Sin identificación';
};

// Métodos estáticos
Vehiculo.buscar = function(ownerId, query) {
  const searchTerm = `%${query}%`;
  
  return this.findAll({
    where: {
      ownerId,
      activo: true,
      [sequelize.Sequelize.Op.or]: [
        { placa: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { marca: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { linea: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { 'propietario.nombre': { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { 'propietario.documento.numero': { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { sectorQueOpera: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { numeroChasis: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { numeroMotor: { [sequelize.Sequelize.Op.iLike]: searchTerm } }
      ]
    },
    limit: 50
  });
};

module.exports = Vehiculo;
