const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Sector = require('../models/Sector');

async function initTestData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/criminalistica-mern', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes (opcional)
    await User.deleteMany({});
    await Sector.deleteMany({});
    
    console.log('🧹 Datos existentes eliminados');

    // Crear usuario administrador de prueba
    const adminUser = new User({
      username: 'admin',
      email: 'admin@criminalistica.com',
      fullName: 'Administrador del Sistema',
      passwordHash: 'admin123', // Se hasheará automáticamente
      role: 'administrator',
      isActive: true
    });

    await adminUser.save();
    console.log('👤 Usuario administrador creado:', {
      id: adminUser._id,
      username: adminUser.username,
      email: adminUser.email
    });

    // Crear sectores de prueba
    const sectorPrincipal = new Sector({
      nombre: 'Sector Antioquia - Medellín',
      descripcion: 'Sector principal de Antioquia',
      type: 'sector',
      ownerId: adminUser._id,
      miembros: [{
        userId: adminUser._id,
        role: 'administrator',
        joinDate: new Date()
      }],
      isActive: true
    });

    await sectorPrincipal.save();
    console.log('🗂️  Sector principal creado:', {
      id: sectorPrincipal._id,
      nombre: sectorPrincipal.nombre
    });

    // Crear subsector de prueba
    const subsectorPrueba = new Sector({
      nombre: 'lopez de mesa',
      descripcion: 'Subsector de prueba',
      type: 'subsector',
      parentId: sectorPrincipal._id,
      ownerId: adminUser._id,
      miembros: [{
        userId: adminUser._id,
        role: 'administrator',
        joinDate: new Date()
      }],
      isActive: true
    });

    await subsectorPrueba.save();
    console.log('📁 Subsector creado:', {
      id: subsectorPrueba._id,
      nombre: subsectorPrueba.nombre,
      parentId: subsectorPrueba.parentId
    });

    // Crear editor de prueba
    const editorUser = new User({
      username: 'editor',
      email: 'editor@criminalistica.com',
      fullName: 'Editor de Prueba',
      passwordHash: 'editor123', // Se hasheará automáticamente
      role: 'editor',
      isActive: true
    });

    await editorUser.save();
    console.log('👤 Usuario editor creado:', {
      id: editorUser._id,
      username: editorUser.username,
      email: editorUser.email
    });

    console.log('\n🎉 Datos de prueba inicializados exitosamente!');
    console.log('\n📋 RESUMEN:');
    console.log('👤 Usuarios:');
    console.log('   - admin / admin123 (Administrador)');
    console.log('   - editor / editor123 (Editor)');
    console.log('\n🗂️  Jerarquía de sectores:');
    console.log(`   - ${sectorPrincipal.nombre} (ID: ${sectorPrincipal._id})`);
    console.log(`     └── ${subsectorPrueba.nombre} (ID: ${subsectorPrueba._id})`);

  } catch (error) {
    console.error('❌ Error inicializando datos de prueba:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
initTestData();
