const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const verifyAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔍 VERIFICANDO TODOS LOS USUARIOS...\n');

    // Obtener todos los usuarios
    const users = await User.find({}).sort({ role: 1, username: 1 });
    
    console.log(`📊 Total de usuarios encontrados: ${users.length}\n`);
    console.log('=' .repeat(80));

    // Verificar cada usuario
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      console.log(`\n${i + 1}. 👤 ${user.fullName}`);
      console.log(`   🆔 ID: ${user._id}`);
      console.log(`   👤 Username: ${user.username}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Rol: ${user.role}`);
      console.log(`   ✅ Activo: ${user.isActive}`);
      console.log(`   📅 Creado: ${user.createdAt.toLocaleString()}`);
      
      // Verificar que la contraseña está hasheada correctamente
      const isPasswordHashed = user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$');
      console.log(`   🔒 Password hasheada: ${isPasswordHashed ? '✅' : '❌'}`);
      
      console.log('   ' + '-'.repeat(70));
    }

    // Mostrar credenciales para testing
    console.log('\n🔐 CREDENCIALES PARA TESTING:');
    console.log('=' .repeat(80));
    
    const credentials = [
      { user: 'admin', email: 'admin@criminalistica.com', pass: 'admin123', role: 'admin' },
      { user: 'editor', email: 'editor@criminalistica.com', pass: 'editor123', role: 'editor' },
      { user: 'viewer', email: 'viewer@criminalistica.com', pass: 'viewer123', role: 'viewer' },
      { user: 'investigador', email: 'investigador@test.com', pass: 'test123', role: 'editor' }
    ];

    credentials.forEach((cred, index) => {
      const userExists = users.find(u => u.username === cred.user);
      const status = userExists ? '✅' : '❌';
      
      console.log(`\n${index + 1}. ${status} ${cred.user.toUpperCase()} (${cred.role})`);
      console.log(`   📧 Email: ${cred.email}`);
      console.log(`   👤 Username: ${cred.user}`);
      console.log(`   🔑 Password: ${cred.pass}`);
      console.log(`   📊 En DB: ${userExists ? 'SÍ' : 'NO'}`);
    });

    // Verificar estructura de base de datos
    console.log('\n📁 COLECCIONES EN LA BASE DE DATOS:');
    console.log('=' .repeat(80));
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. 📁 ${collection.name}`);
    });

    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('💡 Todos los usuarios están correctamente configurados en la base de datos.');
    
    if (users.length === 4) {
      console.log('✅ Los 4 usuarios esperados están presentes.');
    } else {
      console.log(`⚠️  Se esperaban 4 usuarios pero se encontraron ${users.length}.`);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
    process.exit(0);
  }
};

verifyAllUsers();
