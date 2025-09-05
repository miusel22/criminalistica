const { sequelize } = require('../../config/database');

// Importar todos los modelos
const User = require('./User');
const Sector = require('./Sector');
const Vehiculo = require('./Vehiculo');
const Indiciado = require('./Indiciado');
const InvitationCode = require('./InvitationCode');

// Definir todas las relaciones entre modelos

// === RELACIONES DE USER ===
// Un usuario puede tener muchos sectores
User.hasMany(Sector, {
  foreignKey: 'ownerId',
  as: 'sectores',
  onDelete: 'CASCADE'
});

// Un usuario puede tener muchos vehículos
User.hasMany(Vehiculo, {
  foreignKey: 'ownerId',
  as: 'vehiculos',
  onDelete: 'CASCADE'
});

// Un usuario puede tener muchos indiciados
User.hasMany(Indiciado, {
  foreignKey: 'ownerId',
  as: 'indiciados',
  onDelete: 'CASCADE'
});

// Un usuario puede enviar muchas invitaciones
User.hasMany(InvitationCode, {
  foreignKey: 'invitedBy',
  as: 'sentInvitations',
  onDelete: 'CASCADE'
});

// Un usuario puede usar muchas invitaciones (pero solo una por invitación)
User.hasMany(InvitationCode, {
  foreignKey: 'usedBy',
  as: 'usedInvitations',
  onDelete: 'SET NULL'
});

// === RELACIONES DE SECTOR ===
// Un sector pertenece a un usuario
Sector.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner'
});

// Un sector puede tener muchos vehículos (a través de subsectores)
Sector.hasMany(Vehiculo, {
  foreignKey: 'subsectorId',
  as: 'vehiculos',
  onDelete: 'CASCADE'
});

// Un sector puede tener muchos indiciados (a través de subsectores)
Sector.hasMany(Indiciado, {
  foreignKey: 'subsectorId',
  as: 'indiciados',
  onDelete: 'CASCADE'
});

// === RELACIONES DE VEHICULO ===
// Un vehículo pertenece a un usuario
Vehiculo.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner'
});

// Un vehículo pertenece a un subsector
Vehiculo.belongsTo(Sector, {
  foreignKey: 'subsectorId',
  as: 'subsector'
});

// === RELACIONES DE INDICIADO ===
// Un indiciado pertenece a un usuario
Indiciado.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner'
});

// Un indiciado pertenece a un subsector
Indiciado.belongsTo(Sector, {
  foreignKey: 'subsectorId',
  as: 'subsector'
});

// === RELACIONES DE INVITATION CODE ===
// Una invitación pertenece al usuario que la envió
InvitationCode.belongsTo(User, {
  foreignKey: 'invitedBy',
  as: 'inviter'
});

// Una invitación puede pertenecer al usuario que la usó
InvitationCode.belongsTo(User, {
  foreignKey: 'usedBy',
  as: 'user'
});

// === ACTUALIZAR MÉTODO getHierarchy DE SECTOR ===
// Redefinir el método para incluir indiciados y vehículos
Sector.getHierarchy = async function(ownerId, includeInactive = false) {
  const whereClause = { ownerId, type: 'sector' };
  if (!includeInactive) {
    whereClause.activo = true;
  }

  const sectores = await this.findAll({
    where: whereClause,
    include: [{
      model: Sector,
      as: 'subsectores',
      where: includeInactive ? {} : { activo: true },
      required: false,
      include: [
        {
          model: Indiciado,
          as: 'indiciados',
          where: includeInactive ? {} : { activo: true },
          required: false
        },
        {
          model: Vehiculo,
          as: 'vehiculos',
          where: includeInactive ? {} : { activo: true },
          required: false
        }
      ]
    }],
    order: [
      ['orden', 'ASC'],
      ['nombre', 'ASC'],
      [{ model: Sector, as: 'subsectores' }, 'orden', 'ASC'],
      [{ model: Sector, as: 'subsectores' }, 'nombre', 'ASC']
    ]
  });

  return sectores.map(sector => {
    const sectorDict = sector.toDict();
    
    // Procesar subsectores con sus indiciados y vehículos
    if (sector.subsectores) {
      sectorDict.subsectores = sector.subsectores.map(subsector => {
        const subsectorDict = subsector.toDict();
        
        // Agregar indiciados
        if (subsector.indiciados) {
          subsectorDict.indiciados = subsector.indiciados.map(indiciado => ({
            ...indiciado.toDict(),
            type: 'indiciado'
          }));
        } else {
          subsectorDict.indiciados = [];
        }
        
        // Agregar vehículos
        if (subsector.vehiculos) {
          subsectorDict.vehiculos = subsector.vehiculos.map(vehiculo => ({
            ...vehiculo.toDict(),
            type: 'vehiculo'
          }));
        } else {
          subsectorDict.vehiculos = [];
        }
        
        subsectorDict.type = 'subsector';
        return subsectorDict;
      });
    }
    
    sectorDict.type = 'sector';
    return sectorDict;
  });
};

// === BUSQUEDA GLOBAL ===
Sector.searchAll = async function(ownerId, searchTerm) {
  const searchRegex = `%${searchTerm}%`;
  
  // Buscar en sectores
  const sectoresResults = await this.findAll({
    where: {
      ownerId,
      activo: true,
      [sequelize.Sequelize.Op.or]: [
        { nombre: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
        { descripcion: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
        { codigo: { [sequelize.Sequelize.Op.iLike]: searchRegex } }
      ]
    },
    limit: 25
  });
  
  // Buscar en indiciados
  const indiciadosResults = await Indiciado.findAll({
    where: {
      ownerId,
      activo: true,
      [sequelize.Sequelize.Op.or]: [
        { nombre: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
        { apellidos: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
        { alias: { [sequelize.Sequelize.Op.iLike]: searchRegex } }
      ]
    },
    limit: 25
  });
  
  // Buscar en vehículos
  const vehiculosResults = await Vehiculo.findAll({
    where: {
      ownerId,
      activo: true,
      [sequelize.Sequelize.Op.or]: [
        { placa: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
        { marca: { [sequelize.Sequelize.Op.iLike]: searchRegex } },
        { linea: { [sequelize.Sequelize.Op.iLike]: searchRegex } }
      ]
    },
    limit: 25
  });
  
  const resultados = [
    ...sectoresResults.map(item => ({ ...item.toDict(), type: item.type })),
    ...indiciadosResults.map(item => ({ ...item.toDict(), type: 'indiciado' })),
    ...vehiculosResults.map(item => ({ ...item.toDict(), type: 'vehiculo' }))
  ];
  
  return {
    resultados,
    total: resultados.length
  };
};

// Función para probar la conexión a PostgreSQL
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
    return false;
  }
};

// Función para sincronizar todas las tablas
const syncDatabase = async (force = false) => {
  try {
    console.log('🔄 Sincronizando modelos con PostgreSQL...');
    
    // Sincronizar en orden de dependencias
    await User.sync({ force });
    await Sector.sync({ force });
    await Indiciado.sync({ force });
    await Vehiculo.sync({ force });
    await InvitationCode.sync({ force });
    
    console.log('✅ Todos los modelos sincronizados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Sector,
  Vehiculo,
  Indiciado,
  InvitationCode,
  testConnection,
  syncDatabase
};
