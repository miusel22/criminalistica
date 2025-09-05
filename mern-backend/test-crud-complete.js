const axios = require('axios');

const BASE_URL = 'http://localhost:5004/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwOGM3NmFkLWQ0MmEtNGJiZS1iNjAxLTY1MThmNzYxZTE1NyIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJhZG1pbl8xNzU2MTQ5NjQzMTIwIiwiaWF0IjoxNzU2MTQ5NzE4LCJleHAiOjE3NTY3NTQ1MTh9.LbMjDIfkMQ1Rg2GUP6Ug3tlRORJyd3WNqHTnYzHBd-w';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testCRUD() {
  console.log('🧪 INICIANDO PRUEBAS CRUD COMPLETAS\n');
  
  let createdSectorId = null;
  let createdSubsectorId = null;
  let createdIndiciadoId = null;
  let createdVehiculoId = null;

  try {
    // =====================
    // PRUEBAS DE SECTORES
    // =====================
    console.log('📁 PRUEBAS DE SECTORES');
    console.log('======================');

    // 1. Crear sector
    console.log('1. Crear sector...');
    const timestamp = Date.now();
    const sectorData = {
      nombre: `Sector Prueba CRUD ${timestamp}`,
      descripcion: 'Sector de prueba para testing CRUD',
      codigo: `CRUD${timestamp}`,
      ubicacion: 'Ubicación de prueba'
    };

    const createSectorResponse = await axios.post(`${BASE_URL}/sectores`, sectorData, { headers });
    console.log('✅ Sector creado:', createSectorResponse.data.sector.nombre);
    createdSectorId = createSectorResponse.data.sector.id;

    // 2. Obtener todos los sectores
    console.log('2. Obtener todos los sectores...');
    const getSectoresResponse = await axios.get(`${BASE_URL}/sectores`, { headers });
    console.log(`✅ Sectores obtenidos: ${getSectoresResponse.data.sectores.length} sectores`);

    // 3. Obtener sector por ID
    console.log('3. Obtener sector por ID...');
    const getSectorResponse = await axios.get(`${BASE_URL}/sectores/${createdSectorId}`, { headers });
    console.log('✅ Sector obtenido:', getSectorResponse.data.nombre);

    // 4. Actualizar sector
    console.log('4. Actualizar sector...');
    const updateSectorData = {
      nombre: `Sector Prueba CRUD Actualizado ${timestamp}`,
      descripcion: 'Sector actualizado para testing CRUD'
    };
    const updateSectorResponse = await axios.put(`${BASE_URL}/sectores/${createdSectorId}`, updateSectorData, { headers });
    console.log('✅ Sector actualizado:', updateSectorResponse.data.sector.nombre);

    // ========================
    // PRUEBAS DE SUBSECTORES
    // ========================
    console.log('\n📂 PRUEBAS DE SUBSECTORES');
    console.log('==========================');

    // 1. Crear subsector
    console.log('1. Crear subsector...');
    const subsectorData = {
      nombre: `Subsector Prueba CRUD ${timestamp}`,
      descripcion: 'Subsector de prueba para testing CRUD',
      codigo: `SUBCRUD${timestamp}`,
      parentId: createdSectorId
    };

    const createSubsectorResponse = await axios.post(`${BASE_URL}/subsectores`, subsectorData, { headers });
    console.log('✅ Subsector creado:', createSubsectorResponse.data.subsector.nombre);
    createdSubsectorId = createSubsectorResponse.data.subsector.id;

    // 2. Obtener todos los subsectores
    console.log('2. Obtener todos los subsectores...');
    const getSubsectoresResponse = await axios.get(`${BASE_URL}/subsectores`, { headers });
    console.log(`✅ Subsectores obtenidos: ${getSubsectoresResponse.data.length} subsectores`);

    // 3. Obtener subsectores por sector
    console.log('3. Obtener subsectores por sector...');
    const getSubsectoresBySectorResponse = await axios.get(`${BASE_URL}/subsectores/sector/${createdSectorId}`, { headers });
    console.log(`✅ Subsectores del sector: ${getSubsectoresBySectorResponse.data.length} subsectores`);

    // 4. Obtener subsector por ID
    console.log('4. Obtener subsector por ID...');
    const getSubsectorResponse = await axios.get(`${BASE_URL}/subsectores/${createdSubsectorId}`, { headers });
    console.log('✅ Subsector obtenido:', getSubsectorResponse.data.nombre);

    // 5. Actualizar subsector
    console.log('5. Actualizar subsector...');
    const updateSubsectorData = {
      nombre: `Subsector Prueba CRUD Actualizado ${timestamp}`,
      descripcion: 'Subsector actualizado para testing CRUD'
    };
    const updateSubsectorResponse = await axios.put(`${BASE_URL}/subsectores/${createdSubsectorId}`, updateSubsectorData, { headers });
    console.log('✅ Subsector actualizado:', updateSubsectorResponse.data.subsector.nombre);

    // =====================
    // PRUEBAS DE INDICIADOS
    // =====================
    console.log('\n👤 PRUEBAS DE INDICIADOS');
    console.log('========================');

    // 1. Crear indiciado
    console.log('1. Crear indiciado...');
    const indiciadoData = {
      nombre: 'Juan Carlos',
      apellidos: 'Pérez García',
      cedula: `12345${Date.now().toString().slice(-3)}`,
      genero: 'Masculino',
      fechaNacimiento: '1990-05-15',
      estadoCivil: 'Soltero',
      telefono: '3001234567',
      email: 'juan.perez@test.com',
      direccion: 'Calle 123 #45-67',
      ocupacion: 'Empleado',
      estado: 'Activo',
      observaciones: 'Indiciado de prueba CRUD',
      sectorQueOpera: `Sector Prueba CRUD Actualizado ${timestamp}`,
      subsectorId: createdSubsectorId
    };

    const createIndiciadoResponse = await axios.post(`${BASE_URL}/indiciados`, indiciadoData, { headers });
    console.log('✅ Indiciado creado:', `${createIndiciadoResponse.data.indiciado.nombre} ${createIndiciadoResponse.data.indiciado.apellidos}`);
    createdIndiciadoId = createIndiciadoResponse.data.indiciado.id;

    // 2. Obtener todos los indiciados
    console.log('2. Obtener todos los indiciados...');
    const getIndiciadosResponse = await axios.get(`${BASE_URL}/indiciados`, { headers });
    console.log(`✅ Indiciados obtenidos: ${getIndiciadosResponse.data.length} indiciados`);

    // 3. Obtener indiciado por ID
    console.log('3. Obtener indiciado por ID...');
    const getIndiciadoResponse = await axios.get(`${BASE_URL}/indiciados/${createdIndiciadoId}`, { headers });
    console.log('✅ Indiciado obtenido:', `${getIndiciadoResponse.data.nombre} ${getIndiciadoResponse.data.apellidos}`);

    // 4. Obtener indiciados por sector
    console.log('4. Obtener indiciados por sector...');
    const getIndiciadosBySectorResponse = await axios.get(`${BASE_URL}/indiciados/sector/${encodeURIComponent(`Sector Prueba CRUD Actualizado ${timestamp}`)}`, { headers });
    console.log(`✅ Indiciados del sector: ${getIndiciadosBySectorResponse.data.length} indiciados`);

    // 5. Actualizar indiciado
    console.log('5. Actualizar indiciado...');
    const updateIndiciadoData = {
      nombre: 'Juan Carlos Actualizado',
      apellidos: 'Pérez García',
      telefono: '3009876543',
      observaciones: 'Indiciado actualizado para testing CRUD'
    };
    const updateIndiciadoResponse = await axios.put(`${BASE_URL}/indiciados/${createdIndiciadoId}`, updateIndiciadoData, { headers });
    console.log('✅ Indiciado actualizado:', `${updateIndiciadoResponse.data.indiciado.nombre} ${updateIndiciadoResponse.data.indiciado.apellidos}`);

    // =====================
    // PRUEBAS DE VEHÍCULOS
    // =====================
    console.log('\n🚗 PRUEBAS DE VEHÍCULOS');
    console.log('========================');

    // 1. Crear vehículo
    console.log('1. Crear vehículo...');
    const vehiculoData = {
      tipoVehiculo: 'Automóvil',
      marca: 'Toyota',
      linea: 'Corolla',
      modelo: '2020',
      placa: `ABC${timestamp.toString().slice(-3)}`,
      color: 'Blanco',
      numeroChasis: `TOY${timestamp}`,
      numeroMotor: `MOT${timestamp}`,
      combustible: 'Gasolina',
      estado: 'Activo',
      observaciones: 'Vehículo de prueba CRUD',
      sectorQueOpera: `Sector Prueba CRUD Actualizado ${timestamp}`,
      subsectorId: createdSubsectorId
    };

    const createVehiculoResponse = await axios.post(`${BASE_URL}/vehiculos`, vehiculoData, { headers });
    console.log('✅ Vehículo creado:', `${createVehiculoResponse.data.vehiculo.marca} ${createVehiculoResponse.data.vehiculo.linea}`);
    createdVehiculoId = createVehiculoResponse.data.vehiculo.id;

    // 2. Obtener todos los vehículos
    console.log('2. Obtener todos los vehículos...');
    const getVehiculosResponse = await axios.get(`${BASE_URL}/vehiculos`, { headers });
    console.log(`✅ Vehículos obtenidos: ${getVehiculosResponse.data.length} vehículos`);

    // 3. Obtener vehículo por ID
    console.log('3. Obtener vehículo por ID...');
    const getVehiculoResponse = await axios.get(`${BASE_URL}/vehiculos/${createdVehiculoId}`, { headers });
    console.log('✅ Vehículo obtenido:', `${getVehiculoResponse.data.marca} ${getVehiculoResponse.data.linea}`);

    // 4. Obtener vehículos por sector
    console.log('4. Obtener vehículos por sector...');
    const getVehiculosBySectorResponse = await axios.get(`${BASE_URL}/vehiculos/sector/${encodeURIComponent(`Sector Prueba CRUD Actualizado ${timestamp}`)}`, { headers });
    console.log(`✅ Vehículos del sector: ${getVehiculosBySectorResponse.data.length} vehículos`);

    // 5. Buscar vehículo por placa
    console.log('5. Buscar vehículo por placa...');
    const getVehiculoByPlacaResponse = await axios.get(`${BASE_URL}/vehiculos/placa/ABC${timestamp.toString().slice(-3)}`, { headers });
    console.log('✅ Vehículo por placa:', `${getVehiculoByPlacaResponse.data.marca} ${getVehiculoByPlacaResponse.data.linea}`);

    // 6. Actualizar vehículo
    console.log('6. Actualizar vehículo...');
    const updateVehiculoData = {
      marca: 'Toyota',
      linea: 'Corolla Actualizado',
      color: 'Negro',
      observaciones: 'Vehículo actualizado para testing CRUD'
    };
    const updateVehiculoResponse = await axios.put(`${BASE_URL}/vehiculos/${createdVehiculoId}`, updateVehiculoData, { headers });
    console.log('✅ Vehículo actualizado:', `${updateVehiculoResponse.data.vehiculo.marca} ${updateVehiculoResponse.data.vehiculo.linea}`);

    // ====================
    // PRUEBAS DE ELIMINACIÓN
    // ====================
    console.log('\n🗑️ PRUEBAS DE ELIMINACIÓN');
    console.log('=========================');

    // 1. Eliminar indiciado
    console.log('1. Eliminar indiciado...');
    await axios.delete(`${BASE_URL}/indiciados/${createdIndiciadoId}`, { headers });
    console.log('✅ Indiciado eliminado correctamente');

    // 2. Eliminar vehículo
    console.log('2. Eliminar vehículo...');
    await axios.delete(`${BASE_URL}/vehiculos/${createdVehiculoId}`, { headers });
    console.log('✅ Vehículo eliminado correctamente');

    // 3. Eliminar subsector
    console.log('3. Eliminar subsector...');
    await axios.delete(`${BASE_URL}/subsectores/${createdSubsectorId}`, { headers });
    console.log('✅ Subsector eliminado correctamente');

    // 4. Eliminar sector
    console.log('4. Eliminar sector...');
    await axios.delete(`${BASE_URL}/sectores/${createdSectorId}`, { headers });
    console.log('✅ Sector eliminado correctamente');

    console.log('\n🎉 TODAS LAS PRUEBAS CRUD COMPLETADAS EXITOSAMENTE');
    console.log('===================================================');
    console.log('✅ Sectores: CRUD completo funcional');
    console.log('✅ Subsectores: CRUD completo funcional');
    console.log('✅ Indiciados: CRUD completo funcional');
    console.log('✅ Vehículos: CRUD completo funcional');

  } catch (error) {
    console.error('❌ Error en las pruebas CRUD:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }

    // Cleanup en caso de error
    console.log('\n🧹 LIMPIEZA EN CASO DE ERROR');
    try {
      if (createdIndiciadoId) {
        await axios.delete(`${BASE_URL}/indiciados/${createdIndiciadoId}`, { headers }).catch(() => {});
        console.log('🗑️ Indiciado eliminado');
      }
      if (createdVehiculoId) {
        await axios.delete(`${BASE_URL}/vehiculos/${createdVehiculoId}`, { headers }).catch(() => {});
        console.log('🗑️ Vehículo eliminado');
      }
      if (createdSubsectorId) {
        await axios.delete(`${BASE_URL}/subsectores/${createdSubsectorId}`, { headers }).catch(() => {});
        console.log('🗑️ Subsector eliminado');
      }
      if (createdSectorId) {
        await axios.delete(`${BASE_URL}/sectores/${createdSectorId}`, { headers }).catch(() => {});
        console.log('🗑️ Sector eliminado');
      }
    } catch (cleanupError) {
      console.error('Error en limpieza:', cleanupError.message);
    }
  }
}

if (require.main === module) {
  testCRUD().then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error general:', error);
    process.exit(1);
  });
}
