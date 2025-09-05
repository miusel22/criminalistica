import axios from 'axios';

// Servicio simple para pruebas que usa directamente axios
export const testService = {
  // Test de sectores
  async obtenerSectores() {
    console.log('🧪 testService.obtenerSectores()');
    const response = await axios.get('/sectores');
    console.log('📊 Response:', response.data);
    return response.data.sectores || response.data || [];
  },

  async crearSector(data) {
    console.log('🧪 testService.crearSector()', data);
    const response = await axios.post('/sectores', data);
    console.log('📊 Response:', response.data);
    return response.data;
  },

  // Test de subsectores
  async obtenerSubsectores() {
    console.log('🧪 testService.obtenerSubsectores()');
    const response = await axios.get('/subsectores');
    console.log('📊 Response:', response.data);
    return response.data || [];
  },

  // Test de indiciados
  async obtenerIndiciados() {
    console.log('🧪 testService.obtenerIndiciados()');
    const response = await axios.get('/indiciados');
    console.log('📊 Response:', response.data);
    return response.data || [];
  },

  async crearIndiciado(data) {
    console.log('🧪 testService.crearIndiciado()', data);
    const response = await axios.post('/indiciados', data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('📊 Response:', response.data);
    return response.data;
  },

  // Test de vehículos
  async obtenerVehiculos() {
    console.log('🧪 testService.obtenerVehiculos()');
    const response = await axios.get('/vehiculos');
    console.log('📊 Response:', response.data);
    return response.data || [];
  },

  async crearVehiculo(data) {
    console.log('🧪 testService.crearVehiculo()', data);
    const response = await axios.post('/vehiculos', data, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('📊 Response:', response.data);
    return response.data;
  }
};
