const mongoose = require('mongoose');
const Sector = require('../models/Sector');
require('dotenv').config();

const createSectorForTestAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Buscar el usuario testadmin
    const user = await mongoose.connection.db.collection('users').findOne({ username: 'testadmin' });
    if (!user) {
      console.log('❌ Usuario testadmin no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:', user.username, 'ID:', user._id);

    // Crear sector por defecto
    const defaultSector = new Sector({
      nombre: 'Sector Bogotá - Bogotá D.C.',
      ownerId: user._id,
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

    // Crear algunos subsectores de ejemplo
    const subsector1 = new Sector({
      nombre: 'Centro Histórico',
      ownerId: user._id,
      parentId: defaultSector._id,
      type: 'subsector',
      descripcion: 'Subsector del centro histórico de Bogotá'
    });

    const subsector2 = new Sector({
      nombre: 'Zona Norte',
      ownerId: user._id,
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
      ownerId: user._id,
      parentId: subsector1._id,
      type: 'indiciado',
      descripcion: 'Primer indiciado de ejemplo'
    });

    const indiciado2 = new Sector({
      nombre: 'Caso 2024-002',
      ownerId: user._id,
      parentId: subsector1._id,
      type: 'indiciado',
      descripcion: 'Segundo indiciado de ejemplo'
    });

    await indiciado1.save();
    await indiciado2.save();

    console.log('✅ Indiciados de ejemplo creados:');
    console.log('   1.', indiciado1.nombre);
    console.log('   2.', indiciado2.nombre);

    console.log('\n🎉 ¡Sectores creados exitosamente para testadmin!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSectorForTestAdmin();
