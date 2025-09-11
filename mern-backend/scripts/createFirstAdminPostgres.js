require('dotenv').config();
const { User, testConnection, syncDatabase } = require('../models/sequelize');

const createFirstAdmin = async () => {
  try {
    console.log('🔗 Conectando a PostgreSQL...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a PostgreSQL');
    }
    
    // Sync database (crear tablas si no existen)
    await syncDatabase(false);
    console.log('✅ Base de datos sincronizada');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      where: { role: 'admin' } 
    });
    
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario administrador:');
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Nombre: ${existingAdmin.fullName}`);
      console.log(`Rol: ${existingAdmin.role}`);
      
      // Pregunta si quiere actualizar la contraseña
      console.log('\n🔄 Actualizando contraseña a: admin123456');
      existingAdmin.password = 'admin123456';
      await existingAdmin.save();
      console.log('✅ Contraseña actualizada');
      return;
    }

    // Get admin details from command line args or use defaults
    const adminData = {
      username: process.argv[2] || 'admin',
      email: process.argv[3] || 'admin@criminalistica.com',
      password: process.argv[4] || 'admin123456',
      fullName: process.argv[5] || 'Administrador del Sistema'
    };

    // Check if user with same username or email exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username: adminData.username },
          { email: adminData.email }
        ]
      }
    });

    if (existingUser) {
      console.error('❌ Error: Ya existe un usuario con este username o email');
      console.log(`Usuario existente: ${existingUser.username} (${existingUser.email})`);
      return;
    }

    // Create admin user
    console.log('👤 Creando usuario administrador...');
    const admin = await User.create({
      username: adminData.username,
      email: adminData.email,
      fullName: adminData.fullName,
      role: 'admin',
      password: adminData.password, // Will be hashed by beforeCreate hook
      isActive: true,
      department: 'Administración',
      position: 'Administrador del Sistema',
      emailNotifications: true
    });

    console.log('✅ ¡Usuario administrador creado exitosamente!');
    console.log('═'.repeat(50));
    console.log('DETALLES DEL ADMINISTRADOR:');
    console.log(`👤 Username: ${admin.username}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🏷️  Nombre: ${admin.fullName}`);
    console.log(`🎭 Rol: ${admin.role}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`🏢 Departamento: ${admin.department}`);
    console.log(`💼 Posición: ${admin.position}`);
    console.log('═'.repeat(50));
    console.log('\n⚠️  IMPORTANTE: ¡Cambia la contraseña por defecto después del primer login!');
    console.log('\n🎯 CREDENCIALES PARA LOGIN:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n✨ Ya puedes usar estas credenciales para acceder al sistema y enviar invitaciones a otros usuarios.');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    if (error.name === 'SequelizeValidationError') {
      console.error('Errores de validación:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
  } finally {
    // Close database connection
    const { sequelize } = require('../models/sequelize');
    await sequelize.close();
    console.log('\n👋 Conexión a la base de datos cerrada');
  }
};

// Usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Crear Primer Usuario Administrador - PostgreSQL');
  console.log('='.repeat(50));
  console.log('Uso: node createFirstAdminPostgres.js [username] [email] [password] [fullName]');
  console.log('\nArgumentos (todos opcionales):');
  console.log('  username  - Nombre de usuario del admin (default: admin)');
  console.log('  email     - Email del administrador (default: admin@criminalistica.com)');
  console.log('  password  - Contraseña del administrador (default: admin123456)');
  console.log('  fullName  - Nombre completo (default: Administrador del Sistema)');
  console.log('\nEjemplos:');
  console.log('  node createFirstAdminPostgres.js');
  console.log('  node createFirstAdminPostgres.js superadmin admin@empresa.com miClaveSegura "Juan Pérez"');
  console.log('\n⚠️  Recuerda cambiar la contraseña por defecto después del primer login!');
  process.exit(0);
}

// Run the script
createFirstAdmin();
