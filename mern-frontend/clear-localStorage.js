#!/usr/bin/env node

console.log('🧹 SCRIPT PARA LIMPIAR LOCALSTORAGE');
console.log('===================================\n');

console.log('Para limpiar el localStorage y usar el nuevo token:');
console.log('');
console.log('1. Abrir DevTools en el navegador (F12)');
console.log('2. Ir a la pestaña "Console"');
console.log('3. Ejecutar el siguiente comando:\n');

console.log('localStorage.removeItem("access_token");');
console.log('window.location.reload();\n');

console.log('ALTERNATIVA - Ejecutar todo de una vez:');
console.log('localStorage.clear(); window.location.reload();\n');

console.log('🔄 El frontend detectará que no hay token y usará el token de desarrollo actualizado.');
console.log('✅ Después de esto, debería poder crear sectores sin problemas.\n');

console.log('🎯 NUEVO TOKEN VÁLIDO (ya configurado en AuthContext):');
console.log('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwOGM3NmFkLWQ0MmEtNGJiZS1iNjAxLTY1MThmNzYxZTE1NyIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJhZG1pbl8xNzU2MTQ5NjQzMTIwIiwiaWF0IjoxNzU2MTU1MjYyLCJleHAiOjE3NTY3NjAwNjJ9.d20Ii8-LnYfgmqm7r-Sd78t_XKH8vUqQVY5HhsrKaIM\n');

console.log('📅 Token válido hasta:', new Date(1756760062000).toLocaleString('es-ES'));
