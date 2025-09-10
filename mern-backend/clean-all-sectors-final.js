const { Sector, Indiciado, Vehiculo } = require('./models/sequelize');
const { testConnection } = require('./models/sequelize');

async function cleanAllSectorsAndData() {
  try {
    console.log('🧹 Limpiando TODOS los sectores, subsectores, indiciados y vehículos...\n');
    
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ No se pudo conectar a la base de datos');
      return;
    }

    // 1. Ver qué hay actualmente
    console.log('📊 Estado actual de la base de datos:');
    const allSectors = await Sector.findAll({
      attributes: ['id', 'nombre', 'type', 'activo']
    });
    
    const allIndiciados = await Indiciado.findAll({
      attributes: ['id', 'nombre', 'apellidos', 'activo']
    });
    
    const allVehiculos = await Vehiculo.findAll({
      attributes: ['id', 'marca', 'placa', 'activo']
    });

    console.log(`- Sectores/Subsectores: ${allSectors.length}`);
    console.log(`- Indiciados: ${allIndiciados.length}`);
    console.log(`- Vehículos: ${allVehiculos.length}`);
    console.log('');

    if (allSectors.length === 0 && allIndiciados.length === 0 && allVehiculos.length === 0) {
      console.log('✅ La base de datos ya está limpia');
      return;
    }

    // 2. Eliminar todo (en orden correcto para evitar errores de foreign key)
    console.log('🔥 Eliminando TODOS los registros...');

    // Primero eliminar indiciados y vehículos
    const indiciadosEliminados = await Indiciado.destroy({
      where: {},
      force: true
    });
    
    const vehiculosEliminados = await Vehiculo.destroy({
      where: {},
      force: true
    });

    // Luego eliminar sectores y subsectores
    const sectoresEliminados = await Sector.destroy({
      where: {},
      force: true
    });

    console.log('✅ Eliminación completada:');
    console.log(`- ${sectoresEliminados} sectores/subsectores eliminados`);
    console.log(`- ${indiciadosEliminados} indiciados eliminados`);
    console.log(`- ${vehiculosEliminados} vehículos eliminados`);

    // 3. Verificar que todo esté limpio
    const remainingSectors = await Sector.findAll();
    const remainingIndiciados = await Indiciado.findAll();
    const remainingVehiculos = await Vehiculo.findAll();

    if (remainingSectors.length === 0 && remainingIndiciados.length === 0 && remainingVehiculos.length === 0) {
      console.log('\n🎉 ¡Perfecto! La base de datos está completamente limpia.');
      console.log('✅ Ahora puedes crear sectores sin problemas de duplicados.');
    } else {
      console.log('\n⚠️  Advertencia: Algunos registros no se pudieron eliminar:');
      console.log(`- Sectores restantes: ${remainingSectors.length}`);
      console.log(`- Indiciados restantes: ${remainingIndiciados.length}`);
      console.log(`- Vehículos restantes: ${remainingVehiculos.length}`);
    }

  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
  } finally {
    console.log('\n🏁 Proceso completado.');
    process.exit(0);
  }
}

cleanAllSectorsAndData();
