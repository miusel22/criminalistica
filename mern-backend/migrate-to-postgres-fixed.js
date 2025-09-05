const mongoose = require('mongoose');
const { sequelize, User, Sector, Vehiculo, Indiciado, syncDatabase } = require('./models/sequelize');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import MongoDB models
const UserMongo = require('./models/User');
const SectorMongo = require('./models/Sector');
const VehiculoMongo = require('./models/Vehiculo');
const IndiciadoMongo = require('./models/Indiciado');

// Conectar a MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 MongoDB connected for migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Maps para mantener relaciones entre IDs
const userIdMap = new Map();
const sectorIdMap = new Map();

// Función para migrar usuarios
const migrateUsers = async () => {
  console.log('👥 Migrando usuarios...');
  
  const mongoUsers = await UserMongo.find();
  console.log(`Encontrados ${mongoUsers.length} usuarios en MongoDB`);
  
  for (const mongoUser of mongoUsers) {
    try {
      // Generar nuevo UUID para PostgreSQL
      const newUserId = uuidv4();
      userIdMap.set(mongoUser._id.toString(), newUserId);
      
      // Verificar si el usuario ya existe en PostgreSQL
      const existingUser = await User.findOne({ 
        where: { email: mongoUser.email } 
      });
      
      if (existingUser) {
        console.log(`⚠️  Usuario ${mongoUser.email} ya existe, omitiendo...`);
        userIdMap.set(mongoUser._id.toString(), existingUser.id);
        continue;
      }
      
      // Migrar usuario con password seguro
      const userData = {
        id: newUserId,
        username: mongoUser.username || mongoUser.email.split('@')[0],
        email: mongoUser.email,
        password: mongoUser.password || '$2a$10$defaultHashForMigration123456789', // Password temporal si no existe
        fullName: mongoUser.fullName || '',
        role: mongoUser.role || 'viewer',
        isActive: mongoUser.isActive !== false,
        lastLogin: mongoUser.lastLogin,
        profileImage: mongoUser.profileImage || '',
        department: mongoUser.department || '',
        position: mongoUser.position || '',
        phone: mongoUser.phone || '',
        emailNotifications: mongoUser.emailNotifications !== false,
        invitedBy: null, // Se manejará después si hay referencias
        invitationAcceptedAt: mongoUser.invitationAcceptedAt,
        createdAt: mongoUser.createdAt || new Date(),
        updatedAt: mongoUser.updatedAt || new Date()
      };
      
      // Crear usuario sin triggear el hash (ya está hasheado)
      await User.create(userData, { 
        hooks: false // No ejecutar hooks para mantener password ya hasheado
      });
      
      console.log(`✅ Usuario migrado: ${mongoUser.email} (${newUserId})`);
    } catch (error) {
      console.error(`❌ Error migrando usuario ${mongoUser.email}:`, error.message);
    }
  }
};

