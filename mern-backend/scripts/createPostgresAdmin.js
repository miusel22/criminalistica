const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { testConnection, User } = require('../models/sequelize');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a PostgreSQL');
    }

    console.log('✅ Conectado a PostgreSQL');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: {
        email: 'admin@admin.com'
      }
    });

    if (existingAdmin) {
      console.log('👤 Usuario admin ya existe');
      
      // Generate token
      const token = jwt.sign(
        { 
          id: existingAdmin.id,
          email: existingAdmin.email,
          role: existingAdmin.role,
          username: existingAdmin.username 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('\n🔑 TOKEN DE AUTENTICACIÓN:');
      console.log(token);
      console.log('\n📋 INFORMACIÓN DEL ADMIN:');
      console.log({
        id: existingAdmin.id,
        username: existingAdmin.username,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      
      return { admin: existingAdmin, token };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = await User.create({
      username: `admin_${Date.now()}`,
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'System',
      isActive: true
    });

    console.log('✅ Usuario administrador creado exitosamente');

    // Generate token
    const token = jwt.sign(
      { 
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        username: adminUser.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n🔑 TOKEN DE AUTENTICACIÓN:');
    console.log(token);
    console.log('\n📋 CREDENCIALES DEL ADMIN:');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    return { admin: adminUser, token };

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
  }
}

if (require.main === module) {
  createAdminUser().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = createAdminUser;
