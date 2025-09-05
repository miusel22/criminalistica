const mongoose = require('mongoose');
const User = require('../models/User');
const Sector = require('../models/Sector');
require('dotenv').config();

const createDefaultSector = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // Crear usuario de prueba si no existe
    let testUser = await User.findOne({ username: 'admin' });
    
    if (!testUser) {
      testUser = new User({
        username: 'admin',
        email: 'admin@test.com',
        fullName: 'Administrador de Prueba',
        passwordHash: 'admin123', // Será hasheado automáticamente
        role: 'administrator',
        isActive: true
      });
      
      await testUser.save();
      console.log('✅ Usuario de prueba creado:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@test.com');
    } else {
      console.log('✅ Usuario de prueba ya existe:', testUser.username);
    }

    // Verificar si ya existe un sector por defecto
    const existingSector = await Sector.findOne({ 
      ownerId: testUser._id, 
      type: 'sector' 
    });

    if (existingSector) {
      console.log('✅ Ya existe un sector por defecto:', existingSector.nombre);
      return;
    }

    // Crear sector por defecto
    const defaultSector = new Sector({
      nombre: 'Sector Bogotá - Bogotá D.C.',
      ownerId: testUser._id,
      type: 'sector',
      descripcion: 'Sector de ejemplo para la ciudad de Bogotá',
      ubicacion: {
        departamento: {
          id: '11',
          nombre: 'Bogotá D.C.'
        },
        ciudad: {
          id: '11001',
          nombre: 'Bogotá D.C.'
        }
      }
    });

    await defaultSector.save();
    console.log('✅ Sector por defecto creado exitosamente:');
    console.log('   Nombre:', defaultSector.nombre);
    console.log('   ID:', defaultSector._id);
    console.log('   Owner ID:', defaultSector.ownerId);

    // Crear algunos subsectores de ejemplo
    const subsector1 = new Sector({
      nombre: 'Centro Histórico',
      ownerId: testUser._id,
      parentId: defaultSector._id,
      type: 'subsector',
      descripcion: 'Subsector del centro histórico de Bogotá'
    });

    const subsector2 = new Sector({
      nombre: 'Zona Norte',
      ownerId: testUser._id,
      parentId: defaultSector._id,
      type: 'subsector',
      descripcion: 'Subsector de la zona norte de Bogotá'
    });

    await subsector1.save();
    await subsector2.save();
    
    console.log('✅ Subsectores de ejemplo creados:');
    console.log('   1.', subsector1.nombre);
    console.log('   2.', subsector2.nombre);

    // Crear algunos indiciados de ejemplo
    const indiciado1 = new Sector({
      nombre: 'Caso 2024-001',
      ownerId: testUser._id,
      parentId: subsector1._id,
      type: 'indiciado',
      descripcion: 'Primer indiciado de ejemplo'
    });

    const indiciado2 = new Sector({
      nombre: 'Caso 2024-002',
      ownerId: testUser._id,
      parentId: subsector1._id,
      type: 'indiciado',
      descripcion: 'Segundo indiciado de ejemplo'
    });

    await indiciado1.save();
    await indiciado2.save();

    console.log('✅ Indiciados de ejemplo creados:');
    console.log('   1.', indiciado1.nombre);
    console.log('   2.', indiciado2.nombre);

    console.log('\n🎉 ¡Base de datos configurada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   - Usuario: admin / admin123');
    console.log('   - 1 Sector principal');
    console.log('   - 2 Subsectores');
    console.log('   - 2 Indiciados');

  } catch (error) {
    console.error('❌ Error creando sector por defecto:', error);
    if (error.code === 11000) {
      console.error('   Posible duplicado en la base de datos');
    }
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  }
};

createDefaultSector();
