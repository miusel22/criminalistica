// Script para debugging del manejo de errores de sectores
// Ejecutar en la consola del navegador para probar

window.debugSectorError = async function() {
  console.log('🧪 Iniciando prueba de error de sector duplicado...');
  
  try {
    // Simular llamada al backend que devuelve un 409
    const mockError = {
      response: {
        status: 409,
        data: {
          msg: 'Ya existe un sector con el nombre \'Test Sector\''
        }
      },
      message: 'Request failed with status code 409'
    };
    
    console.log('🔥 Simulando error 409:', mockError);
    
    // Simular el manejo de error que está en EnhancedSectoresManager
    let errorMessage = 'Error desconocido al guardar el elemento';
    
    if (mockError.response) {
      const { status, data } = mockError.response;
      console.log('📄 Procesando respuesta de error:', { status, data });
      
      switch (status) {
        case 409:
          errorMessage = data.msg || data.message || 'Ya existe un elemento con ese nombre';
          console.log('⚠️ Error 409 detectado, mensaje:', errorMessage);
          break;
        case 400:
          errorMessage = data.msg || data.message || 'Datos inválidos';
          break;
        case 404:
          errorMessage = 'Elemento no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = data.msg || data.message || `Error ${status}: ${data.error || 'Error desconocido'}`;
      }
    } else if (mockError.message) {
      errorMessage = mockError.message;
    }
    
    console.log('🎆 Mostrando toast con mensaje:', errorMessage);
    
    // Verificar si toast está disponible
    if (typeof window.toast !== 'undefined' && window.toast.error) {
      console.log('✅ Toast encontrado, mostrando mensaje...');
      window.toast.error(errorMessage);
    } else {
      console.log('❌ Toast no encontrado, buscando alternativas...');
      
      // Buscar en el contexto de React
      if (typeof window.reactHotToast !== 'undefined') {
        console.log('✅ React Hot Toast encontrado');
        window.reactHotToast.error(errorMessage);
      } else {
        console.log('⚠️ No se pudo encontrar toast, usando alert como fallback');
        alert('ERROR: ' + errorMessage);
      }
    }
    
    return {
      success: true,
      errorMessage,
      mockError
    };
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// También exponer toast para testing si no está disponible
if (typeof window.toast === 'undefined') {
  // Intentar obtener toast de react-hot-toast
  try {
    const toastModule = require('react-hot-toast');
    window.toast = toastModule.default || toastModule;
    console.log('✅ Toast importado y expuesto globalmente');
  } catch (e) {
    console.log('⚠️ No se pudo importar toast:', e.message);
  }
}

console.log('🛠️ Debug tools loaded. Run debugSectorError() in the console to test error handling.');

export default window.debugSectorError;
