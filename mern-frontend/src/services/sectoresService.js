import axios from 'axios';

const SECTORES_API = '/sectores';
const SUBSECTORES_API = '/subsectores';
const INDICIADOS_API = '/indiciados';
const VEHICULOS_API = '/vehiculos';

// Asegurar que tenemos la baseURL correcta
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
}

// Asegurar interceptor de autenticación
if (!axios.defaults.headers.common['Authorization']) {
  // Agregar interceptor si no existe
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

console.log('🔍 SectoresService - APIs configuradas');
console.log('🔍 SectoresService - axios.defaults.baseURL:', axios.defaults.baseURL);

class SectoresService {
  // ============================================================================
  // SECTORES
  // ============================================================================

  // Crear sector
  async createSector(data) {
    try {
      console.log('🆕 Creando sector:', data);
      const response = await axios.post(SECTORES_API, data);
      console.log('✅ Sector creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando sector:', error);
      // Re-lanzar el error para manejo en el componente
      throw error;
    }
  }

  // Obtener todos los sectores
  async getSectores(includeHierarchy = false) {
    if (!includeHierarchy) {
      const response = await axios.get(SECTORES_API);
      return response.data;
    }
    
    // Construir jerarquía completa
    return this.buildFullHierarchy();
  }

  // Obtener sector específico
  async getSector(id) {
    const response = await axios.get(`${SECTORES_API}/${id}`);
    return response.data;
  }

  // Actualizar sector
  async updateSector(id, data) {
    console.log('🔄 Actualizando sector:', id, data);
    const response = await axios.put(`${SECTORES_API}/${id}`, data);
    console.log('✅ Sector actualizado:', response.data);
    return response.data;
  }

  // Eliminar sector
  async deleteSector(id) {
    console.log('🗑️ Eliminando sector:', id);
    const response = await axios.delete(`${SECTORES_API}/${id}`);
    console.log('✅ Sector eliminado:', response.data);
    return response.data;
  }

  // ============================================================================
  // SUBSECTORES
  // ============================================================================

  // Crear subsector
  async createSubsector(data) {
    try {
      console.log('🆕 Creando subsector:', data);
      const response = await axios.post(SUBSECTORES_API, data);
      console.log('✅ Subsector creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando subsector:', error);
      // Re-lanzar el error para manejo en el componente
      throw error;
    }
  }

  // Obtener todos los subsectores
  async getSubsectores(sectorId = null) {
    if (sectorId) {
      const response = await axios.get(`${SUBSECTORES_API}/sector/${sectorId}`);
      return response.data;
    }
    const response = await axios.get(SUBSECTORES_API);
    return response.data;
  }

  // Obtener subsector específico
  async getSubsector(id) {
    const response = await axios.get(`${SUBSECTORES_API}/${id}`);
    return response.data;
  }

  // Actualizar subsector
  async updateSubsector(id, data) {
    const response = await axios.put(`${SUBSECTORES_API}/${id}`, data);
    return response.data;
  }

  // Eliminar subsector
  async deleteSubsector(id) {
    const response = await axios.delete(`${SUBSECTORES_API}/${id}`);
    return response.data;
  }

  // ============================================================================
  // INDICIADOS
  // ============================================================================

  // Crear indiciado
  async createIndiciado(data) {
    const response = await axios.post(INDICIADOS_API, data);
    return response.data;
  }

  // Obtener todos los indiciados
  async getIndiciados(sector = null) {
    if (sector) {
      const response = await axios.get(`${INDICIADOS_API}/sector/${sector}`);
      return response.data;
    }
    const response = await axios.get(INDICIADOS_API);
    return response.data;
  }

  // Obtener indiciado específico
  async getIndiciado(id) {
    const response = await axios.get(`${INDICIADOS_API}/${id}`);
    return response.data;
  }

  // Actualizar indiciado
  async updateIndiciado(id, data) {
    const response = await axios.put(`${INDICIADOS_API}/${id}`, data);
    return response.data;
  }

  // Eliminar indiciado
  async deleteIndiciado(id) {
    const response = await axios.delete(`${INDICIADOS_API}/${id}`);
    return response.data;
  }

  // ============================================================================
  // VEHÍCULOS
  // ============================================================================

  // Crear vehículo
  async createVehiculo(data) {
    const response = await axios.post(VEHICULOS_API, data);
    return response.data;
  }

  // Obtener todos los vehículos
  async getVehiculos(sector = null) {
    if (sector) {
      const response = await axios.get(`${VEHICULOS_API}/sector/${sector}`);
      return response.data;
    }
    const response = await axios.get(VEHICULOS_API);
    return response.data;
  }

  // Obtener vehículo específico
  async getVehiculo(id) {
    const response = await axios.get(`${VEHICULOS_API}/${id}`);
    return response.data;
  }

  // Buscar vehículo por placa
  async getVehiculoByPlaca(placa) {
    const response = await axios.get(`${VEHICULOS_API}/placa/${placa}`);
    return response.data;
  }

  // Actualizar vehículo
  async updateVehiculo(id, data) {
    const response = await axios.put(`${VEHICULOS_API}/${id}`, data);
    return response.data;
  }

  // Eliminar vehículo
  async deleteVehiculo(id) {
    const response = await axios.delete(`${VEHICULOS_API}/${id}`);
    return response.data;
  }

  // ============================================================================
  // JERARQUÍA COMPLETA
  // ============================================================================

  // Construir jerarquía completa con todos los elementos anidados
  async buildFullHierarchy() {
    try {
      // Obtener todos los datos en paralelo
      const [sectores, subsectores, indiciados, vehiculos] = await Promise.all([
        this.getSectores(false),
        this.getSubsectores(),
        this.getIndiciados(),
        this.getVehiculos()
      ]);

      // Crear mapa de relaciones
      const sectoresMap = new Map();
      const subsectoresMap = new Map();
      
      // Inicializar sectores con arrays vacíos
      sectores.forEach(sector => {
        sectoresMap.set(sector.id, {
          ...sector,
          type: 'sector',
          subsectores: [],
          indiciados: [],
          vehiculos: []
        });
      });

      // Agregar subsectores a sus sectores correspondientes y crear mapa de subsectores
      subsectores.forEach(subsector => {
        // Los subsectores usan parentId para referenciar al sector padre
        const sectorParent = sectoresMap.get(subsector.parentId || subsector.sectorId);
        if (sectorParent) {
          const subsectorWithType = {
            ...subsector,
            type: 'subsector',
            indiciados: [],
            vehiculos: []
          };
          sectorParent.subsectores.push(subsectorWithType);
          subsectoresMap.set(subsector.id, subsectorWithType);
        }
      });

      // Agregar indiciados a sus subsectores correspondientes
      indiciados.forEach(indiciado => {
        const indiciadoWithType = {
          ...indiciado,
          type: 'indiciado'
        };
        
        // Si tiene subsectorId, intentar agregarlo al subsector
        if (indiciado.subsectorId) {
          const subsector = subsectoresMap.get(indiciado.subsectorId);
          if (subsector) {
            subsector.indiciados.push(indiciadoWithType);
          } else {
            // Si no encuentra el subsector, agregarlo a la lista general
            console.warn('Subsector no encontrado para indiciado:', indiciado.id, indiciado.subsectorId);
          }
        } else {
          // Si no tiene subsectorId, intentar encontrar subsector por sectorQueOpera
          // o agregarlo como elemento independiente
          let agregado = false;
          
          if (indiciado.sectorQueOpera) {
            // Buscar un subsector que coincida por nombre o similar
            for (const [subsectorId, subsector] of subsectoresMap) {
              if (subsector.nombre?.toLowerCase().includes(indiciado.sectorQueOpera.toLowerCase()) ||
                  indiciado.sectorQueOpera.toLowerCase().includes(subsector.nombre?.toLowerCase())) {
                subsector.indiciados.push(indiciadoWithType);
                agregado = true;
                break;
              }
            }
          }
          
          // Si no se pudo relacionar con ningún subsector, agregarlo como independiente
          if (!agregado) {
            console.log('Indiciado sin relación encontrada, agregando como independiente:', indiciado.nombre);
          }
        }
      });

      // Agregar vehículos a sus subsectores correspondientes
      vehiculos.forEach(vehiculo => {
        const vehiculoWithType = {
          ...vehiculo,
          type: 'vehiculo'
        };
        
        // Si tiene subsectorId, intentar agregarlo al subsector
        if (vehiculo.subsectorId) {
          const subsector = subsectoresMap.get(vehiculo.subsectorId);
          if (subsector) {
            subsector.vehiculos.push(vehiculoWithType);
          } else {
            console.warn('Subsector no encontrado para vehículo:', vehiculo.id, vehiculo.subsectorId);
          }
        } else {
          // Si no tiene subsectorId, intentar encontrar subsector por sectorQueOpera
          let agregado = false;
          
          if (vehiculo.sectorQueOpera) {
            // Buscar un subsector que coincida por nombre o similar
            for (const [subsectorId, subsector] of subsectoresMap) {
              if (subsector.nombre?.toLowerCase().includes(vehiculo.sectorQueOpera.toLowerCase()) ||
                  vehiculo.sectorQueOpera.toLowerCase().includes(subsector.nombre?.toLowerCase())) {
                subsector.vehiculos.push(vehiculoWithType);
                agregado = true;
                break;
              }
            }
          }
          
          // Si no se pudo relacionar con ningún subsector, agregarlo como independiente
          if (!agregado) {
            console.log('Vehículo sin relación encontrada, agregando como independiente:', vehiculo.placa);
          }
        }
      });

      return Array.from(sectoresMap.values());
    } catch (error) {
      console.error('Error building hierarchy:', error);
      return [];
    }
  }

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  // Obtener estadísticas generales
  async getStats() {
    try {
      const [sectoresResponse, subsectoresResponse, indiciadosResponse, vehiculosResponse] = await Promise.all([
        axios.get(SECTORES_API),
        axios.get(SUBSECTORES_API),
        axios.get(INDICIADOS_API),
        axios.get(VEHICULOS_API)
      ]);

      return {
        sectores: sectoresResponse.data.length || 0,
        subsectores: subsectoresResponse.data.length || 0,
        indiciados: indiciadosResponse.data.length || 0,
        vehiculos: vehiculosResponse.data.length || 0,
        total: (sectoresResponse.data.length || 0) + 
               (subsectoresResponse.data.length || 0) + 
               (indiciadosResponse.data.length || 0) + 
               (vehiculosResponse.data.length || 0)
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        sectores: 0,
        subsectores: 0,
        indiciados: 0,
        vehiculos: 0,
        total: 0
      };
    }
  }

  // ============================================================================
  // BÚSQUEDA GENERAL
  // ============================================================================

  // Buscar en todos los elementos
  async search(query) {
    try {
      const [sectoresResponse, subsectoresResponse, indiciadosResponse, vehiculosResponse] = await Promise.all([
        axios.get(SECTORES_API),
        axios.get(SUBSECTORES_API),
        axios.get(INDICIADOS_API),
        axios.get(VEHICULOS_API)
      ]);

      const lowerQuery = query.toLowerCase();
      const results = [];

      // Buscar en sectores
      sectoresResponse.data.forEach(item => {
        if (item.nombre?.toLowerCase().includes(lowerQuery) || 
            item.descripcion?.toLowerCase().includes(lowerQuery)) {
          results.push({ ...item, type: 'sector' });
        }
      });

      // Buscar en subsectores
      subsectoresResponse.data.forEach(item => {
        if (item.nombre?.toLowerCase().includes(lowerQuery) || 
            item.descripcion?.toLowerCase().includes(lowerQuery)) {
          results.push({ ...item, type: 'subsector' });
        }
      });

      // Buscar en indiciados
      indiciadosResponse.data.forEach(item => {
        if (item.nombre?.toLowerCase().includes(lowerQuery) || 
            item.apellidos?.toLowerCase().includes(lowerQuery) ||
            item.cedula?.toLowerCase().includes(lowerQuery)) {
          results.push({ ...item, type: 'indiciado' });
        }
      });

      // Buscar en vehículos
      vehiculosResponse.data.forEach(item => {
        if (item.marca?.toLowerCase().includes(lowerQuery) || 
            item.modelo?.toLowerCase().includes(lowerQuery) ||
            item.placa?.toLowerCase().includes(lowerQuery)) {
          results.push({ ...item, type: 'vehiculo' });
        }
      });

      return {
        msg: `Encontrados ${results.length} resultados`,
        resultados: results
      };
    } catch (error) {
      console.error('Error searching:', error);
      return {
        msg: 'Error en la búsqueda',
        resultados: []
      };
    }
  }
}

export default new SectoresService();
