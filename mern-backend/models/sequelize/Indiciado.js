const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Indiciado = sequelize.define('Indiciado', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Información básica del indiciado
  sectorQueOpera: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '',
    field: 'sector_que_opera'
  },
  // Datos personales
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  alias: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  // Documento de identidad (como JSONB)
  documentoIdentidad: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      tipo: '',
      numero: '',
      expedidoEn: ''
    },
    field: 'documento_identidad'
  },
  // Fecha de nacimiento (como JSONB)
  fechaNacimiento: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      fecha: null,
      lugar: ''
    },
    field: 'fecha_nacimiento'
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 120
    }
  },
  // Información familiar
  hijoDe: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '',
    field: 'hijo_de'
  },
  // Género
  genero: {
    type: DataTypes.ENUM('Masculino', 'Femenino', 'Otro'),
    allowNull: true
  },
  // Estado civil
  estadoCivil: {
    type: DataTypes.ENUM('Soltero', 'Casado', 'Unión Libre', 'Viudo', 'Divorciado', 'Separado'),
    allowNull: true,
    field: 'estado_civil'
  },
  // Nacionalidad
  nacionalidad: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  // Información de contacto
  residencia: {
    type: DataTypes.STRING(300),
    allowNull: true,
    defaultValue: ''
  },
  direccion: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: ''
  },
  telefono: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: ''
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '',
    validate: {
      isEmail: {
        msg: 'Debe ser un email válido'
      },
      len: [0, 255]
    },
    set(value) {
      // Si el valor está vacío, establecerlo como null para evitar validación de email
      if (!value || value.trim() === '') {
        this.setDataValue('email', null);
      } else {
        this.setDataValue('email', value.trim());
      }
    }
  },
  // Información académica y laboral
  estudiosRealizados: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '',
    field: 'estudios_realizados'
  },
  profesion: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  oficio: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  // Información física (como JSONB)
  senalesFisicas: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      estatura: '',
      peso: '',
      contexturaFisica: '',
      colorPiel: '',
      colorOjos: '',
      colorCabello: '',
      marcasEspeciales: '',
      tatuajes: '',
      cicatrices: '',
      piercing: '',
      deformidades: '',
      otras: ''
    },
    field: 'senales_fisicas'
  },
  // Señales físicas detalladas adicionales (como JSONB)
  senalesFisicasDetalladas: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      complexion: '',
      formaCara: '',
      tipoCabello: '',
      largoCabello: '',
      formaOjos: '',
      formaNariz: '',
      formaBoca: '',
      formaLabios: ''
    },
    field: 'senales_fisicas_detalladas'
  },
  // Información médica (como JSONB)
  informacionMedica: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      enfermedades: '',
      medicamentos: '',
      alergias: '',
      discapacidades: '',
      adicciones: '',
      tratamientos: ''
    },
    field: 'informacion_medica'
  },
  // Información del delito (como JSONB)
  informacionDelito: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      fechaDelito: null,
      lugarDelito: '',
      tipoDelito: '',
      modalidad: '',
      descripcionHechos: '',
      victimas: [],
      testigos: [],
      coautores: []
    },
    field: 'informacion_delito'
  },
  // Información judicial (como JSONB)
  informacionJudicial: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      numeroRadicado: '',
      fiscalAsignado: '',
      juzgado: '',
      estadoProceso: '',
      fechaCaptura: null,
      lugarCaptura: '',
      ordenesPendientes: [],
      antecedentes: []
    },
    field: 'informacion_judicial'
  },
  // Información policial (como JSONB)
  informacionPolicial: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      unidadCaptura: '',
      investigadorAsignado: '',
      numeroInvestigacion: '',
      clasificacionRiesgo: '',
      observacionesEspeciales: ''
    },
    field: 'informacion_policial'
  },
  // Estado actual
  estado: {
    type: DataTypes.ENUM('Activo', 'Capturado', 'Procesado', 'Condenado', 'Absuelto', 'Fugitivo', 'Fallecido', 'Otro'),
    allowNull: true,
    defaultValue: 'Activo'
  },
  // Foto principal
  foto: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      filename: '',
      originalName: '',
      mimeType: '',
      size: 0,
      path: '',
      fechaSubida: null
    }
  },
  // Fotos adicionales (como JSONB array)
  fotosAdicionales: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'fotos_adicionales'
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
  
  // Campos individuales de información delictiva
  bandaDelincuencial: {
    type: DataTypes.STRING(300),
    allowNull: true,
    defaultValue: '',
    field: 'banda_delincuencial'
  },
  delitosAtribuidos: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
    field: 'delitos_atribuidos'
  },
  situacionJuridica: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
    field: 'situacion_juridica'
  },
  antecedentes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  
  // Observaciones generales
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  // Metadatos del registro
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id'
  },
  subsectorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'subsector_id'
  },
  // Estado del registro
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'indiciados',
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['subsector_id'] },
    { fields: ['nombre', 'apellidos'] },
    { fields: ['alias'] },
    { fields: ['activo'] },
    { fields: ['estado'] },
    // Índice compuesto para búsquedas por documento
    { fields: [{ attribute: 'documento_identidad', operator: 'jsonb_ops' }], using: 'gin' },
    // Índice GIN para señales físicas detalladas
    { fields: [{ attribute: 'senales_fisicas_detalladas', operator: 'jsonb_ops' }], using: 'gin' }
  ]
});

