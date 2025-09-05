const mongoose = require('mongoose');
const Sector = require('./mern-backend/models/Sector');
const Indiciado = require('./mern-backend/models/Indiciado');

// Función para probar la eliminación en cascada
async function testCascadeDelete() {
  try {
    // Conectar a la base de datos (ajusta la URL según tu configuración)
    await mongoose.connect('mongodb://localhost:27017/tu_base_de_datos', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // Crear un usuario de prueba (puedes usar un ID existente)
    const testUserId = new mongoose.Types.ObjectId();
    
    // 1. Crear un sector de prueba
    const sectorPrueba = new Sector({
      nombre: 'Sector Test Cascada',
      ownerId: testUserId,
      type: 'sector'
    });
    await sectorPrueba.save();
    console.log('✅ Sector creado:', sectorPrueba._id);
    
    // 2. Crear un subsector de prueba
    const subsectorPrueba = new Sector({
      nombre: 'Subsector Test Cascada',
      ownerId: testUserId,
      parentId: sectorPrueba._id,
      type: 'subsector'
    });
    await subsectorPrueba.save();
    console.log('✅ Subsector creado:', subsectorPrueba._id);
    
    // 3. Crear un indiciado de prueba
    const indiciadoPrueba = new Indiciado({
      nombre: 'Juan',
      apellidos: 'Pérez Test',
      ownerId: testUserId,
      subsectorId: subsectorPrueba._id
    });
    await indiciadoPrueba.save();
    console.log('✅ Indiciado creado:', indiciadoPrueba._id);
    
    // 4. Verificar que todo existe antes de la eliminación
    const sectoresBefore = await Sector.countDocuments({});
    const indiciadosBefore = await Indiciado.countDocuments({});
    console.log(`📊 Antes de eliminar: ${sectoresBefore} sectores, ${indiciadosBefore} indiciados`);
    
    // 5. Eliminar el sector principal (esto debe activar la cascada)
    console.log('🗑️ Eliminando sector principal...');
    await Sector.findOneAndDelete({ _id: sectorPrueba._id });
    
    // 6. Verificar que la eliminación en cascada funcionó
    const sectoresAfter = await Sector.countDocuments({});
    const indiciadosAfter = await Indiciado.countDocuments({});
    console.log(`📊 Después de eliminar: ${sectoresAfter} sectores, ${indiciadosAfter} indiciados`);
    
    // 7. Verificar específicamente que nuestros elementos fueron eliminados
    const sectorExists = await Sector.findById(sectorPrueba._id);
    const subsectorExists = await Sector.findById(subsectorPrueba._id);
    const indiciadoExists = await Indiciado.findById(indiciadoPrueba._id);
    
    console.log('🔍 Verificación específica:');
    console.log('  - Sector eliminado:', !sectorExists);
    console.log('  - Subsector eliminado:', !subsectorExists);
    console.log('  - Indiciado eliminado:', !indiciadoExists);
    
    if (!sectorExists && !subsectorExists && !indiciadoExists) {
      console.log('🎉 ¡Eliminación en cascada funcionó correctamente!');
    } else {
      console.log('❌ La eliminación en cascada no funcionó como se esperaba');
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📛 Conexión cerrada');
  }
}

// Ejecutar la prueba
testCascadeDelete();
