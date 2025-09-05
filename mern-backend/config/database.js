const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de conexión a PostgreSQL
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'criminalistica_db',
  process.env.POSTGRES_USER || 'criminalistica_user', 
  process.env.POSTGRES_PASSWORD || 'criminalistica_pass',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      underscored: false // Usar camelCase en lugar de snake_case
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
