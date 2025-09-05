require('dotenv').config();
const mongoose = require('mongoose');
const Indiciado = require('../models/Indiciado');
const Sector = require('../models/Sector');

async function syncIndiciadosWithHierarchy() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica_db');
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Finding indiciados without hierarchy entries...');
    
    // Obtener todos los indiciados activos
    const indiciados = await Indiciado.find({ activo: true }).populate('subsectorId');
    console.log(`📊 Found ${indiciados.length} active indiciados`);

    let syncCount = 0;
    let errorCount = 0;

    for (const indiciado of indiciados) {
      try {
        if (!indiciado.subsectorId) {
          console.log(`⚠️  Skipping indiciado ${indiciado.nombre} ${indiciado.apellidos} - no subsectorId`);
          continue;
        }

        // Verificar si ya existe la entrada en la jerarquía
        const existingHierarchyEntry = await Sector.findOne({
          ownerId: indiciado.ownerId,
          parentId: indiciado.subsectorId._id,
          nombre: `${indiciado.nombre} ${indiciado.apellidos}`,
          type: 'indiciado'
        });

        if (existingHierarchyEntry) {
          console.log(`✅ Hierarchy entry already exists for: ${indiciado.nombre} ${indiciado.apellidos}`);
          continue;
        }

        // Crear entrada en la jerarquía
        const hierarchyEntry = new Sector({
          nombre: `${indiciado.nombre} ${indiciado.apellidos}`,
          descripcion: `Indiciado: ${indiciado.documentoIdentidad?.numero || 'Sin documento'}`,
          ownerId: indiciado.ownerId,
          parentId: indiciado.subsectorId._id,
          type: 'indiciado'
        });

        await hierarchyEntry.save();
        syncCount++;
        console.log(`✅ Created hierarchy entry for: ${indiciado.nombre} ${indiciado.apellidos} in subsector: ${indiciado.subsectorId.nombre}`);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error syncing ${indiciado.nombre} ${indiciado.apellidos}:`, error.message);
      }
    }

    console.log(`\n📊 Sync Summary:`);
    console.log(`   ✅ Successfully synced: ${syncCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total processed: ${indiciados.length}`);

  } catch (error) {
    console.error('❌ Error during sync:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  syncIndiciadosWithHierarchy();
}

module.exports = { syncIndiciadosWithHierarchy };
