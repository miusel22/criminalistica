// Script para verificar el estado de autenticación
console.log('🔍 Verificando estado de autenticación...');

// Verificar si hay token en localStorage
const token = localStorage.getItem('authToken');
console.log('📝 Token en localStorage:', token ? `${token.substring(0, 20)}...` : 'No existe');

// Verificar si el token es válido probando una petición al backend
if (token) {
  fetch('http://localhost:5001/api/sectores', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('📡 Status de respuesta:', response.status);
    if (response.status === 401) {
      console.log('❌ Token inválido o expirado');
      console.log('🔄 Necesitas volver a hacer login');
    } else if (response.ok) {
      console.log('✅ Token válido, autenticación OK');
    } else {
      console.log('⚠️  Otro error:', response.statusText);
    }
    return response.text();
  })
  .then(data => {
    console.log('📦 Respuesta del servidor:', data.substring(0, 200) + '...');
  })
  .catch(error => {
    console.error('🚨 Error de conexión:', error);
  });
} else {
  console.log('❌ No hay token de autenticación');
  console.log('🔑 Necesitas hacer login primero');
}
