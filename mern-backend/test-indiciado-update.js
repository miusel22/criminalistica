#!/usr/bin/env node

const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5004/api';
const INDICIADO_ID = '7ad4af04-b362-430b-8e23-0e2c5bf967f5'; // Cambia por el ID que estás editando

// Credenciales de admin
const LOGIN_CREDENTIALS = {
  email: 'admin@criminalistica.com',
  password: 'admin123456'
};

let authToken = null;

// Función para hacer login
async function login() {
  try {
    console.log('🔑 Realizando login...');
    const response = await axios.post(`${API_URL}/auth/login`, LOGIN_CREDENTIALS);
    
    if (response.data && response.data.access_token) {
      authToken = response.data.access_token;
      console.log('✅ Login exitoso');
      
      // Configurar token para todas las peticiones siguientes
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      return true;
    } else {
      console.error('❌ Login fallido - no se obtuvo token');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

// Función para obtener indiciado por ID
async function getIndiciado(id) {
  try {
    console.log(`🔍 Obteniendo indiciado ${id}...`);
    const response = await axios.get(`${API_URL}/indiciados/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo indiciado:', error.response?.data || error.message);
    return null;
  }
}

// Función para actualizar indiciado
async function updateIndiciado(id, data) {
  try {
    console.log(`🔄 Actualizando indiciado ${id}...`);
    console.log('📦 Datos a enviar:', data);
    
    const response = await axios.put(`${API_URL}/indiciados/${id}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Respuesta de actualización:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando indiciado:', error.response?.data || error.message);
    return null;
  }
}

// Script principal
async function main() {
  console.log('🚀 Iniciando script de prueba de actualización de indiciado\n');
  
  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ No se pudo hacer login. Saliendo...');
    process.exit(1);
  }
  
  // 2. Obtener datos actuales del indiciado
  console.log('\n📋 PASO 1: Obtener datos actuales');
  const indiciadoActual = await getIndiciado(INDICIADO_ID);
  if (!indiciadoActual) {
    console.error('❌ No se pudo obtener el indiciado. Saliendo...');
    process.exit(1);
  }
  
  console.log('📄 Datos actuales del indiciado:');
  console.log(`  - ID: ${indiciadoActual.id}`);
  console.log(`  - Nombre: ${indiciadoActual.nombre}`);
  console.log(`  - Apellidos: ${indiciadoActual.apellidos}`);
  console.log(`  - Alias actual: "${indiciadoActual.alias || 'Sin alias'}"`);
  console.log(`  - UpdatedAt: ${indiciadoActual.updatedAt}`);
  
  // 3. Preparar datos para actualización
  const timestamp = new Date().toISOString().substr(-8, 5); // Últimos 5 chars para hacer único
  const nuevoAlias = `TestAlias_${timestamp}`;
  
  const datosActualizacion = {
    nombre: indiciadoActual.nombre,
    apellidos: indiciadoActual.apellidos,
    alias: nuevoAlias,
    // Mantener otros campos importantes
    sectorQueOpera: indiciadoActual.sectorQueOpera || '',
    genero: indiciadoActual.genero || '',
    telefono: indiciadoActual.telefono || '',
    email: indiciadoActual.email || '',
    direccion: indiciadoActual.direccion || '',
    observaciones: indiciadoActual.observaciones || ''
  };
  
  // 4. Actualizar indiciado
  console.log('\n🔄 PASO 2: Actualizar indiciado');
  console.log(`  - Nuevo alias: "${nuevoAlias}"`);
  
  const resultadoActualizacion = await updateIndiciado(INDICIADO_ID, datosActualizacion);
  if (!resultadoActualizacion) {
    console.error('❌ No se pudo actualizar el indiciado. Saliendo...');
    process.exit(1);
  }
  
  // 5. Esperar un momento y verificar cambios
  console.log('\n⏱️  PASO 3: Esperar 2 segundos y verificar cambios...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const indiciadoActualizado = await getIndiciado(INDICIADO_ID);
  if (!indiciadoActualizado) {
    console.error('❌ No se pudo obtener el indiciado actualizado');
    process.exit(1);
  }
  
  // 6. Comparar resultados
  console.log('\n📊 PASO 4: Comparación de resultados');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│                    COMPARACIÓN                          │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log(`│ Campo           │ Antes      │ Después      │ Cambió   │`);
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log(`│ Alias           │ ${(indiciadoActual.alias || 'Sin alias').padEnd(10)} │ ${(indiciadoActualizado.alias || 'Sin alias').padEnd(12)} │ ${indiciadoActual.alias !== indiciadoActualizado.alias ? '✅ SÍ' : '❌ NO'}    │`);
  console.log(`│ UpdatedAt       │ ${indiciadoActual.updatedAt.substr(11, 8)} │ ${indiciadoActualizado.updatedAt.substr(11, 8)}   │ ${indiciadoActual.updatedAt !== indiciadoActualizado.updatedAt ? '✅ SÍ' : '❌ NO'}    │`);
  console.log('└─────────────────────────────────────────────────────────┘');
  
  // 7. Resultado final
  if (indiciadoActualizado.alias === nuevoAlias) {
    console.log('\n✅ ¡ÉXITO! El indiciado se actualizó correctamente');
    console.log(`   - El alias cambió correctamente a: "${indiciadoActualizado.alias}"`);
    console.log(`   - La fecha de actualización cambió: ${indiciadoActualizado.updatedAt}`);
  } else {
    console.log('\n❌ PROBLEMA: El indiciado NO se actualizó correctamente');
    console.log(`   - Alias esperado: "${nuevoAlias}"`);
    console.log(`   - Alias actual: "${indiciadoActualizado.alias}"`);
  }
  
  console.log('\n🏁 Script completado');
}

// Ejecutar script
main().catch(console.error);
