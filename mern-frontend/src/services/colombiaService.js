import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: `${API_URL}/colombia`,
  headers: {
    'Content-Type': 'application/json'
  }
});

const colombiaService = {
  // Obtener todos los departamentos
  getDepartamentos: async () => {
    try {
      const response = await api.get('/departamentos');
      return response.data;
    } catch (error) {
      console.error('Error getting departamentos:', error);
      throw error;
    }
  },

  // Obtener ciudades de un departamento específico
  getCiudadesByDepartamento: async (departamentoId) => {
    try {
      const response = await api.get(`/departamentos/${departamentoId}/ciudades`);
      return response.data;
    } catch (error) {
      console.error('Error getting ciudades:', error);
      throw error;
    }
  },

  // Buscar ciudades por nombre (autocompletado)
  buscarCiudades: async (query) => {
    try {
      const response = await api.get(`/ciudades/buscar?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching ciudades:', error);
      throw error;
    }
  },

  // Validar combinación departamento-ciudad y generar nombre de sector
  validarUbicacion: async (departamentoId, ciudadId) => {
    try {
      const response = await api.post('/validar-ubicacion', {
        departamentoId,
        ciudadId
      });
      return response.data;
    } catch (error) {
      console.error('Error validating ubicacion:', error);
      throw error;
    }
  }
};

export default colombiaService;
