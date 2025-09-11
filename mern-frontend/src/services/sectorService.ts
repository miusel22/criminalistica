import axios from 'axios';
import { Sector, SectoresResponse, SectorTreeNode } from '../types/sector';

// Usar la instancia global de axios que ya tiene el interceptor configurado en AuthContext

export class SectorService {
  // Obtener todos los sectores del usuario
  static async obtenerTodos(): Promise<Sector[]> {
    const response = await axios.get('/sectores');
    const sectores = response.data.sectores || response.data || [];
    return sectores;
  }

  // Obtener sectores organizados en árbol
  static async obtenerArbol(): Promise<SectorTreeNode[]> {
    const sectores = await this.obtenerTodos();
    return this.construirArbol(sectores);
  }

  // Obtener solo subsectores
  static async obtenerSubsectores(): Promise<Sector[]> {
    const sectores = await this.obtenerTodos();
    return sectores.filter(sector => sector.tipo === 'subsector');
  }

  // Construir árbol jerárquico de sectores
  private static construirArbol(sectores: Sector[]): SectorTreeNode[] {
    const sectoresMap = new Map<string, SectorTreeNode>();
    const raiz: SectorTreeNode[] = [];

    // Convertir sectores a nodos del árbol
    sectores.forEach(sector => {
      const nodo: SectorTreeNode = {
        ...sector,
        children: [],
        level: 0
      };
      sectoresMap.set(sector._id || sector.id || '', nodo);
    });

    // Construir relaciones padre-hijo
    sectores.forEach(sector => {
      const sectorId = sector._id || sector.id || '';
      const nodo = sectoresMap.get(sectorId);
      
      if (nodo) {
        if (sector.parentId) {
          // Es un subsector
          const padre = sectoresMap.get(sector.parentId);
          if (padre) {
            nodo.level = padre.level + 1;
            padre.children?.push(nodo);
          }
        } else {
          // Es un sector raíz
          raiz.push(nodo);
        }
      }
    });

    return raiz;
  }

  // Obtener opciones planas para dropdown (sectores y subsectores)
  static async obtenerOpcionesDropdown(): Promise<Array<{ value: string; label: string; level: number }>> {
    const arbol = await this.obtenerArbol();
    const opciones: Array<{ value: string; label: string; level: number }> = [];

    const procesarNodo = (nodo: SectorTreeNode) => {
      opciones.push({
        value: nodo._id || nodo.id || '',
        label: nodo.nombre,
        level: nodo.level
      });

      nodo.children?.forEach(procesarNodo);
    };

    arbol.forEach(procesarNodo);
    return opciones;
  }

  // Crear nuevo sector
  static async crear(sector: Partial<Sector>): Promise<{ msg: string; sector: Sector }> {
    const response = await axios.post('/sectores', sector);
    return response.data;
  }

  // Actualizar sector
  static async actualizar(id: string, sector: Partial<Sector>): Promise<{ msg: string; sector: Sector }> {
    const response = await axios.put(`/sectores/${id}`, sector);
    return response.data;
  }

  // Eliminar sector
  static async eliminar(id: string): Promise<{ msg: string }> {
    const response = await axios.delete(`/sectores/${id}`);
    return response.data;
  }
}
