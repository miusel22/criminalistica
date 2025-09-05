const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Primero verificar si el servidor está corriendo
    console.log('🔍 Verificando si el servidor está activo...');
    
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    // Probar login con admin
    console.log(`\n👤 Probando login como ADMIN en ${serverUrl}/api/auth/login`);
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
    try {
      const adminResponse = await axios.post(`${serverUrl}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Login exitoso como ADMIN!');
      console.log('   Token generado:', adminResponse.data.access_token.substring(0, 50) + '...');
      console.log('   Usuario:', adminResponse.data.user.fullName);
      console.log('   Rol:', adminResponse.data.user.role);
      
    } catch (loginError) {
      if (loginError.response) {
        console.log('❌ Error en login:', loginError.response.status, loginError.response.data);
      } else if (loginError.code === 'ECONNREFUSED') {
        console.log('❌ No se puede conectar al servidor');
        console.log('💡 Sugerencia: Asegúrate de que el servidor esté ejecutándose con:');
        console.log('   npm run dev  o  node server.js');
      } else {
        console.log('❌ Error de conexión:', loginError.message);
      }
    }

    // Probar login con editor
    console.log(`\n✏️  Probando login como EDITOR`);
    console.log('   Username: editor');
    console.log('   Password: editor123');
    
    try {
      const editorResponse = await axios.post(`${serverUrl}/api/auth/login`, {
        username: 'editor',
        password: 'editor123'
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Login exitoso como EDITOR!');
      console.log('   Token generado:', editorResponse.data.access_token.substring(0, 50) + '...');
      console.log('   Usuario:', editorResponse.data.user.fullName);
      console.log('   Rol:', editorResponse.data.user.role);
      
    } catch (loginError) {
      if (loginError.response) {
        console.log('❌ Error en login del editor:', loginError.response.status, loginError.response.data);
      } else {
        console.log('❌ Error de conexión para editor:', loginError.message);
      }
    }

    // Probar login con credenciales incorrectas
    console.log(`\n🚫 Probando con credenciales incorrectas`);
    try {
      await axios.post(`${serverUrl}/api/auth/login`, {
        username: 'admin',
        password: 'wrongpassword'
      });
    } catch (loginError) {
      if (loginError.response && loginError.response.status === 401) {
        console.log('✅ Validación correcta: credenciales incorrectas rechazadas');
      } else {
        console.log('❌ Comportamiento inesperado con credenciales incorrectas');
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
};

// Si axios no está disponible, ofrecer alternativa con curl
const testWithCurl = () => {
  console.log('\n📝 Como alternativa, puedes probar el login con curl:');
  console.log('\nPara ADMIN:');
  console.log(`curl -X POST http://localhost:5000/api/auth/login \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"username": "admin", "password": "admin123"}'`);
  
  console.log('\nPara EDITOR:');
  console.log(`curl -X POST http://localhost:5000/api/auth/login \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"username": "editor", "password": "editor123"}'`);
};

// Verificar si axios está disponible
try {
  require('axios');
  testLogin();
} catch (err) {
  console.log('⚠️  axios no está instalado, usando curl como alternativa...');
  testWithCurl();
}
