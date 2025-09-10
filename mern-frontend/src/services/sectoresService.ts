import axios from 'axios';

export interface SectorData {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  ubicacion?: string;
  tipo: 'sector' | 'subsector';
  parentId?: string;
  activo?: boolean;
}

export interface SubsectorData extends SectorData {
  parentId: string;
  tipo: 'subsector';
}

class SectoresService {
  // ==========================================
  // OPERACIONES DE SECTORES
  // ==========================================
  
  static async obtenerSectores(): Promise<SectorData[]> {
    console.log('🐘 Obteniendo sectores de PostgreSQL');
    const response = await axios.get('/sectores');
    const sectores = response.data.sectores || response.data || [];
    console.log('📊 Sectores obtenidos:', sectores.length);
    return sectores;
  }
  
  static async crearSector(data: Partial<SectorData>): Promise<{ message: string; sector: SectorData }> {
    try {
      console.log('🆕 Creando sector:', data);
      const response = await axios.post('/sectores', {
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        codigo: data.codigo || '',
        ubicacion: data.ubicacion || ''
      });
      console.log('✅ Sector creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando sector:', error);
      // Re-lanzar el error para que sea manejado por el componente
      throw error;
    }
  }
  
  static async actualizarSector(id: string, data: Partial<SectorData>): Promise<{ message: string; sector: SectorData }> {
    console.log('🔄 Actualizando sector:', id, data);
    const response = await axios.put(`/sectores/${id}`, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      codigo: data.codigo,
      ubicacion: data.ubicacion
    });
    console.log('✅ Sector actualizado:', response.data);
    return response.data;
  }
  
  static async eliminarSector(id: string): Promise<{ message: string }> {
    console.log('🗑️ Eliminando sector:', id);
    const response = await axios.delete(`/sectores/${id}`);
    console.log('✅ Sector eliminado:', response.data);
    return response.data;
  }

  // ==========================================
  // OPERACIONES DE SUBSECTORES
  // ==========================================
  
  static async obtenerSubsectores(): Promise<SectorData[]> {
    console.log('🐘 Obteniendo subsectores de PostgreSQL');
    const response = await axios.get('/subsectores');
    const subsectores = Array.isArray(response.data) ? response.data : [];
    console.log('📊 Subsectores obtenidos:', subsectores.length);
    return subsectores;
  }
  
  static async obtenerSubsectoresPorSector(sectorId: string): Promise<SectorData[]> {
    console.log('🔍 Obteniendo subsectores por sector:', sectorId);
    const response = await axios.get(`/subsectores/sector/${sectorId}`);
    const subsectores = Array.isArray(response.data) ? response.data : [];
    console.log('📊 Subsectores del sector obtenidos:', subsectores.length);
    return subsectores;
  }
  
  static async crearSubsector(data: Partial<SubsectorData>): Promise<{ message: string; subsector: SectorData }> {
    try {
      console.log('🆕 Creando subsector:', data);
      const response = await axios.post('/subsectores', {
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        codigo: data.codigo || '',
        ubicacion: data.ubicacion || '',
        parentId: data.parentId
      });
      console.log('✅ Subsector creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando subsector:', error);
      // Re-lanzar el error para que sea manejado por el componente
      throw error;
    }
  }
  
  static async actualizarSubsector(id: string, data: Partial<SubsectorData>): Promise<{ message: string; subsector: SectorData }> {
    console.log('🔄 Actualizando subsector:', id, data);
    const response = await axios.put(`/subsectores/${id}`, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      codigo: data.codigo,
      ubicacion: data.ubicacion
    });
    console.log('✅ Subsector actualizado:', response.data);
    return response.data;
  }
  
  static async eliminarSubsector(id: string): Promise<{ message: string }> {
    console.log('🗑️ Eliminando subsector:', id);
    const response = await axios.delete(`/subsectores/${id}`);
    console.log('✅ Subsector eliminado:', response.data);
    return response.data;
  }

  // ==========================================
  // OPERACIONES COMBINADAS
  // ==========================================
  
  static async obtenerTodos(): Promise<SectorData[]> {
    const [sectores, subsectores] = await Promise.all([
      this.obtenerSectores(),
      this.obtenerSubsectores()
    ]);
    
    return [...sectores, ...subsectores];
  }
  
  static async obtenerArbolSectores(): Promise<any[]> {
    console.log('🌳 Construyendo árbol de sectores completo...');
    
    try {
      // Obtener todos los datos en paralelo
      const [sectoresResponse, subsectoresResponse] = await Promise.all([
        axios.get('/sectores'),
        axios.get('/subsectores')
      ]);
      
      const sectores = sectoresResponse.data.sectores || sectoresResponse.data || [];
      const subsectores = Array.isArray(subsectoresResponse.data) ? subsectoresResponse.data : [];
      
      console.log('📊 Datos obtenidos:', {
        sectores: sectores.length,
        subsectores: subsectores.length
      });
      
      // Construir la jerarquía como la espera el componente
      const arbol = sectores.map((sector: any) => {
        const sectorSubsectores = subsectores.filter((sub: any) => 
          sub.parentId === (sector.id || sector._id)
        );
        
        return {
          ...sector,
          type: 'sector',
          subsectores: sectorSubsectores.map((subsector: any) => ({
            ...subsector,
            type: 'subsector',
            indiciados: [], // Por ahora vacío - se puede expandir después
            vehiculos: []   // Por ahora vacío - se puede expandir después
          })),
          indiciados: [],
          vehiculos: []
        };
      });
      
      console.log('🌳 Árbol construido:', arbol.length, 'sectores con jerarquía');
      return arbol;
      
    } catch (error) {
      console.error('❌ Error construyendo árbol:', error);
      throw error;
    }
  }
  
  static async obtenerOpcionesDropdown(): Promise<Array<{ value: string; label: string; level: number }>> {
    const arbol = await this.obtenerArbolSectores();
    const opciones: Array<{ value: string; label: string; level: number }> = [];
    
    arbol.forEach(sector => {
      opciones.push({
        value: sector.id || sector._id || '',
        label: sector.nombre,
        level: 0
      });
      
      if (sector.children) {
        sector.children.forEach((subsector: any) => {
          opciones.push({
            value: subsector.id || subsector._id || '',
            label: `└─ ${subsector.nombre}`,
            level: 1
          });
        });
      }
    });
    
    return opciones;
  }
}

export default SectoresService;
export { SectoresService };