// Métodos de instancia
Indiciado.prototype.getFotoUrl = function() {
  if (this.foto) {
    // Si ya tiene una URL de Cloudinary, usarla
    if (this.foto.url && this.foto.url.includes('cloudinary.com')) {
      return this.foto.url;
    }
    // Si tiene path de Cloudinary, usarlo como URL
    if (this.foto.path && this.foto.path.includes('cloudinary.com')) {
      return this.foto.path;
    }
    // Fallback para archivos locales (desarrollo)
    if (this.foto.filename) {
      return `/uploads/${this.foto.filename}`;
    }
  }
  return null;
};

Indiciado.prototype.getFotosAdicionalesUrls = function() {
  if (!this.fotosAdicionales || !Array.isArray(this.fotosAdicionales)) return [];
  
  return this.fotosAdicionales.map(foto => {
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
        url: `/uploads/${foto.filename}`
      };
    }
    return foto;
  });
};

Indiciado.prototype.getDocumentosRelacionadosUrls = function() {
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
        url: `/uploads/documentos/${documento.filename}`
      };
    }
    return documento;
  });
};

Indiciado.prototype.getNombreCompleto = function() {
  return `${this.nombre} ${this.apellidos}`.trim();
};

Indiciado.prototype.getEdadCalculada = function() {
  if (this.fechaNacimiento && this.fechaNacimiento.fecha) {
    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento.fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad >= 0 ? edad : null;
  }
  return this.edad || null;
};

Indiciado.prototype.toDict = function() {
  const indiciado = this.toJSON();
  
  return {
    id: indiciado.id,
    sectorQueOpera: indiciado.sectorQueOpera,
    nombre: indiciado.nombre,
    apellidos: indiciado.apellidos,
    alias: indiciado.alias,
    documentoIdentidad: indiciado.documentoIdentidad,
    fechaNacimiento: indiciado.fechaNacimiento,
    edad: this.getEdadCalculada(),
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
    informacionMedica: indiciado.informacionMedica,
    informacionDelito: indiciado.informacionDelito,
    informacionJudicial: indiciado.informacionJudicial,
    informacionPolicial: indiciado.informacionPolicial,
    estado: indiciado.estado,
    foto: this.foto ? { ...this.foto, url: this.getFotoUrl() } : null,
    fotosAdicionales: this.getFotosAdicionalesUrls(),
    documentosRelacionados: this.getDocumentosRelacionadosUrls(),
    googleEarthUrl: indiciado.googleEarthUrl,
    observaciones: indiciado.observaciones,
    bandaDelincuencial: indiciado.bandaDelincuencial,
    delitosAtribuidos: indiciado.delitosAtribuidos,
    situacionJuridica: indiciado.situacionJuridica,
    antecedentes: indiciado.antecedentes,
    subsectorId: indiciado.subsectorId,
    ownerId: indiciado.ownerId,
    activo: indiciado.activo,
    nombreCompleto: this.getNombreCompleto(),
    createdAt: indiciado.createdAt,
    updatedAt: indiciado.updatedAt
  };
};

// Métodos estáticos
Indiciado.buscar = function(ownerId, query) {
  const searchTerm = `%${query}%`;
  
  return this.findAll({
    where: {
      ownerId,
      activo: true,
      [sequelize.Sequelize.Op.or]: [
        { nombre: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { apellidos: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        { alias: { [sequelize.Sequelize.Op.iLike]: searchTerm } },
        // Buscar en documento de identidad (JSONB)
        sequelize.where(
          sequelize.cast(sequelize.col('documento_identidad'), 'text'),
          { [sequelize.Sequelize.Op.iLike]: searchTerm }
        ),
        { sectorQueOpera: { [sequelize.Sequelize.Op.iLike]: searchTerm } }
      ]
    },
    limit: 50
  });
};

module.exports = Indiciado;
