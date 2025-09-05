require('dotenv').config();
const mongoose = require('mongoose');
const Indiciado = require('../models/Indiciado');
const Sector = require('../models/Sector');

async function fixIndiciadosHierarchy() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica_db');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Analyzing indiciados and their references...');
    
    // Obtener todos los indiciados activos
    const indiciados = await Indiciado.find({ activo: true }).populate('subsectorId');
    console.log(`📊 Found ${indiciados.length} active indiciados`);

    let fixedCount = 0;
    let syncCount = 0;
    let errorCount = 0;

    for (const indiciado of indiciados) {
      try {
        console.log(`\n🔍 Processing: ${indiciado.nombre} ${indiciado.apellidos}`);
        
        if (!indiciado.subsectorId) {
          console.log(`⚠️  Skipping - no subsectorId`);
          continue;
        }

        const referencedElement = indiciado.subsectorId;
        console.log(`   Referenced: ${referencedElement.nombre} (type: ${referencedElement.type})`);

        // Si está referenciando un sector en lugar de subsector, intentar encontrar un subsector
        if (referencedElement.type === 'sector') {
          console.log(`   ⚠️  Indiciado is referencing a sector instead of subsector`);
          
          // Buscar subsectores de este sector que pertenezcan al mismo owner del indiciado
          const subsectores = await Sector.find({
            parentId: referencedElement._id,
            type: 'subsector',
            ownerId: indiciado.ownerId
          });

          if (subsectores.length > 0) {
            // Usar el primer subsector encontrado
            const subsector = subsectores[0];
            console.log(`   ✅ Found suitable subsector: ${subsector.nombre}`);
            
            // Actualizar el indiciado para referenciar el subsector
            indiciado.subsectorId = subsector._id;
            await indiciado.save();
            fixedCount++;
            console.log(`   ✅ Fixed reference to subsector`);
            
            // Ahora crear la entrada en la jerarquía
            const existingHierarchyEntry = await Sector.findOne({
              ownerId: indiciado.ownerId,
              parentId: subsector._id,
              nombre: `${indiciado.nombre} ${indiciado.apellidos}`,
              type: 'indiciado'
            });

            if (!existingHierarchyEntry) {
              const hierarchyEntry = new Sector({
                nombre: `${indiciado.nombre} ${indiciado.apellidos}`,
                descripcion: `Indiciado: ${indiciado.documentoIdentidad?.numero || 'Sin documento'}`,
                ownerId: indiciado.ownerId,
                parentId: subsector._id,
                type: 'indiciado'
              });

              await hierarchyEntry.save();
              syncCount++;
              console.log(`   ✅ Created hierarchy entry`);
            } else {
              console.log(`   ✅ Hierarchy entry already exists`);
            }
          } else {
            console.log(`   ❌ No suitable subsector found for sector: ${referencedElement.nombre}`);
            errorCount++;
          }
        } 
        // Si está referenciando un subsector
        else if (referencedElement.type === 'subsector') {
          // Verificar que el owner coincida
          if (referencedElement.ownerId.toString() !== indiciado.ownerId.toString()) {
            console.log(`   ⚠️  Owner mismatch - subsector owner: ${referencedElement.ownerId}, indiciado owner: ${indiciado.ownerId}`);
            
            // Buscar un subsector que pertenezca al owner del indiciado
            const correctSubsector = await Sector.findOne({
              type: 'subsector',
              ownerId: indiciado.ownerId
            });

            if (correctSubsector) {
              console.log(`   ✅ Found correct subsector: ${correctSubsector.nombre}`);
              indiciado.subsectorId = correctSubsector._id;
              await indiciado.save();
              fixedCount++;
              console.log(`   ✅ Fixed ownership reference`);
            } else {
              console.log(`   ❌ No subsector found for owner: ${indiciado.ownerId}`);
              errorCount++;
              continue;
            }
          }

          // Crear entrada en la jerarquía si no existe
          const existingHierarchyEntry = await Sector.findOne({
            ownerId: indiciado.ownerId,
            parentId: indiciado.subsectorId,
            nombre: `${indiciado.nombre} ${indiciado.apellidos}`,
            type: 'indiciado'
          });

          if (!existingHierarchyEntry) {
            const hierarchyEntry = new Sector({
              nombre: `${indiciado.nombre} ${indiciado.apellidos}`,
              descripcion: `Indiciado: ${indiciado.documentoIdentidad?.numero || 'Sin documento'}`,
              ownerId: indiciado.ownerId,
              parentId: indiciado.subsectorId,
              type: 'indiciado'
            });

            await hierarchyEntry.save();
            syncCount++;
            console.log(`   ✅ Created hierarchy entry`);
          } else {
            console.log(`   ✅ Hierarchy entry already exists`);
          }
        }

      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${indiciado.nombre} ${indiciado.apellidos}:`, error.message);
      }
    }

    console.log(`\n📊 Fix Summary:`);
    console.log(`   🔧 References fixed: ${fixedCount}`);
    console.log(`   ✅ Hierarchy entries created: ${syncCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total processed: ${indiciados.length}`);

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  fixIndiciadosHierarchy();
}

module.exports = { fixIndiciadosHierarchy };
