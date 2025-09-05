const { sequelize } = require('./config/database');
const IndiciadoSimple = require('./models/sequelize/IndiciadoSimple');

async function syncIndiciadosSimple() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    console.log('Sincronizando modelo IndiciadoSimple...');
    await IndiciadoSimple.sync({ force: true });
    console.log('Tabla indiciados_simple creada/actualizada exitosamente.');

    console.log('Sincronización completada.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la sincronización:', error);
    process.exit(1);
  }
}

syncIndiciadosSimple();
