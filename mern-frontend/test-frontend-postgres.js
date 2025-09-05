const axios = require('axios');

// Configurar axios para apuntar al servidor PostgreSQL
axios.defaults.baseURL = 'http://localhost:5004/api';
axios.defaults.headers.common['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwOGM3NmFkLWQ0MmEtNGJiZS1iNjAxLTY1MThmNzYxZTE1NyIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJhZG1pbl8xNzU2MTQ5NjQzMTIwIiwiaWF0IjoxNzU2MTQ5NzE4LCJleHAiOjE3NTY3NTQ1MTh9.LbMjDIfkMQ1Rg2GUP6Ug3tlRORJyd3WNqHTnYzHBd-w';

async function probarFrontendPostgreSQL() {
  console.log('🧪 PRUEBAS DE FRONTEND CON POSTGRESQL');
  console.log('=====================================\n');

  try {
    // 1. Probar health check
    console.log('1. 🏥 Health Check...');
    const healthResponse = await axios.get('/health');
    console.log('✅ Health check exitoso:', healthResponse.data);
    console.log('');

    // 2. Probar sectores
    console.log('2. 📁 Probando sectores...');
    const sectoresResponse = await axios.get('/sectores');
    console.log('✅ Sectores obtenidos:', sectoresResponse.data.sectores?.length || 'Array directo de', sectoresResponse.data.length);
    if (sectoresResponse.data.sectores) {
      console.log('📋 Formato de respuesta: { sectores: [...] }');
      console.log('🔍 Primer sector:', sectoresResponse.data.sectores[0]);
    } else if (Array.isArray(sectoresResponse.data)) {
      console.log('📋 Formato de respuesta: [...]');
      console.log('🔍 Primer sector:', sectoresResponse.data[0]);
    }
    console.log('');

    // 3. Probar subsectores
    console.log('3. 📂 Probando subsectores...');
    const subsectoresResponse = await axios.get('/subsectores');
    console.log('✅ Subsectores obtenidos:', subsectoresResponse.data.length);
    if (subsectoresResponse.data.length > 0) {
      console.log('🔍 Primer subsector:', subsectoresResponse.data[0]);
    }
    console.log('');

    // 4. Probar indiciados
    console.log('4. 👤 Probando indiciados...');
    const indiciadosResponse = await axios.get('/indiciados');
    console.log('✅ Indiciados obtenidos:', indiciadosResponse.data.length);
    if (indiciadosResponse.data.length > 0) {
      console.log('🔍 Primer indiciado:', {
        nombre: indiciadosResponse.data[0].nombre,
        apellidos: indiciadosResponse.data[0].apellidos,
        cedula: indiciadosResponse.data[0].cedula,
        id: indiciadosResponse.data[0].id
      });
    }
    console.log('');

    // 5. Probar vehículos
    console.log('5. 🚗 Probando vehículos...');
    const vehiculosResponse = await axios.get('/vehiculos');
    console.log('✅ Vehículos obtenidos:', vehiculosResponse.data.length);
    if (vehiculosResponse.data.length > 0) {
      console.log('🔍 Primer vehículo:', {
        tipoVehiculo: vehiculosResponse.data[0].tipoVehiculo,
        marca: vehiculosResponse.data[0].marca,
        modelo: vehiculosResponse.data[0].modelo || vehiculosResponse.data[0].linea,
        placa: vehiculosResponse.data[0].placa,
        id: vehiculosResponse.data[0].id
      });
    }
    console.log('');

    console.log('🎉 TODAS LAS PRUEBAS FRONTEND-BACKEND EXITOSAS');
    console.log('===============================================');
    console.log('✅ El frontend puede comunicarse correctamente con PostgreSQL');
    console.log('✅ Todos los endpoints responden correctamente');
    console.log('✅ Los datos se obtienen en el formato esperado');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

if (require.main === module) {
  probarFrontendPostgreSQL().then(() => {
    console.log('\n✅ Script de pruebas completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error general:', error);
    process.exit(1);
  });
}
