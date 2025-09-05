const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const IndiciadoSimple = sequelize.define('IndiciadoSimple', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cedula: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  genero: {
    type: DataTypes.ENUM('Masculino', 'Femenino', 'Otro'),
    allowNull: true
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estadoCivil: {
    type: DataTypes.ENUM('Soltero', 'Casado', 'Unión Libre', 'Viudo', 'Divorciado', 'Separado'),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  direccion: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  ocupacion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('Activo', 'Capturado', 'Procesado', 'Condenado', 'Absuelto', 'Fugitivo', 'Fallecido', 'Otro'),
    allowNull: true,
    defaultValue: 'Activo'
  },
  fechaIngreso: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sectorQueOpera: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  subsectorId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  // Campos adicionales del documento de identidad
  tipoDocumento: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  expedidoEn: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  // Campos de fecha de nacimiento extendidos
  lugarNacimiento: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Campos de información personal adicional
  hijoDe: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  nacionalidad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  alias: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Campos académicos y laborales
  estudiosRealizados: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profesion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  oficio: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  // Campos de señales físicas
  estatura: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  peso: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  contexturaFisica: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  colorPiel: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  colorOjos: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  colorCabello: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  marcasEspeciales: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Campos de información delictiva
  bandaDelincuencial: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  delitosAtribuidos: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Campos de señales físicas detalladas
  complexion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  formaCara: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipoCabello: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  largoCabello: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  formaOjos: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  formaNariz: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  formaBoca: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  formaLabios: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // Campo para URL de Google Earth
  urlGoogleEarth: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'indiciados_simple',
  indexes: [
    { fields: ['ownerId'] },
    { fields: ['subsectorId'] },
    { fields: ['cedula'] },
    { fields: ['nombre', 'apellidos'] },
    { fields: ['activo'] },
    { fields: ['estado'] }
  ]
});

module.exports = IndiciadoSimple;