// Función para migrar sectores
const migrateSectors = async () => {
  console.log('📁 Migrando sectores...');
  
  const mongoSectors = await SectorMongo.find();
  console.log(`Encontrados ${mongoSectors.length} sectores/subsectores en MongoDB`);
  
  // Primero migrar sectores padre (sin parentId)
  const sectoresPadre = mongoSectors.filter(s => !s.parentId);
  const subsectores = mongoSectors.filter(s => s.parentId);
  
  // Migrar sectores padre primero
  for (const mongoSector of sectoresPadre) {
    try {
      const newSectorId = uuidv4();
      sectorIdMap.set(mongoSector._id.toString(), newSectorId);
      
      // Obtener el ID del usuario propietario
      const ownerId = userIdMap.get(mongoSector.ownerId.toString());
      if (!ownerId) {
        console.log(`⚠️  No se encontró el propietario para el sector ${mongoSector.nombre}, omitiendo...`);
        continue;
      }
      
      // Manejar ubicación - si es array, convertir a string
      let ubicacion = mongoSector.ubicacion || '';
      if (Array.isArray(ubicacion)) {
        ubicacion = ubicacion.join(', ');
      } else if (typeof ubicacion === 'object') {
        ubicacion = JSON.stringify(ubicacion);
      }
      
      const sectorData = {
        id: newSectorId,
        nombre: mongoSector.nombre,
        descripcion: mongoSector.descripcion || '',
        codigo: mongoSector.codigo || null,
        ubicacion: ubicacion,
        telefono: mongoSector.telefono || '',
        email: mongoSector.email || null,
        jefeNombre: mongoSector.jefe?.nombre || null,
        jefeCargo: mongoSector.jefe?.cargo || null,
        jefeContacto: mongoSector.jefe?.contacto || null,
        configuracion: mongoSector.configuracion || {},
        ownerId: ownerId,
        type: mongoSector.type || 'sector',
        parentId: null, // Es un sector padre
        activo: mongoSector.activo !== false,
        orden: mongoSector.orden || 0,
        createdAt: mongoSector.createdAt || new Date(),
        updatedAt: mongoSector.updatedAt || new Date()
      };
      
      await Sector.create(sectorData);
      console.log(`✅ Sector migrado: ${mongoSector.nombre} (${newSectorId})`);
    } catch (error) {
      console.error(`❌ Error migrando sector ${mongoSector.nombre}:`, error.message);
    }
  }
  
  // Luego migrar subsectores
  for (const mongoSector of subsectores) {
    try {
      const newSectorId = uuidv4();
      sectorIdMap.set(mongoSector._id.toString(), newSectorId);
      
      // Obtener el ID del usuario propietario
      const ownerId = userIdMap.get(mongoSector.ownerId.toString());
      if (!ownerId) {
        console.log(`⚠️  No se encontró el propietario para el subsector ${mongoSector.nombre}, omitiendo...`);
        continue;
      }
      
      // Obtener el ID del sector padre
      const parentId = sectorIdMap.get(mongoSector.parentId.toString());
      if (!parentId) {
        console.log(`⚠️  No se encontró el sector padre para el subsector ${mongoSector.nombre}, omitiendo...`);
        continue;
      }
      
      // Manejar ubicación - si es array, convertir a string
      let ubicacion = mongoSector.ubicacion || '';
      if (Array.isArray(ubicacion)) {
        ubicacion = ubicacion.join(', ');
      } else if (typeof ubicacion === 'object') {
        ubicacion = JSON.stringify(ubicacion);
      }
      
      const sectorData = {
        id: newSectorId,
        nombre: mongoSector.nombre,
        descripcion: mongoSector.descripcion || '',
        codigo: mongoSector.codigo || null,
        ubicacion: ubicacion,
        telefono: mongoSector.telefono || '',
        email: mongoSector.email || null,
        jefeNombre: mongoSector.jefe?.nombre || null,
        jefeCargo: mongoSector.jefe?.cargo || null,
        jefeContacto: mongoSector.jefe?.contacto || null,
        configuracion: mongoSector.configuracion || {},
        ownerId: ownerId,
        type: mongoSector.type || 'subsector',
        parentId: parentId,
        activo: mongoSector.activo !== false,
        orden: mongoSector.orden || 0,
        createdAt: mongoSector.createdAt || new Date(),
        updatedAt: mongoSector.updatedAt || new Date()
      };
      
      await Sector.create(sectorData);
      console.log(`✅ Subsector migrado: ${mongoSector.nombre} (${newSectorId})`);
    } catch (error) {
      console.error(`❌ Error migrando subsector ${mongoSector.nombre}:`, error.message);
    }
  }
};

