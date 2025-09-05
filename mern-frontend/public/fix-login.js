// Script para iniciar sesión directamente desde el navegador
// Copia y pega todo este código en la consola del navegador

async function fixLogin() {
  console.log('🔐 Iniciando sesión automática...');
  
  try {
    // Realizar solicitud de login directamente
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Login exitoso!', data);
    
    // Guardar el token en localStorage
    localStorage.setItem('access_token', data.access_token);
    
    // Guardar datos del usuario
    localStorage.setItem('user', JSON.stringify(data.user));
    
    console.log('✅ Token guardado en localStorage');
    console.log('✅ Usuario guardado en localStorage');
    
    // Verificar que el token se guardó correctamente
    const savedToken = localStorage.getItem('access_token');
    console.log('✅ Token guardado:', savedToken ? 'SÍ' : 'NO');
    
    // Solicitar que refresque la página
    console.log('\n🔄 Por favor, REFRESCA LA PÁGINA para aplicar los cambios');
    
    return true;
  } catch (error) {
    console.error('❌ Error iniciando sesión:', error);
    return false;
  }
}

// Ejecutar login automático
fixLogin().then(success => {
  if (success) {
    alert('✅ Sesión iniciada correctamente! Refresca la página para continuar.');
  } else {
    alert('❌ Error iniciando sesión. Revisa la consola para más detalles.');
  }
});
