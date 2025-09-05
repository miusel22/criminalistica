const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configure base URL and token
const BASE_URL = 'http://localhost:5000/api';
let TOKEN = ''; // You need to set this with a valid JWT token

// Helper function to make authenticated requests
const apiRequest = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`
  }
});

async function testIndiciadosAPI() {
  try {
    console.log('🧪 Iniciando pruebas de API de Indiciados...\n');

    // Test 1: Get all indiciados
    console.log('📋 Test 1: Obtener todos los indiciados');
    try {
      const response = await apiRequest.get('/indiciados?page=1&limit=5');
      console.log('✅ Respuesta exitosa:', response.status);
      console.log(`📊 Total encontrados: ${response.data.pagination?.total || 0}`);
      console.log('');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.error || error.message);
      console.log('');
    }

    // Test 2: Create a new indiciado
    console.log('➕ Test 2: Crear nuevo indiciado');
    try {
      const indiciadoData = {
        nombre: 'Leonardo',
        apellidos: 'Restrepo Jiménez',
        sectorQueOpera: 'La Unión',
        documentoIdentidad: JSON.stringify({
          numero: '71.278.435',
          expedidoEn: 'Itagüí (Antioquia)'
        }),
        fechaNacimiento: JSON.stringify({
          fecha: '1983-09-13',
          lugar: 'Itagüí (Antioquia)'
        }),
        edad: 38,
        residencia: 'Calle 44 No 56 A-3',
        telefono: '371 68 89',
        senalesFisicas: JSON.stringify({
          estatura: '1,69 m'
        })
      };

      const response = await apiRequest.post('/indiciados', indiciadoData);
      console.log('✅ Indiciado creado exitosamente:', response.status);
      console.log(`📝 ID: ${response.data.indiciado?.id}`);
      console.log(`👤 Nombre: ${response.data.indiciado?.nombreCompleto}`);
      
      // Save ID for other tests
      global.testIndiciadoId = response.data.indiciado.id;
      console.log('');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.msg || error.message);
      console.log('');
    }

    // Test 3: Get indiciado by ID
    if (global.testIndiciadoId) {
      console.log('🔍 Test 3: Obtener indiciado por ID');
      try {
        const response = await apiRequest.get(`/indiciados/${global.testIndiciadoId}`);
        console.log('✅ Indiciado encontrado:', response.status);
        console.log(`👤 Nombre: ${response.data.nombre} ${response.data.apellidos}`);
        console.log(`📄 Documento: ${response.data.documentoIdentidad?.numero}`);
        console.log('');
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.msg || error.message);
        console.log('');
      }
    }

    // Test 4: Update indiciado
    if (global.testIndiciadoId) {
      console.log('✏️  Test 4: Actualizar indiciado');
      try {
        const updateData = {
          alias: 'Leo',
          bandaDelincuencial: 'Los Testigos',
          observaciones: 'Actualizado mediante test automatizado'
        };

        const response = await apiRequest.put(`/indiciados/${global.testIndiciadoId}`, updateData);
        console.log('✅ Indiciado actualizado:', response.status);
        console.log(`📝 Alias: ${response.data.indiciado?.alias}`);
        console.log(`🏷️  Banda: ${response.data.indiciado?.bandaDelincuencial}`);
        console.log('');
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.msg || error.message);
        console.log('');
      }
    }

    // Test 5: Search indiciados
    console.log('🔍 Test 5: Buscar indiciados');
    try {
      const response = await apiRequest.get('/indiciados/search?q=Leonardo');
      console.log('✅ Búsqueda completada:', response.status);
      console.log(`📊 Resultados encontrados: ${response.data.length}`);
      console.log('');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.error || error.message);
      console.log('');
    }

    // Test 6: Get statistics
    console.log('📊 Test 6: Obtener estadísticas');
    try {
      const response = await apiRequest.get('/indiciados/stats');
      console.log('✅ Estadísticas obtenidas:', response.status);
      console.log(`📈 Total indiciados: ${response.data.total}`);
      console.log(`🆕 Recientes: ${response.data.recientes}`);
      console.log('');
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.error || error.message);
      console.log('');
    }

    // Test 7: Soft delete indiciado
    if (global.testIndiciadoId) {
      console.log('🗑️  Test 7: Eliminar indiciado (soft delete)');
      try {
        const response = await apiRequest.delete(`/indiciados/${global.testIndiciadoId}`);
        console.log('✅ Indiciado eliminado (soft):', response.status);
        console.log('💡 El indiciado se marcó como inactivo');
        console.log('');
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data?.msg || error.message);
        console.log('');
      }
    }

    // Test 8: Try to get deleted indiciado (should fail)
    if (global.testIndiciadoId) {
      console.log('❓ Test 8: Intentar obtener indiciado eliminado');
      try {
        const response = await apiRequest.get(`/indiciados/${global.testIndiciadoId}`);
        console.log('⚠️  Inesperado: El indiciado eliminado aún es accesible');
        console.log('');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Correcto: Indiciado no encontrado (eliminado)');
        } else {
          console.log('❌ Error inesperado:', error.response?.status, error.response?.data?.msg || error.message);
        }
        console.log('');
      }
    }

    console.log('🎉 Pruebas completadas!\n');

    // Instructions for manual testing
    console.log('📖 Para pruebas manuales:');
    console.log('1. Asegúrate de tener un token JWT válido');
    console.log('2. Reemplaza TOKEN en este archivo con tu token');
    console.log('3. Ejecuta: node test-indiciados.js');
    console.log('4. Para probar subida de archivos, usa un cliente como Postman o curl');
    console.log('');

  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Example of how to test file upload with form data
async function testFileUpload() {
  console.log('📷 Test adicional: Subida de archivo');
  
  // This is just an example - you need a real image file
  const imagePath = path.join(__dirname, 'test-image.jpg');
  
  if (fs.existsSync(imagePath)) {
    try {
      const formData = new FormData();
      formData.append('nombre', 'Test Usuario');
      formData.append('apellidos', 'Con Foto');
      formData.append('foto', fs.createReadStream(imagePath));
      
      const response = await axios.post(`${BASE_URL}/indiciados`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${TOKEN}`
        }
      });
      
      console.log('✅ Archivo subido exitosamente:', response.status);
      console.log(`📷 Foto URL: ${response.data.indiciado?.fotoUrl}`);
    } catch (error) {
      console.log('❌ Error subiendo archivo:', error.response?.status, error.response?.data?.msg || error.message);
    }
  } else {
    console.log('⚠️  No se encontró archivo de prueba en:', imagePath);
    console.log('💡 Crea un archivo test-image.jpg en el directorio test/ para probar subida de archivos');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  if (!TOKEN) {
    console.log('⚠️  ADVERTENCIA: TOKEN no configurado');
    console.log('📝 Pasos para configurar:');
    console.log('1. Inicia sesión en la API para obtener un token');
    console.log('2. Reemplaza la variable TOKEN en este archivo');
    console.log('3. Ejecuta nuevamente el test');
    console.log('');
    
    // Example of how to get a token (uncomment and modify)
    /*
    console.log('💡 Ejemplo para obtener token:');
    console.log('curl -X POST http://localhost:5000/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email": "your-email@example.com", "password": "your-password"}\'');
    console.log('');
    */
  } else {
    testIndiciadosAPI().then(() => {
      // Uncomment to test file upload
      // testFileUpload();
    });
  }
}

module.exports = {
  testIndiciadosAPI,
  testFileUpload
};
