const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const setupDatabaseAndUsers = async () => {
  try {
    // Conectar a MongoDB usando la URI del .env
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica_db';
    console.log('🔗 Conectando a:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado exitosamente a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.name);

    // Limpiar usuarios existentes para evitar conflictos (opcional)
    console.log('\n🧹 Limpiando usuarios existentes...');
    await User.deleteMany({});
    console.log('✅ Usuarios existentes eliminados');

    // Crear usuario administrador
    console.log('\n👤 Creando usuario administrador...');
    const adminUser = new User({
      username: 'admin',
      email: 'admin@criminalistica.com',
      fullName: 'Administrador del Sistema',
      passwordHash: 'admin123', // El pre-save hook se encarga del hash
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Usuario administrador creado');

    // Crear usuario editor
    console.log('\n✏️  Creando usuario editor...');
    const editorUser = new User({
      username: 'editor',
      email: 'editor@criminalistica.com', 
      fullName: 'Usuario Editor',
      passwordHash: 'editor123',
      role: 'editor',
      isActive: true
    });

    await editorUser.save();
    console.log('✅ Usuario editor creado');

    // Crear usuario visualizador
    console.log('\n👁️  Creando usuario visualizador...');
    const viewerUser = new User({
      username: 'viewer',
      email: 'viewer@criminalistica.com',
      fullName: 'Usuario Visualizador',
      passwordHash: 'viewer123',
      role: 'viewer',
      isActive: true
    });

    await viewerUser.save();
    console.log('✅ Usuario visualizador creado');

    // Crear usuario de prueba adicional
    console.log('\n🧪 Creando usuario de prueba...');
    const testUser = new User({
      username: 'investigador',
      email: 'investigador@test.com',
      fullName: 'Investigador de Prueba',
      passwordHash: 'test123',
      role: 'editor',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Usuario de prueba creado');

    // Verificar y mostrar todos los usuarios creados
    console.log('\n📋 USUARIOS CREADOS EN LA BASE DE DATOS:');
    console.log('=' .repeat(70));
    
    const users = await User.find({}, 'username email fullName role isActive createdAt').sort({ role: 1 });
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName}`);
      console.log(`   👤 Username: ${user.username}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Rol: ${user.role}`);
      console.log(`   ✅ Activo: ${user.isActive}`);
      console.log(`   📅 Creado: ${user.createdAt.toLocaleString()}`);
      console.log('   ' + '-'.repeat(50));
    });

    // Mostrar credenciales para login
    console.log('\n🔐 CREDENCIALES PARA LOGIN (puedes usar email o username):');
    console.log('=' .repeat(70));
    
    console.log('\n👑 ADMINISTRADOR:');
    console.log('   Email: admin@criminalistica.com');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
    console.log('\n✏️  EDITOR:');
    console.log('   Email: editor@criminalistica.com');
    console.log('   Username: editor');
    console.log('   Password: editor123');
    
    console.log('\n👁️  VISUALIZADOR:');
    console.log('   Email: viewer@criminalistica.com');
    console.log('   Username: viewer');
    console.log('   Password: viewer123');
    
    console.log('\n🧪 INVESTIGADOR DE PRUEBA:');
    console.log('   Email: investigador@test.com');
    console.log('   Username: investigador');
    console.log('   Password: test123');

    console.log('\n💡 NOTA: Puedes usar tanto el email como el username para hacer login');
    console.log('💡 Ejemplos de login:');
    console.log('   - Con email: admin@criminalistica.com + admin123');
    console.log('   - Con username: admin + admin123');

    // Verificar las colecciones en la base de datos
    console.log('\n📊 COLECCIONES EN LA BASE DE DATOS:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`   📁 ${collection.name}`);
    });

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    
    if (error.code === 11000) {
      console.log('\n💡 Error de duplicado. Posibles soluciones:');
      console.log('   1. Elimina los usuarios duplicados desde MongoDB Compass');
      console.log('   2. O ejecuta este script nuevamente (limpiará automáticamente)');
    }
    
    if (error.name === 'ValidationError') {
      console.log('\n💡 Error de validación:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
    console.log('🎯 ¡Base de datos configurada y lista para usar!');
    process.exit(0);
  }
};

// Ejecutar la configuración
setupDatabaseAndUsers();