// Función para migrar vehículos
const migrateVehiculos = async () => {
  console.log('🚗 Migrando vehículos...');
  
  const mongoVehiculos = await VehiculoMongo.find();
  console.log(`Encontrados ${mongoVehiculos.length} vehículos en MongoDB`);
  
  for (const mongoVehiculo of mongoVehiculos) {
    try {
      const newVehiculoId = uuidv4();
      
      // Obtener IDs de usuario y subsector
      const ownerId = userIdMap.get(mongoVehiculo.ownerId.toString());
      const subsectorId = sectorIdMap.get(mongoVehiculo.subsectorId.toString());
      
      if (!ownerId) {
        console.log(`⚠️  No se encontró el propietario para el vehículo ${mongoVehiculo.placa}, omitiendo...`);
        continue;
      }
      
      if (!subsectorId) {
        console.log(`⚠️  No se encontró el subsector para el vehículo ${mongoVehiculo.placa}, omitiendo...`);
        continue;
      }
      
      const vehiculoData = {
        id: newVehiculoId,
        sectorQueOpera: mongoVehiculo.sectorQueOpera || '',
        tipoVehiculo: mongoVehiculo.tipoVehiculo || 'Otro',
        marca: mongoVehiculo.marca || '',
        linea: mongoVehiculo.linea || '',
        modelo: mongoVehiculo.modelo || '',
        placa: mongoVehiculo.placa || '',
        numeroChasis: mongoVehiculo.numeroChasis || '',
        numeroMotor: mongoVehiculo.numeroMotor || '',
        color: mongoVehiculo.color || '',
        cilindraje: mongoVehiculo.cilindraje || '',
        combustible: mongoVehiculo.combustible || null,
        propietario: mongoVehiculo.propietario || {
          nombre: '',
          documento: { tipo: '', numero: '' },
          telefono: '',
          direccion: ''
        },
        soat: mongoVehiculo.soat || {
          numeroPoliza: '',
          vigencia: null,
          aseguradora: ''
        },
        tecnomecanica: mongoVehiculo.tecnomecanica || {
          numero: '',
          vigencia: null,
          cda: ''
        },
        estado: mongoVehiculo.estado || 'Activo',
        fechaIncidente: mongoVehiculo.fechaIncidente || null,
        lugarIncidente: mongoVehiculo.lugarIncidente || '',
        tipoIncidente: mongoVehiculo.tipoIncidente || '',
        observaciones: mongoVehiculo.observaciones || '',
        caracteristicasParticulares: mongoVehiculo.caracteristicasParticulares || '',
        fotos: mongoVehiculo.fotos || [],
        documentosRelacionados: mongoVehiculo.documentosRelacionados || [],
        googleEarthUrl: mongoVehiculo.googleEarthUrl || '',
        ownerId: ownerId,
        subsectorId: subsectorId,
        activo: mongoVehiculo.activo !== false,
        createdAt: mongoVehiculo.createdAt || new Date(),
        updatedAt: mongoVehiculo.updatedAt || new Date()
      };
      
      await Vehiculo.create(vehiculoData);
      console.log(`✅ Vehículo migrado: ${mongoVehiculo.placa || 'Sin placa'} - ${mongoVehiculo.marca} ${mongoVehiculo.linea} (${newVehiculoId})`);
    } catch (error) {
      console.error(`❌ Error migrando vehículo ${mongoVehiculo.placa}:`, error.message);
    }
  }
};

