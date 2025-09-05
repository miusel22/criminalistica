const mongoose = require('mongoose');
const { sequelize, User, Sector, Vehiculo, Indiciado, syncDatabase } = require('./models/sequelize');
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

// Función para migrar usuarios
const migrateUsers = async () => {
  console.log('👥 Migrando usuarios...');
  
  const mongoUsers = await UserMongo.find();
  console.log(`Encontrados ${mongoUsers.length} usuarios en MongoDB`);
  
  for (const mongoUser of mongoUsers) {
    try {
      // Verificar si el usuario ya existe en PostgreSQL
      const existingUser = await User.findOne({ 
        where: { email: mongoUser.email } 
      });
      
      if (existingUser) {
        console.log(`⚠️  Usuario ${mongoUser.email} ya existe, omitiendo...`);
        continue;
      }
      
      // Migrar usuario
      const userData = {
        id: mongoUser._id.toString(), // Mantener el mismo ID
        username: mongoUser.username,
        email: mongoUser.email,
        password: mongoUser.password, // Ya está hasheado
        fullName: mongoUser.fullName,
        role: mongoUser.role,
        isActive: mongoUser.isActive !== false,
        lastLogin: mongoUser.lastLogin,
        profileImage: mongoUser.profileImage,
        department: mongoUser.department,
        position: mongoUser.position,
        phone: mongoUser.phone,
        emailNotifications: mongoUser.emailNotifications !== false,
        invitedBy: mongoUser.invitedBy?.toString(),
        invitationAcceptedAt: mongoUser.invitationAcceptedAt
      };
      
      // Crear usuario sin triggear el hash (ya está hasheado)
      await User.create(userData, { 
        hooks: false // No ejecutar hooks para mantener password ya hasheado
      });
      
      console.log(`✅ Usuario migrado: ${mongoUser.email}`);
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
  
  for (const mongoSector of mongoSectors) {
    try {
      const sectorData = {
        id: mongoSector._id.toString(),
        nombre: mongoSector.nombre,
        descripcion: mongoSector.descripcion || '',
        codigo: mongoSector.codigo,
        ubicacion: mongoSector.ubicacion || '',
        telefono: mongoSector.telefono || '',
        email: mongoSector.email,
        jefeNombre: mongoSector.jefe?.nombre,
        jefeCargo: mongoSector.jefe?.cargo,
        jefeContacto: mongoSector.jefe?.contacto,
        configuracion: mongoSector.configuracion || {},
        ownerId: mongoSector.ownerId.toString(),
        type: mongoSector.type,
        parentId: mongoSector.parentId?.toString(),
        activo: mongoSector.activo !== false,
        orden: mongoSector.orden || 0
      };
      
      await Sector.create(sectorData);
      console.log(`✅ Sector migrado: ${mongoSector.nombre}`);
    } catch (error) {
      console.error(`❌ Error migrando sector ${mongoSector.nombre}:`, error.message);
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
      const vehiculoData = {
        id: mongoVehiculo._id.toString(),
        sectorQueOpera: mongoVehiculo.sectorQueOpera || '',
        tipoVehiculo: mongoVehiculo.tipoVehiculo,
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
        fechaIncidente: mongoVehiculo.fechaIncidente,
        lugarIncidente: mongoVehiculo.lugarIncidente || '',
        tipoIncidente: mongoVehiculo.tipoIncidente || '',
        observaciones: mongoVehiculo.observaciones || '',
        caracteristicasParticulares: mongoVehiculo.caracteristicasParticulares || '',
        fotos: mongoVehiculo.fotos || [],
        documentosRelacionados: mongoVehiculo.documentosRelacionados || [],
        googleEarthUrl: mongoVehiculo.googleEarthUrl || '',
        ownerId: mongoVehiculo.ownerId.toString(),
        subsectorId: mongoVehiculo.subsectorId.toString(),
        activo: mongoVehiculo.activo !== false
      };
      
      await Vehiculo.create(vehiculoData);
      console.log(`✅ Vehículo migrado: ${mongoVehiculo.placa || 'Sin placa'} - ${mongoVehiculo.marca} ${mongoVehiculo.linea}`);
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
      const indiciadoData = {
        id: mongoIndiciado._id.toString(),
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
        email: mongoIndiciado.email || '',
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
        ownerId: mongoIndiciado.ownerId.toString(),
        subsectorId: mongoIndiciado.subsectorId.toString(),
        activo: mongoIndiciado.activo !== false
      };
      
      await Indiciado.create(indiciadoData);
      console.log(`✅ Indiciado migrado: ${mongoIndiciado.nombre} ${mongoIndiciado.apellidos}`);
    } catch (error) {
      console.error(`❌ Error migrando indiciado ${mongoIndiciado.nombre}:`, error.message);
    }
  }
};

// Función principal de migración
const runMigration = async () => {
  try {
    console.log('🚀 Iniciando migración de MongoDB a PostgreSQL...\n');
    
    // Conectar a ambas bases de datos
    await connectMongoDB();
    
    // Verificar conexión a PostgreSQL
    const pgConnected = await require('./config/database').testConnection();
    if (!pgConnected) {
      throw new Error('No se pudo conectar a PostgreSQL');
    }
    
    // Sincronizar modelos de PostgreSQL (crear tablas)
    console.log('📋 Creando estructura de tablas en PostgreSQL...');
    await syncDatabase(false); // false para no eliminar datos existentes
    
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
