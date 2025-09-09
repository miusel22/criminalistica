// Script de depuración para eliminar sector
// Usar en la consola del navegador

window.debugDeleteSector = async function(sectorId) {
    console.log('🔍 DEBUG: Intentando eliminar sector con ID:', sectorId);
    
    try {
        // Verificar token
        const token = localStorage.getItem('access_token');
        console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
        
        // Verificar endpoint
        const baseURL = 'http://localhost:5004/api'; // Ajustar si es diferente
        const url = `${baseURL}/sectores/${sectorId}`;
        console.log('🌐 URL completa:', url);
        
        // Realizar petición
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📄 Response body (raw):', responseText);
        
        try {
            const responseJSON = JSON.parse(responseText);
            console.log('📄 Response body (JSON):', responseJSON);
        } catch (e) {
            console.log('⚠️ Response no es JSON válido');
        }
        
        if (response.ok) {
            console.log('✅ Eliminación exitosa');
            return { success: true, data: responseText };
        } else {
            console.log('❌ Error en eliminación');
            return { success: false, error: responseText, status: response.status };
        }
        
    } catch (error) {
        console.error('💥 Error de red o JavaScript:', error);
        return { success: false, error: error.message };
    }
};

// También función para verificar sectores existentes
window.debugListSectores = async function() {
    console.log('📋 DEBUG: Listando sectores...');
    
    try {
        const token = localStorage.getItem('access_token');
        const baseURL = 'http://localhost:5004/api';
        const url = `${baseURL}/sectores`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('📋 Sectores encontrados:', data);
        
        if (data.sectores) {
            data.sectores.forEach((sector, index) => {
                console.log(`${index + 1}. ${sector.nombre} (ID: ${sector.id || sector._id})`);
            });
        }
        
        return data;
    } catch (error) {
        console.error('💥 Error listando sectores:', error);
    }
};

console.log('🛠️ Funciones de debug cargadas:');
console.log('- window.debugDeleteSector(sectorId)');
console.log('- window.debugListSectores()');
console.log('');
console.log('Ejemplo de uso:');
console.log('1. debugListSectores() // Ver sectores disponibles');
console.log('2. debugDeleteSector("ID_DEL_SECTOR") // Intentar eliminar');
