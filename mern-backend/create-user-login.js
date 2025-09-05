const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createUserForLogin = async () => {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB:', mongoUri);

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ username: 'admin' });
    
    if (existingUser) {
      console.log('⚠️  Usuario admin ya existe');
      console.log('Actualizando contraseña...');
      
      // Actualizar contraseña directamente (el pre-save hook se encargará del hash)
      existingUser.passwordHash = 'admin123';
      await existingUser.save();
      
      console.log('✅ Contraseña actualizada');
    } else {
      // Crear nuevo usuario admin
      const adminUser = new User({
        username: 'admin',
        email: 'admin@criminalistica.com',
        fullName: 'Administrador del Sistema',
        passwordHash: 'admin123', // El pre-save hook se encarga del hash
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Usuario administrador creado exitosamente');
    }

    // Crear también un usuario editor para pruebas
    const existingEditor = await User.findOne({ username: 'editor' });
    
    if (!existingEditor) {
      const editorUser = new User({
        username: 'editor',
        email: 'editor@criminalistica.com', 
        fullName: 'Usuario Editor',
        passwordHash: 'editor123',
        role: 'editor',
        isActive: true
      });

      await editorUser.save();
      console.log('✅ Usuario editor creado exitosamente');
    }

    // Mostrar credenciales
    console.log('\n🔐 CREDENCIALES PARA LOGIN:');
    console.log('─'.repeat(40));
    console.log('👤 ADMINISTRADOR:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@criminalistica.com');
    console.log('');
    console.log('✏️  EDITOR:');
    console.log('   Username: editor');  
    console.log('   Password: editor123');
    console.log('   Email: editor@criminalistica.com');
    console.log('─'.repeat(40));

    // Verificar la creación consultando la base de datos
    const users = await User.find({}, 'username email role isActive createdAt');
    console.log('\n📊 USUARIOS EN LA BASE DE DATOS:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.email} - Activo: ${user.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    
    if (error.code === 11000) {
      console.log('💡 Sugerencia: Parece que ya existe un usuario con esos datos.');
      console.log('   Intenta con diferentes credenciales o elimina el usuario existente.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
createUserForLogin();