// Función para migrar indiciados
const migrateIndiciados = async () => {
  console.log('👤 Migrando indiciados...');
  
  const mongoIndiciados = await IndiciadoMongo.find();
  console.log(`Encontrados ${mongoIndiciados.length} indiciados en MongoDB`);
  
  for (const mongoIndiciado of mongoIndiciados) {
    try {
      const newIndiciadoId = uuidv4();
      
      // Obtener IDs de usuario y subsector
      const ownerId = userIdMap.get(mongoIndiciado.ownerId.toString());
      const subsectorId = sectorIdMap.get(mongoIndiciado.subsectorId.toString());
      
      if (!ownerId) {
        console.log(`⚠️  No se encontró el propietario para el indiciado ${mongoIndiciado.nombre}, omitiendo...`);
        continue;
      }
      
      if (!subsectorId) {
        console.log(`⚠️  No se encontró el subsector para el indiciado ${mongoIndiciado.nombre}, omitiendo...`);
        continue;
      }
      
      // Validar email - si no es válido, usar string vacío
      let email = mongoIndiciado.email || '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        console.log(`⚠️  Email inválido para ${mongoIndiciado.nombre}: ${email}, usando email vacío`);
        email = '';
      }
      
      const indiciadoData = {
        id: newIndiciadoId,
        sectorQueOpera: mongoIndiciado.sectorQueOpera || '',
        nombre: mongoIndiciado.nombre,
        apellidos: mongoIndiciado.apellidos,
        alias: mongoIndiciado.alias || '',
        documentoIdentidad: mongoIndiciado.documentoIdentidad || {
          tipo: '',
          numero: '',
          expedidoEn: ''
        },
        fechaNacimiento: mongoIndiciado.fechaNacimiento || {
          fecha: null,
          lugar: ''
        },
        edad: mongoIndiciado.edad,
        hijoDe: mongoIndiciado.hijoDe || '',
        genero: mongoIndiciado.genero || null,
        estadoCivil: mongoIndiciado.estadoCivil || null,
        nacionalidad: mongoIndiciado.nacionalidad || '',
        residencia: mongoIndiciado.residencia || '',
        direccion: mongoIndiciado.direccion || '',
        telefono: mongoIndiciado.telefono || '',
        email: email,
        estudiosRealizados: mongoIndiciado.estudiosRealizados || '',
        profesion: mongoIndiciado.profesion || '',
        oficio: mongoIndiciado.oficio || '',
        senalesFisicas: mongoIndiciado.senalesFisicas || {
          estatura: '',
          peso: '',
          contexturaFisica: '',
          colorPiel: '',
          colorOjos: '',
          colorCabello: '',
          marcasEspeciales: '',
          tatuajes: '',
          cicatrices: '',
          piercing: '',
          deformidades: '',
          otras: ''
        },
        informacionMedica: mongoIndiciado.informacionMedica || {
          enfermedades: '',
          medicamentos: '',
          alergias: '',
          discapacidades: '',
          adicciones: '',
          tratamientos: ''
        },
        informacionDelito: mongoIndiciado.informacionDelito || {
          fechaDelito: null,
          lugarDelito: '',
          tipoDelito: '',
          modalidad: '',
          descripcionHechos: '',
          victimas: [],
          testigos: [],
          coautores: []
        },
        informacionJudicial: mongoIndiciado.informacionJudicial || {
          numeroRadicado: '',
          fiscalAsignado: '',
          juzgado: '',
          estadoProceso: '',
          fechaCaptura: null,
          lugarCaptura: '',
          ordenesPendientes: [],
          antecedentes: []
        },
        informacionPolicial: mongoIndiciado.informacionPolicial || {
          unidadCaptura: '',
          investigadorAsignado: '',
          numeroInvestigacion: '',
          clasificacionRiesgo: '',
          observacionesEspeciales: ''
        },
        estado: mongoIndiciado.estado || 'Activo',
        foto: mongoIndiciado.foto || {
          filename: '',
          originalName: '',
          mimeType: '',
          size: 0,
          path: '',
          fechaSubida: null
        },
        fotosAdicionales: mongoIndiciado.fotosAdicionales || [],
        documentosRelacionados: mongoIndiciado.documentosRelacionados || [],
        googleEarthUrl: mongoIndiciado.googleEarthUrl || '',
        observaciones: mongoIndiciado.observaciones || '',
        ownerId: ownerId,
        subsectorId: subsectorId,
        activo: mongoIndiciado.activo !== false,
        createdAt: mongoIndiciado.createdAt || new Date(),
        updatedAt: mongoIndiciado.updatedAt || new Date()
      };
      
      await Indiciado.create(indiciadoData);
      console.log(`✅ Indiciado migrado: ${mongoIndiciado.nombre} ${mongoIndiciado.apellidos} (${newIndiciadoId})`);
    } catch (error) {
      console.error(`❌ Error migrando indiciado ${mongoIndiciado.nombre}:`, error.message);
    }
  }
};

// Función principal de migración
const runMigration = async () => {
  try {
    console.log('🚀 Iniciando migración de MongoDB a PostgreSQL...\\n');
    
    // Conectar a ambas bases de datos
    await connectMongoDB();
    
    // Verificar conexión a PostgreSQL
    const pgConnected = await require('./config/database').testConnection();
    if (!pgConnected) {
      throw new Error('No se pudo conectar a PostgreSQL');
    }
    
    // Sincronizar modelos de PostgreSQL (crear tablas)
    console.log('📋 Creando estructura de tablas en PostgreSQL...');
    await syncDatabase(true); // true para forzar recreación (cuidado con datos existentes)
    
    // Migrar datos en orden de dependencias
    await migrateUsers();
    console.log('');
    
    await migrateSectors();
    console.log('');
    
    await migrateVehiculos();
    console.log('');
    
    await migrateIndiciados();
    console.log('');
    
    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('');
    console.log('📊 Resumen de la migración:');
    
    // Mostrar estadísticas
    const statsUsers = await User.count();
    const statsSectors = await Sector.count();
    const statsVehiculos = await Vehiculo.count();
    const statsIndiciados = await Indiciado.count();
    
    console.log(`   👥 Usuarios: ${statsUsers}`);
    console.log(`   📁 Sectores/Subsectores: ${statsSectors}`);
    console.log(`   🚗 Vehículos: ${statsVehiculos}`);
    console.log(`   👤 Indiciados: ${statsIndiciados}`);
    console.log('');
    console.log('✨ Para usar PostgreSQL, ejecuta: npm run start:postgres');
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    throw error;
  } finally {
    // Cerrar conexiones
    await mongoose.connection.close();
    await sequelize.close();
  }
};

// Ejecutar migración si se llama directamente
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🏁 Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falló la migración:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
