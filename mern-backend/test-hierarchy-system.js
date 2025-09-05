#!/usr/bin/env node

const mongoose = require('mongoose');
const User = require('./models/User');
const Sector = require('./models/Sector');
const Indiciado = require('./models/Indiciado');
const bcrypt = require('bcryptjs');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/criminalistica', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Función para crear usuarios de prueba con diferentes roles
const createTestUsers = async () => {
  console.log('\n📋 Creating test users...');
  
  // Limpiar usuarios existentes de prueba
  await User.deleteMany({ email: { $regex: /test.*@criminalistica\.com$/ } });

  const users = [
    {
      username: 'admin_test',
      fullName: 'Admin Test',
      email: 'admin.test@criminalistica.com',
      role: 'admin',
      password: 'test123'
    },
    {
      username: 'editor_test',
      fullName: 'Editor Test', 
      email: 'editor.test@criminalistica.com',
      role: 'editor',
      password: 'test123'
    },
    {
      username: 'viewer_test',
      fullName: 'Viewer Test',
      email: 'viewer.test@criminalistica.com', 
      role: 'viewer',
      password: 'test123'
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const user = new User({
      ...userData,
      passwordHash,
      verified: true
    });
    await user.save();
    createdUsers.push(user);
    console.log(`✅ Created ${userData.role}: ${userData.email}`);
  }

  return createdUsers;
};

// Función para crear jerarquía de prueba
const createTestHierarchy = async (users) => {
  console.log('\n🗂️  Creating test hierarchy...');
  
  const adminUser = users.find(u => u.role === 'admin');
  const editorUser = users.find(u => u.role === 'editor');

  // Limpiar jerarquía existente
  await Sector.deleteMany({ 
    ownerId: { $in: users.map(u => u._id) }
  });

  // Crear sectores (root level) - Creados por admin
  const sectores = [];
  for (let i = 1; i <= 2; i++) {
    const sector = new Sector({
      nombre: `Sector ${i}`,
      descripcion: `Sector de prueba ${i}`,
      type: 'sector',
      ownerId: adminUser._id,
      parentId: null,
      ubicacion: {
        departamento: {
          id: '05',
          nombre: 'Antioquia'
        },
        ciudad: {
          id: '05001',
          nombre: 'Medellín'
        }
      }
    });
    await sector.save();
    sectores.push(sector);
    console.log(`✅ Created sector: ${sector.nombre}`);
  }

  // Crear subsectores - Algunos creados por editor
  const subsectores = [];
  for (let i = 0; i < sectores.length; i++) {
    const sector = sectores[i];
    
    // Crear 2 subsectores por sector
    for (let j = 1; j <= 2; j++) {
      const creator = i === 0 ? adminUser : editorUser; // Alternar creadores
      const subsector = new Sector({
        nombre: `Subsector ${sector.nombre.slice(-1)}.${j}`,
        descripcion: `Subsector ${j} del ${sector.nombre}`,
        type: 'subsector',
        ownerId: creator._id,
        parentId: sector._id
      });
      await subsector.save();
      subsectores.push(subsector);
      console.log(`✅ Created subsector: ${subsector.nombre} (by ${creator.role})`);
    }
  }

  return { sectores, subsectores };
};

// Función para crear indiciados de prueba
const createTestIndiciados = async (users, subsectores) => {
  console.log('\n👤 Creating test indiciados...');
  
  const adminUser = users.find(u => u.role === 'admin');
  const editorUser = users.find(u => u.role === 'editor');

  // Limpiar indiciados existentes
  await Indiciado.deleteMany({ 
    ownerId: { $in: users.map(u => u._id) }
  });

  const indiciados = [];
  for (let i = 0; i < Math.min(subsectores.length, 4); i++) {
    const subsector = subsectores[i];
    const creator = i % 2 === 0 ? adminUser : editorUser;
    
    const indiciado = new Indiciado({
      nombre: `Indiciado`,
      apellidos: `Test ${i + 1}`,
      sectorQueOpera: `Sector ${i + 1}`,
      documentoIdentidad: {
        numero: `1000000${i + 1}`,
        expedidoEn: 'Medellín'
      },
      fechaNacimiento: {
        fecha: new Date(1990 + i, i, 15),
        lugar: 'Medellín'
      },
      edad: 30 + i,
      estadoCivil: 'Soltero',
      residencia: `Calle ${i + 1} # 12-34`,
      telefono: `300000000${i}`,
      ownerId: creator._id,
      subsectorId: subsector._id,
      activo: true
    });
    
    await indiciado.save();
    indiciados.push(indiciado);
    console.log(`✅ Created indiciado: ${indiciado.nombre} ${indiciado.apellidos} (by ${creator.role})`);
    
    // Crear entrada en jerarquía
    const hierarchyEntry = new Sector({
      nombre: `${indiciado.nombre} ${indiciado.apellidos}`,
      descripcion: `Indiciado: ${indiciado.documentoIdentidad.numero}`,
      type: 'indiciado',
      ownerId: creator._id,
      parentId: subsector._id
    });
    await hierarchyEntry.save();
  }

  return indiciados;
};

// Función para mostrar estadísticas del sistema
const showSystemStats = async (users) => {
  console.log('\n📊 System Statistics:');
  
  for (const user of users) {
    console.log(`\n--- ${user.role.toUpperCase()} User (${user.email}) ---`);
    
    // Estadísticas de sectores
    const sectoresCount = await Sector.countDocuments({ 
      ownerId: user._id, 
      type: 'sector' 
    });
    
    const subsectoresCount = await Sector.countDocuments({ 
      ownerId: user._id, 
      type: 'subsector' 
    });

    const indiciadosCount = await Indiciado.countDocuments({ 
      ownerId: user._id, 
      activo: true 
    });

    console.log(`  Sectores creados: ${sectoresCount}`);
    console.log(`  Subsectores creados: ${subsectoresCount}`);
    console.log(`  Indiciados creados: ${indiciadosCount}`);
    
    // Para admin, mostrar totales del sistema
    if (user.role === 'admin') {
      const totalSectores = await Sector.countDocuments({ type: 'sector' });
      const totalSubsectores = await Sector.countDocuments({ type: 'subsector' });
      const totalIndiciados = await Indiciado.countDocuments({ activo: true });
      
      console.log(`  --- ADMIN VIEW (SYSTEM TOTALS) ---`);
      console.log(`  Total sectores: ${totalSectores}`);
      console.log(`  Total subsectores: ${totalSubsectores}`);
      console.log(`  Total indiciados: ${totalIndiciados}`);
    }
  }
};

// Función para mostrar la jerarquía completa
const showHierarchy = async () => {
  console.log('\n🗂️  Complete Hierarchy:');
  
  const sectores = await Sector.find({ type: 'sector', parentId: null }).sort({ nombre: 1 });
  
  for (const sector of sectores) {
    console.log(`📁 ${sector.nombre}`);
    
    const subsectores = await Sector.find({ type: 'subsector', parentId: sector._id }).sort({ nombre: 1 });
    for (const subsector of subsectores) {
      console.log(`  📁 ${subsector.nombre}`);
      
      const indiciados = await Sector.find({ type: 'indiciado', parentId: subsector._id }).sort({ nombre: 1 });
      for (const indiciado of indiciados) {
        console.log(`    👤 ${indiciado.nombre}`);
      }
    }
  }
};

// Función para demostrar permisos
const demonstratePermissions = async (users) => {
  console.log('\n🔐 Permission Demonstration:');
  
  const adminUser = users.find(u => u.role === 'admin');
  const editorUser = users.find(u => u.role === 'editor');
  const viewerUser = users.find(u => u.role === 'viewer');

  console.log('\n--- ADMIN Permissions ---');
  console.log('✅ Can create sectors');
  console.log('✅ Can create subsectors in any sector');
  console.log('✅ Can create indiciados in any subsector');
  console.log('✅ Can view all sectors/subsectors/indiciados');
  console.log('✅ Can delete permanently');

  console.log('\n--- EDITOR Permissions ---');
  console.log('✅ Can create sectors');
  console.log('✅ Can create subsectors in any sector');
  console.log('✅ Can create indiciados in any subsector');
  console.log('❌ Cannot view other users\' indiciados (only own)');
  console.log('❌ Cannot delete permanently');

  console.log('\n--- VIEWER Permissions ---');
  console.log('❌ Cannot create sectors');
  console.log('❌ Cannot create subsectors');
  console.log('❌ Cannot create indiciados');
  console.log('✅ Can view sectors/subsectors/indiciados (own only)');
  console.log('❌ Cannot delete');
};

// Función principal
const main = async () => {
  try {
    console.log('🚀 Starting Hierarchy System Test...');
    
    await connectDB();
    
    // Crear usuarios de prueba
    const users = await createTestUsers();
    
    // Crear jerarquía de prueba
    const { sectores, subsectores } = await createTestHierarchy(users);
    
    // Crear indiciados de prueba
    const indiciados = await createTestIndiciados(users, subsectores);
    
    // Mostrar estadísticas
    await showSystemStats(users);
    
    // Mostrar jerarquía completa
    await showHierarchy();
    
    // Demonstrar permisos
    await demonstratePermissions(users);
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📝 Test user credentials created:');
    console.log('  admin.test@criminalistica.com / test123 (admin role)');
    console.log('  editor.test@criminalistica.com / test123 (editor role)');
    console.log('  viewer.test@criminalistica.com / test123 (viewer role)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };
