const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const InvitationCode = require('./models/InvitationCode');

async function createSampleInvitation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ role: 'administrator' });
    if (!admin) {
      console.error('❌ No se encontró usuario administrador');
      return;
    }

    // Get email from command line or use default
    const email = process.argv[2] || 'prueba@test.com';
    const role = process.argv[3] || 'editor';

    // Check if invitation already exists for this email
    const existingInvitation = await InvitationCode.findOne({ email });
    if (existingInvitation) {
      console.log('⚠️ Ya existe una invitación para este email:');
      console.log(`   🔑 Código: ${existingInvitation.code}`);
      console.log(`   📊 Estado: ${existingInvitation.isUsed ? 'USADO' : 'PENDIENTE'}`);
      console.log(`   🔗 URL: http://localhost:3000/register?code=${existingInvitation.code}&email=${encodeURIComponent(email)}`);
      return;
    }

    // Create invitation
    const invitation = new InvitationCode({
      email: email,
      role: role,
      invitedBy: admin._id
    });

    await invitation.save();

    console.log('✅ Código de invitación creado exitosamente!');
    console.log('\n📋 DETALLES DE LA INVITACIÓN:');
    console.log('============================');
    console.log(`🔑 Código: ${invitation.code}`);
    console.log(`📧 Email: ${invitation.email}`);
    console.log(`👤 Rol: ${invitation.role}`);
    console.log(`⏳ Expira: ${invitation.expiresAt.toLocaleString('es-ES')}`);
    console.log(`👥 Invitado por: ${admin.username}`);
    
    const registrationUrl = `http://localhost:3000/register?code=${invitation.code}&email=${encodeURIComponent(invitation.email)}`;
    console.log(`\n🔗 URL COMPLETA DE REGISTRO:`);
    console.log(`${registrationUrl}`);
    
    console.log(`\n📝 INSTRUCCIONES:`);
    console.log(`1. Copia la URL completa de arriba`);
    console.log(`2. Pégala en el navegador`);
    console.log(`3. O ve a http://localhost:3000/register y usa el código: ${invitation.code}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Crear Código de Invitación');
  console.log('==========================');
  console.log('node create-sample-invitation.js [email] [role]');
  console.log('\nEjemplos:');
  console.log('  node create-sample-invitation.js');
  console.log('  node create-sample-invitation.js usuario@test.com editor');
  console.log('  node create-sample-invitation.js admin2@test.com administrator');
  console.log('\nRoles disponibles: viewer, editor, administrator');
  process.exit(0);
}

createSampleInvitation();
