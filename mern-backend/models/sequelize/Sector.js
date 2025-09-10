const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Sector = sequelize.define('Sector', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  ubicacion: {
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
    validate: {
      isEmail: true
    }
  },
  // Jefe del sector
  jefeNombre: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'jefe_nombre'
  },
  jefeCargo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'jefe_cargo'
  },
  jefeContacto: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'jefe_contacto'
  },
  // Configuración adicional
  configuracion: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  // Metadatos del registro
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id'
  },
  // Jerarquía
  type: {
    type: DataTypes.ENUM('sector', 'subsector'),
    allowNull: false,
    defaultValue: 'sector'
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'parent_id'
  },
  // Estado del registro
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Orden de visualización
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'sectors',
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['parent_id'] },
    { fields: ['type'] },
    { fields: ['activo'] },
    { fields: ['nombre'] },
    { unique: true, fields: ['codigo'], name: 'sectors_codigo_unique', where: { codigo: { [sequelize.Sequelize.Op.ne]: null } } }
  ]
});

// Relaciones
Sector.hasMany(Sector, {
  as: 'subsectores',
  foreignKey: 'parentId',
  onDelete: 'CASCADE'
});

Sector.belongsTo(Sector, {
  as: 'parent',
  foreignKey: 'parentId'
});

// Métodos de instancia
Sector.prototype.toDict = function() {
  const sector = this.toJSON();
  return {
    id: sector.id,
    nombre: sector.nombre,
    descripcion: sector.descripcion,
    codigo: sector.codigo,
    ubicacion: sector.ubicacion,
    telefono: sector.telefono,
    email: sector.email,
    jefe: {
      nombre: sector.jefeNombre,
      cargo: sector.jefeCargo,
      contacto: sector.jefeContacto
    },
    configuracion: sector.configuracion,
    type: sector.type,
    parentId: sector.parentId,
    ownerId: sector.ownerId,
    activo: sector.activo,
    orden: sector.orden,
    createdAt: sector.createdAt,
    updatedAt: sector.updatedAt,
    // Incluir subsectores si están cargados
    subsectores: sector.subsectores || []
  };
};

// Métodos estáticos
// Obtiene jerarquía de sectores. Si se pasa ownerId, puede usarse para filtrar; si es null/undefined, devuelve global.
Sector.getHierarchy = async function(ownerId, includeInactive = false) {
  const whereClause = { type: 'sector' };
  if (!includeInactive) {
    whereClause.activo = true;
  }
  // Solo filtrar por ownerId si viene definido de forma explícita
  if (ownerId) {
    whereClause.ownerId = ownerId;
  }

  const sectores = await this.findAll({
    where: whereClause,
    include: [{
      model: Sector,
      as: 'subsectores',
      where: includeInactive ? {} : { activo: true },
      required: false,
      include: [
        // Aquí incluiremos indiciados y vehículos cuando los migremos
      ]
    }],
    order: [
      ['orden', 'ASC'],
      ['nombre', 'ASC'],
      [{ model: Sector, as: 'subsectores' }, 'orden', 'ASC'],
      [{ model: Sector, as: 'subsectores' }, 'nombre', 'ASC']
    ]
  });

  return sectores.map(sector => sector.toDict());
};

// Busca sectores de forma global si ownerId no se provee
Sector.searchAll = async function(ownerId, searchTerm) {
  const searchRegex = `%${searchTerm}%`;
  const whereClause = {
    activo: true,
    [sequelize.Sequelize.Op.or]: [
      { nombre: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
      { descripcion: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
      { codigo: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
      { ubicacion: { [sequelize.Sequelize.Op.iLike]: searchRegex } }
    ]
  };
  // Solo limitar por ownerId si se envía de forma explícita
  if (ownerId) {
    whereClause.ownerId = ownerId;
  }

  const results = await this.findAll({
    where: whereClause,
    limit: 50
  });

  return {
    resultados: results.map(item => item.toDict()),
    total: results.length
  };
};

module.exports = Sector;
