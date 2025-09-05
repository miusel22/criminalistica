const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function checkAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'administrator' });
    
    console.log('\n📋 USUARIOS ADMINISTRADORES ENCONTRADOS:');
    console.log('==========================================');
    
    if (adminUsers.length === 0) {
      console.log('❌ No se encontraron usuarios administradores.');
      console.log('\n🔧 Para crear un usuario admin, ejecuta:');
      console.log('node scripts/createFirstAdmin.js');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`\n👤 Administrador #${index + 1}:`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   👤 Username: ${admin.username}`);
        console.log(`   📝 Nombre: ${admin.fullName || 'No especificado'}`);
        console.log(`   🔒 Rol: ${admin.role}`);
        console.log(`   ✅ Activo: ${admin.isActive ? 'Sí' : 'No'}`);
        console.log(`   📅 Creado: ${admin.createdAt}`);
      });

      console.log('\n🔑 CREDENCIALES PARA LOGIN:');
      console.log('===========================');
      adminUsers.forEach((admin, index) => {
        console.log(`\n📧 Email: ${admin.email}`);
        console.log(`🔒 Contraseña: (necesitas recordar la contraseña que se usó al crear el usuario)`);
        
        // Common passwords used in the system
        const commonPasswords = [
          'admin123',
          'admin123456', 
          'admin',
          '123456'
        ];
        
        console.log(`\n💡 Contraseñas comunes que podrían funcionar:`);
        commonPasswords.forEach(pwd => {
          console.log(`   - ${pwd}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

checkAdminUsers();
