// Script de prueba para verificar el manejo de errores
// Este archivo puede ser usado para verificar que los errores se manejan correctamente

/**
 * Simula diferentes tipos de errores HTTP que pueden ocurrir
 * @param {number} statusCode - Código de estado HTTP a simular
 * @param {string} message - Mensaje de error del backend
 * @returns {Error} Error simulado con estructura similar a axios
 */
export const simulateHttpError = (statusCode, message) => {
  const error = new Error(`HTTP Error ${statusCode}`);
  error.response = {
    status: statusCode,
    data: {
      msg: message,
      message: message
    }
  };
  return error;
};

/**
 * Función que simula el manejo de errores que ocurre en EnhancedSectoresManager
 * @param {Error} error - Error a procesar
 * @returns {string} Mensaje de error procesado
 */
export const processErrorMessage = (error) => {
  console.error('❌ Error al guardar el elemento:', error);
  
  // Extraer mensaje específico del error
  let errorMessage = 'Error desconocido al guardar el elemento';
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 409:
        errorMessage = data.msg || data.message || 'Ya existe un elemento con ese nombre';
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
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  return errorMessage;
};

/**
 * Casos de prueba para verificar el manejo de errores
 */
export const testCases = [
  {
    name: 'Error 409 - Sector duplicado',
    error: simulateHttpError(409, 'El sector con este nombre ya existe en esta ubicación'),
    expectedMessage: 'El sector con este nombre ya existe en esta ubicación'
  },
  {
    name: 'Error 400 - Datos inválidos',
    error: simulateHttpError(400, 'El nombre del sector es requerido'),
    expectedMessage: 'El nombre del sector es requerido'
  },
  {
    name: 'Error 404 - No encontrado',
    error: simulateHttpError(404, 'Sector no encontrado'),
    expectedMessage: 'Elemento no encontrado'
  },
  {
    name: 'Error 500 - Error interno',
    error: simulateHttpError(500, 'Error interno del servidor'),
    expectedMessage: 'Error interno del servidor'
  },
  {
    name: 'Error de red sin response',
    error: new Error('Network Error'),
    expectedMessage: 'Network Error'
  }
];

/**
 * Ejecuta las pruebas de manejo de errores
 */
export const runErrorHandlingTests = () => {
  console.log('🧪 Iniciando pruebas de manejo de errores...\n');
  
  const results = testCases.map(testCase => {
    const result = processErrorMessage(testCase.error);
    const passed = result === testCase.expectedMessage;
    
    console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
    console.log(`   Esperado: "${testCase.expectedMessage}"`);
    console.log(`   Obtenido: "${result}"`);
    console.log('');
    
    return {
      name: testCase.name,
      passed,
      expected: testCase.expectedMessage,
      actual: result
    };
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`🎯 Resultados: ${passedCount}/${totalCount} pruebas pasaron`);
  
  if (passedCount === totalCount) {
    console.log('🎉 ¡Todas las pruebas de manejo de errores pasaron correctamente!');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisar la implementación.');
  }
  
  return results;
};

// Para usar en la consola del navegador:
// import { runErrorHandlingTests } from './utils/testErrorHandling.js';
// runErrorHandlingTests();
