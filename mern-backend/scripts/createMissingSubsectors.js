require('dotenv').config();
const mongoose = require('mongoose');
const Indiciado = require('../models/Indiciado');
const Sector = require('../models/Sector');
const User = require('../models/User');

async function createMissingSubsectors() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica_db');
    console.log('✅ Connected to MongoDB');

    // Obtener usuarios únicos de indiciados
    const indiciados = await Indiciado.find({ activo: true });
    const userIds = [...new Set(indiciados.map(ind => ind.ownerId.toString()))];
    
    console.log(`\n🔍 Found indiciados from ${userIds.length} different users`);

    for (const userId of userIds) {
      console.log(`\n👤 Processing user: ${userId}`);
      
      // Verificar si este usuario ya tiene un sector y subsector
      const existingSector = await Sector.findOne({ ownerId: userId, type: 'sector' });
      
      if (!existingSector) {
        console.log(`   📁 Creating sector for user ${userId}...`);
        
        // Crear sector principal
        const newSector = new Sector({
          nombre: 'Sector Principal',
          ownerId: userId,
          type: 'sector'
        });
        await newSector.save();
        console.log(`   ✅ Created sector: ${newSector.nombre}`);
        
        // Crear subsector
        const newSubsector = new Sector({
          nombre: 'Subsector General',
          descripcion: 'Subsector general para indiciados',
          ownerId: userId,
          parentId: newSector._id,
          type: 'subsector'
        });
        await newSubsector.save();
        console.log(`   ✅ Created subsector: ${newSubsector.nombre}`);
        
        // Actualizar todos los indiciados de este usuario para referenciar el nuevo subsector
        const userIndiciados = indiciados.filter(ind => ind.ownerId.toString() === userId);
        for (const indiciado of userIndiciados) {
          indiciado.subsectorId = newSubsector._id;
          await indiciado.save();
          console.log(`   🔗 Updated indiciado: ${indiciado.nombre} ${indiciado.apellidos}`);
        }
      } else {
        console.log(`   ✅ User already has sector: ${existingSector.nombre}`);
        
        // Verificar si tiene subsectores
        const subsectores = await Sector.find({ 
          ownerId: userId, 
          parentId: existingSector._id, 
          type: 'subsector' 
        });
        
        if (subsectores.length === 0) {
          console.log(`   📁 Creating subsector for existing sector...`);
          
          const newSubsector = new Sector({
            nombre: 'Subsector General',
            descripcion: 'Subsector general para indiciados',
            ownerId: userId,
            parentId: existingSector._id,
            type: 'subsector'
          });
          await newSubsector.save();
          console.log(`   ✅ Created subsector: ${newSubsector.nombre}`);
          
          // Actualizar indiciados para referenciar este subsector
          const userIndiciados = indiciados.filter(ind => ind.ownerId.toString() === userId);
          for (const indiciado of userIndiciados) {
            indiciado.subsectorId = newSubsector._id;
            await indiciado.save();
            console.log(`   🔗 Updated indiciado: ${indiciado.nombre} ${indiciado.apellidos}`);
          }
        } else {
          console.log(`   ✅ User already has ${subsectores.length} subsector(s)`);
        }
      }
    }

    console.log(`\n✅ Finished creating missing subsectors`);

  } catch (error) {
    console.error('❌ Error creating subsectors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  createMissingSubsectors();
}

module.exports = { createMissingSubsectors };
