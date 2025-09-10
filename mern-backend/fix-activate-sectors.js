const { Sector } = require('./models/sequelize');
const { testConnection } = require('./models/sequelize');

async function activateAllSectors() {
  try {
    console.log('🔧 Activando sectores inactivos...\n');
    
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ No se pudo conectar a la base de datos');
      return;
    }

    // 1. Ver sectores inactivos
    console.log('📊 Sectores inactivos encontrados:');
    const inactiveSectors = await Sector.findAll({
      where: { activo: false },
      attributes: ['id', 'nombre', 'type', 'activo']
    });

    if (inactiveSectors.length === 0) {
      console.log('✅ No hay sectores inactivos');
      return;
    }

    inactiveSectors.forEach((sector, index) => {
      console.log(`${index + 1}. "${sector.nombre}" (${sector.type})`);
    });

    console.log(`\n🔄 Activando ${inactiveSectors.length} sectores...`);

    // 2. Activar TODOS los sectores
    const [updatedCount] = await Sector.update(
      { activo: true },
      { 
        where: { activo: false },
        returning: true
      }
    );

    console.log(`✅ ${updatedCount} sectores activados exitosamente!`);

    // 3. Verificar resultado
    console.log('\n📈 Verificando resultado:');
    const activeSectors = await Sector.findAll({
      where: { 
        type: 'sector',
        activo: true 
      },
      attributes: ['nombre', 'type'],
      order: [['nombre', 'ASC']]
    });

    console.log(`✅ Sectores activos ahora: ${activeSectors.length}`);
    activeSectors.forEach((sector, index) => {
      console.log(`${index + 1}. ${sector.nombre}`);
    });

    console.log('\n🎉 ¡Listo! Ahora deberías poder ver los sectores en tu app.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

activateAllSectors();
