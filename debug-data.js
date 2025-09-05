const axios = require('axios');

const BASE_URL = 'http://localhost:5004/api';

// Token de desarrollo válido (del frontend)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwOGM3NmFkLWQ0MmEtNGJiZS1iNjAxLTY1MThmNzYxZTE1NyIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJhZG1pbl8xNzU2MTQ5NjQzMTIwIiwiaWF0IjoxNzU2MTU1MjYyLCJleHAiOjE3NTY3NjAwNjJ9.d20Ii8-LnYfgmqm7r-Sd78t_XKH8vUqQVY5HhsrKaIM';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testEndpoints() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');

    // Test sectores
    console.log('📁 SECTORES:');
    try {
      const sectoresResponse = await axios.get(`${BASE_URL}/sectores`, { headers });
      console.log(`   - Encontrados: ${sectoresResponse.data.length} sectores`);
      sectoresResponse.data.forEach((sector, index) => {
        console.log(`   ${index + 1}. ${sector.nombre || sector.title || 'Sin nombre'} (ID: ${sector.id})`);
      });
    } catch (error) {
      console.log(`   - Error: ${error.response?.data?.msg || error.message}`);
    }

    console.log('\n📂 SUBSECTORES:');
    try {
      const subsectoresResponse = await axios.get(`${BASE_URL}/subsectores`, { headers });
      console.log(`   - Encontrados: ${subsectoresResponse.data.length} subsectores`);
      subsectoresResponse.data.forEach((subsector, index) => {
        console.log(`   ${index + 1}. ${subsector.nombre || subsector.title || 'Sin nombre'} (ID: ${subsector.id}, Sector: ${subsector.parentId || subsector.sectorId || 'N/A'})`);
      });
    } catch (error) {
      console.log(`   - Error: ${error.response?.data?.msg || error.message}`);
    }

    console.log('\n👤 INDICIADOS:');
    try {
      const indiciadosResponse = await axios.get(`${BASE_URL}/indiciados`, { headers });
      console.log(`   - Encontrados: ${indiciadosResponse.data.length} indiciados`);
      if (indiciadosResponse.data.length > 0) {
        indiciadosResponse.data.slice(0, 5).forEach((indiciado, index) => {
          console.log(`   ${index + 1}. ${indiciado.nombre || 'Sin nombre'} ${indiciado.apellidos || ''} (ID: ${indiciado.id})`);
        });
        if (indiciadosResponse.data.length > 5) {
          console.log(`   ... y ${indiciadosResponse.data.length - 5} más`);
        }
      }
    } catch (error) {
      console.log(`   - Error: ${error.response?.data?.msg || error.message}`);
    }

    console.log('\n🚗 VEHÍCULOS:');
    try {
      const vehiculosResponse = await axios.get(`${BASE_URL}/vehiculos`, { headers });
      console.log(`   - Encontrados: ${vehiculosResponse.data.length} vehículos`);
      if (vehiculosResponse.data.length > 0) {
        vehiculosResponse.data.slice(0, 5).forEach((vehiculo, index) => {
          console.log(`   ${index + 1}. ${vehiculo.marca || 'Sin marca'} ${vehiculo.modelo || ''} - ${vehiculo.placa || 'Sin placa'} (ID: ${vehiculo.id})`);
        });
        if (vehiculosResponse.data.length > 5) {
          console.log(`   ... y ${vehiculosResponse.data.length - 5} más`);
        }
      }
    } catch (error) {
      console.log(`   - Error: ${error.response?.data?.msg || error.message}`);
    }

    console.log('\n📊 RESUMEN:');
    try {
      const [sectores, subsectores, indiciados, vehiculos] = await Promise.all([
        axios.get(`${BASE_URL}/sectores`, { headers }),
        axios.get(`${BASE_URL}/subsectores`, { headers }),
        axios.get(`${BASE_URL}/indiciados`, { headers }),
        axios.get(`${BASE_URL}/vehiculos`, { headers })
      ]);

      const stats = {
        sectores: sectores.data.length,
        subsectores: subsectores.data.length,
        indiciados: indiciados.data.length,
        vehiculos: vehiculos.data.length
      };

      console.log(`   - Sectores: ${stats.sectores}`);
      console.log(`   - Subsectores: ${stats.subsectores}`);
      console.log(`   - Indiciados: ${stats.indiciados}`);
      console.log(`   - Vehículos: ${stats.vehiculos}`);
      console.log(`   - Total: ${stats.sectores + stats.subsectores + stats.indiciados + stats.vehiculos}`);

    } catch (error) {
      console.log(`   - Error obteniendo resumen: ${error.message}`);
    }

  } catch (error) {
    console.error('Error general:', error.message);
  }
}

testEndpoints();
