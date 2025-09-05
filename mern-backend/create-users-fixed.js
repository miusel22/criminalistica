const mongoose = require('mongoose');
require('dotenv').config();

// Importar el modelo User actual
const User = require('./models/User');

async function createUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB');

    // Limpiar usuarios existentes (opcional)
    await User.deleteMany({});
    console.log('🗑️ Usuarios existentes eliminados');

    // Crear usuario administrador
    const adminUser = new User({
      username: 'admin',
      email: 'admin@criminalistica.com',
      fullName: 'Administrador del Sistema',
      passwordHash: 'admin123', // Se hasheará automáticamente
      role: 'admin',
      isActive: true
    });
    
    await adminUser.save();
    console.log('✅ Usuario administrador creado');

    // Crear usuario editor
    const editorUser = new User({
      username: 'editor',
      email: 'editor@criminalistica.com',
      fullName: 'Usuario Editor',
      passwordHash: '123456', // Se hasheará automáticamente
      role: 'editor',
      isActive: true
    });
    
    await editorUser.save();
    console.log('✅ Usuario editor creado');

    // Crear usuario viewer
    const viewerUser = new User({
      username: 'viewer',
      email: 'viewer@criminalistica.com',
      fullName: 'Usuario Viewer',
      passwordHash: '123456', // Se hasheará automáticamente
      role: 'viewer',
      isActive: true
    });
    
    await viewerUser.save();
    console.log('✅ Usuario viewer creado');

    console.log('\n🎯 CREDENCIALES DE ACCESO:');
    console.log('\n👤 ADMINISTRADOR:');
    console.log('Email: admin@criminalistica.com');
    console.log('Password: admin123');
    console.log('Rol: admin');
    
    console.log('\n✏️ EDITOR:');
    console.log('Email: editor@criminalistica.com');
    console.log('Password: 123456');
    console.log('Rol: editor');
    
    console.log('\n👁️ VIEWER:');
    console.log('Email: viewer@criminalistica.com');
    console.log('Password: 123456');
    console.log('Rol: viewer');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUsers();
