const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const InvitationCode = require('./models/InvitationCode');

async function showInvitations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all invitations
    const invitations = await InvitationCode.find({})
      .populate('invitedBy', 'username email')
      .populate('usedBy', 'username email')
      .sort({ createdAt: -1 });
    
    console.log('\n📨 CÓDIGOS DE INVITACIÓN:');
    console.log('==========================');
    
    if (invitations.length === 0) {
      console.log('❌ No hay códigos de invitación en la base de datos.');
      console.log('\n💡 Crea un código desde la interfaz de administración o ejecuta:');
      console.log('node create-sample-invitation.js');
    } else {
      invitations.forEach((invitation, index) => {
        const status = invitation.isUsed ? '✅ USADO' : 
                      (invitation.expiresAt <= new Date()) ? '⏰ EXPIRADO' : '🟡 PENDIENTE';
        
        console.log(`\n📋 Invitación #${index + 1}:`);
        console.log(`   🔑 Código: ${invitation.code}`);
        console.log(`   📧 Email: ${invitation.email}`);
        console.log(`   👤 Rol: ${invitation.role}`);
        console.log(`   📊 Estado: ${status}`);
        console.log(`   📅 Creado: ${invitation.createdAt.toLocaleString('es-ES')}`);
        console.log(`   ⏳ Expira: ${invitation.expiresAt.toLocaleString('es-ES')}`);
        console.log(`   👥 Invitado por: ${invitation.invitedBy?.username || 'Usuario eliminado'}`);
        
        if (invitation.isUsed) {
          console.log(`   ✅ Usado por: ${invitation.usedBy?.username || 'Usuario eliminado'}`);
          console.log(`   📅 Fecha de uso: ${invitation.usedAt.toLocaleString('es-ES')}`);
        }

        // Generate registration URL
        const registrationUrl = `http://localhost:3000/register?code=${invitation.code}&email=${encodeURIComponent(invitation.email)}`;
        console.log(`   🔗 URL de registro: ${registrationUrl}`);
      });

      console.log('\n💡 PARA USAR UN CÓDIGO:');
      console.log('======================');
      console.log('1. Copia la "URL de registro" completa');
      console.log('2. Pégala en el navegador');
      console.log('3. O ve a /register y pega solo el código');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

showInvitations();
