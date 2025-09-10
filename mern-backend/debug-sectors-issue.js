const { Sector } = require('./models/sequelize');
const { testConnection } = require('./models/sequelize');

async function debugSectorsIssue() {
  try {
    console.log('🔍 Diagnosticando problema de sectores...\n');
    
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ No se pudo conectar a la base de datos');
      return;
    }

    // 1. Verificar TODOS los sectores con todas las columnas
    console.log('📊 1. TODOS los sectores en la base de datos:');
    const allSectors = await Sector.findAll({
      attributes: ['id', 'nombre', 'type', 'activo', 'ownerId', 'parentId', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    allSectors.forEach((sector, index) => {
      console.log(`${index + 1}. "${sector.nombre}"`);
      console.log(`   - ID: ${sector.id}`);
      console.log(`   - Tipo: ${sector.type}`);
      console.log(`   - Activo: ${sector.activo}`);
      console.log(`   - Owner: ${sector.ownerId}`);
      console.log(`   - Parent: ${sector.parentId}`);
      console.log(`   - Creado: ${sector.createdAt}`);
      console.log('');
    });

    // 2. Verificar sectores que deberían mostrarse (consulta del endpoint)
    console.log('\n🔍 2. Sectores que deberían mostrarse (type=sector, activo=true):');
    const visibleSectors = await Sector.findAll({
      where: {
        type: 'sector',
        activo: true
      },
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });

    if (visibleSectors.length === 0) {
      console.log('❌ NO HAY SECTORES VISIBLES - Este es el problema!');
      console.log('Los sectores podrían tener:');
      console.log('- activo = false');
      console.log('- type diferente a "sector"');
    } else {
      console.log(`✅ ${visibleSectors.length} sectores deberían mostrarse:`);
      visibleSectors.forEach(sector => {
        console.log(`- ${sector.nombre}`);
      });
    }

    // 3. Verificar jerarquía (método que usa el frontend)
    console.log('\n🌳 3. Probando método getHierarchy (que usa el frontend):');
    try {
      const hierarchy = await Sector.getHierarchy(null, false);
      console.log(`✅ Jerarquía devuelve ${hierarchy.length} sectores`);
      hierarchy.forEach(sector => {
        console.log(`- ${sector.nombre} (${sector.subsectores?.length || 0} subsectores)`);
      });
    } catch (error) {
      console.log('❌ Error en getHierarchy:', error.message);
    }

    // 4. Contar por estado
    console.log('\n📈 4. Estadísticas de sectores:');
    const stats = await Sector.findAll({
      attributes: ['activo', 'type'],
      raw: true
    });

    const activoTrue = stats.filter(s => s.activo === true).length;
    const activoFalse = stats.filter(s => s.activo === false).length;
    const typeSector = stats.filter(s => s.type === 'sector').length;
    const typeSubsector = stats.filter(s => s.type === 'subsector').length;

    console.log(`- Total registros: ${stats.length}`);
    console.log(`- Activos (true): ${activoTrue}`);
    console.log(`- Inactivos (false): ${activoFalse}`);
    console.log(`- Tipo 'sector': ${typeSector}`);
    console.log(`- Tipo 'subsector': ${typeSubsector}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugSectorsIssue();
