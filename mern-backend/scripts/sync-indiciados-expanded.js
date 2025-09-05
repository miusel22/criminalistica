const { sequelize } = require('../config/database');
const IndiciadoSimple = require('../models/sequelize/IndiciadoSimple');

async function syncIndiciadosExpanded() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🔄 Agregando campos adicionales a la tabla indiciados_simple...');
    
    // Sincronizar modelo con nuevos campos
    await IndiciadoSimple.sync({ alter: true });
    
    console.log('✅ Campos adicionales agregados exitosamente a indiciados_simple');
    
    // Verificar la estructura de la tabla
    const [results] = await sequelize.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'indiciados_simple' ORDER BY ordinal_position;"
    );
    
    console.log('\n📋 Estructura actual de la tabla:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error sincronizando modelo:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncIndiciadosExpanded()
    .then(() => {
      console.log('✅ Sincronización completada exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en sincronización:', error);
      process.exit(1);
    });
}

module.exports = { syncIndiciadosExpanded };
