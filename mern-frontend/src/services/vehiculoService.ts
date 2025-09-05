import axios from 'axios';
import { 
  Vehiculo, 
  VehiculosResponse, 
  VehiculoFormData, 
  EstadisticasVehiculos,
  FiltrosVehiculo 
} from '../types/vehiculo';

const API_BASE = '/vehiculos';

export class VehiculoService {
  // ============================================================================
  // CRUD Básico
  // ============================================================================

  // Crear vehículo
  static async crear(vehiculoData: VehiculoFormData, fotos?: File[]): Promise<{ message: string; vehiculo: Vehiculo }> {
    console.log('🆕 VehiculoService.crear - Datos:', vehiculoData);
    
    try {
      // Enviar datos directamente en el formato que espera PostgreSQL
      const payload = {
        ...vehiculoData,
        // Asegurar que las fechas estén en formato correcto
        fechaIncidente: vehiculoData.fechaIncidente || null,
      };
      
      console.log('📦 Payload para PostgreSQL:', payload);
      const response = await axios.post(API_BASE, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Vehículo creado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en creación:', error.response?.data || error.message);
      throw error;
    }
  }

  // Obtener todos los vehículos
  static async obtenerTodos(filtros: FiltrosVehiculo = {}): Promise<Vehiculo[]> {
    console.log('🐘 VehiculoService.obtenerTodos - Usando PostgreSQL');
    try {
      const response = await axios.get(API_BASE);
      const vehiculos = Array.isArray(response.data) ? response.data : [];
      console.log('📊 Vehículos obtenidos:', vehiculos.length);
      return vehiculos;
    } catch (error: any) {
      console.error('❌ Error obteniendo vehículos:', error.response?.data || error.message);
      throw error;
    }
  }

  // Obtener vehículo específico
  static async obtener(id: string): Promise<Vehiculo> {
    console.log('🔍 VehiculoService.obtener - ID:', id);
    const response = await axios.get(`${API_BASE}/${id}`);
    console.log('✅ Vehículo obtenido:', response.data);
    return response.data;
  }

  // Actualizar vehículo
  static async actualizar(
    id: string, 
    vehiculoData: Partial<VehiculoFormData>, 
    nuevasFotos?: File[]
  ): Promise<{ message: string; vehiculo: Vehiculo }> {
    console.log('🔄 VehiculoService.actualizar - ID:', id, 'Datos:', vehiculoData);
    
    try {
      // Enviar datos directamente en el formato que espera PostgreSQL
      const payload = {
        ...vehiculoData,
        // Asegurar que las fechas estén en formato correcto
        fechaIncidente: vehiculoData.fechaIncidente || null,
      };
      
      console.log('📦 Payload para PostgreSQL:', payload);
      const response = await axios.put(`${API_BASE}/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Vehículo actualizado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error en actualización:', error.response?.data || error.message);
      throw error;
    }
  }

  // Eliminar vehículo
  static async eliminar(id: string): Promise<{ message: string }> {
    console.log('🗑️ VehiculoService.eliminar - ID:', id);
    const response = await axios.delete(`${API_BASE}/${id}`);
    console.log('✅ Vehículo eliminado:', response.data);
    return response.data;
  }

  // ============================================================================
  // Búsqueda y Filtros
  // ============================================================================

  // Buscar vehículos
  static async buscar(query: string): Promise<{ msg: string; vehiculos: Vehiculo[] }> {
    const response = await axios.get(`${API_BASE}/buscar/${encodeURIComponent(query)}`);
    return response.data;
  }

  // ============================================================================
  // Gestión de Fotos
  // ============================================================================

  // Eliminar foto específica
  static async eliminarFoto(vehiculoId: string, fotoId: string): Promise<{ msg: string }> {
    const response = await axios.delete(`${API_BASE}/${vehiculoId}/fotos/${fotoId}`);
    return response.data;
  }

  // Obtener URL de foto
  static obtenerUrlFoto(filename: string): string {
    if (!filename) return '';
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/uploads/${filename}`;
  }

  // ============================================================================
  // Estadísticas
  // ============================================================================

  // Obtener estadísticas generales
  static async obtenerEstadisticas(): Promise<EstadisticasVehiculos> {
    const response = await axios.get(`${API_BASE}/stats/general`);
    return response.data;
  }

  // ============================================================================
  // Preparación de datos para PostgreSQL
  // ============================================================================

  // Preparar datos para PostgreSQL (JSON simple)
  private static prepararDatosPostgres(data: Partial<VehiculoFormData>): any {
    const payload: any = {};
    
    // Campos básicos
    if (data.tipoVehiculo) payload.tipoVehiculo = data.tipoVehiculo;
    if (data.marca) payload.marca = data.marca;
    if (data.linea) payload.linea = data.linea;
    if (data.modelo) payload.modelo = data.modelo;
    if (data.placa) payload.placa = data.placa.toUpperCase();
    if (data.color) payload.color = data.color;
    if (data.numeroChasis) payload.numeroChasis = data.numeroChasis.toUpperCase();
    if (data.numeroMotor) payload.numeroMotor = data.numeroMotor;
    if (data.combustible) payload.combustible = data.combustible;
    if (data.estado) payload.estado = data.estado;
    if (data.observaciones) payload.observaciones = data.observaciones;
    if (data.sectorQueOpera) payload.sectorQueOpera = data.sectorQueOpera;
    if (data.subsectorId) payload.subsectorId = data.subsectorId;
    
    console.log('🗺️ Payload preparado para PostgreSQL (Vehículo):', payload);
    return payload;
  }

  // ============================================================================
  // Utilidades
  // ============================================================================

  // Formatear identificación del vehículo
  static formatearIdentificacion(vehiculo: Vehiculo): string {
    const partes = [];
    if (vehiculo.marca) partes.push(vehiculo.marca);
    if (vehiculo.linea) partes.push(vehiculo.linea);
    if (vehiculo.modelo) partes.push(vehiculo.modelo);
    if (vehiculo.placa) partes.push(`(${vehiculo.placa})`);
    return partes.join(' ') || 'Sin identificación';
  }

  // Obtener tipo de vehículo con ícono
  static obtenerTipoConIcono(tipoVehiculo: string): { tipo: string; icono: string } {
    const iconos: { [key: string]: string } = {
      'Taxi': '🚖',
      'Automóvil': '🚗',
      'Motocicleta': '🏍️',
      'Camioneta': '🚙',
      'Camión': '🚛',
      'Bus': '🚌',
      'Microbus': '🚐',
      'Furgón': '🚐',
      'Tractocamión': '🚚',
      'Otro': '🚗'
    };

    return {
      tipo: tipoVehiculo,
      icono: iconos[tipoVehiculo] || '🚗'
    };
  }

  // Validar vigencia de documentos
  static validarVigenciaDocumentos(vehiculo: Vehiculo): {
    soatVigente: boolean;
    tecnomecanicaVigente: boolean;
    soatDiasRestantes?: number;
    tecnomecanicaDiasRestantes?: number;
  } {
    const hoy = new Date();
    const resultado = {
      soatVigente: true,
      tecnomecanicaVigente: true,
      soatDiasRestantes: undefined as number | undefined,
      tecnomecanicaDiasRestantes: undefined as number | undefined
    };

    // Verificar SOAT
    if (vehiculo.soat?.vigencia) {
      const fechaSoat = new Date(vehiculo.soat.vigencia);
      const diasRestantes = Math.ceil((fechaSoat.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      resultado.soatVigente = diasRestantes >= 0;
      resultado.soatDiasRestantes = diasRestantes;
    }

    // Verificar Tecnomecánica
    if (vehiculo.tecnomecanica?.vigencia) {
      const fechaTecnomecanica = new Date(vehiculo.tecnomecanica.vigencia);
      const diasRestantes = Math.ceil((fechaTecnomecanica.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      resultado.tecnomecanicaVigente = diasRestantes >= 0;
      resultado.tecnomecanicaDiasRestantes = diasRestantes;
    }

    return resultado;
  }

  // Exportar datos de vehículo para reportes
  static exportarParaReporte(vehiculo: Vehiculo): any {
    return {
      id: vehiculo.id,
      identificacion: this.formatearIdentificacion(vehiculo),
      tipo: vehiculo.tipoVehiculo,
      marca: vehiculo.marca || 'No especificada',
      linea: vehiculo.linea || 'No especificada',
      modelo: vehiculo.modelo || 'No especificado',
      placa: vehiculo.placa || 'Sin placa',
      color: vehiculo.color || 'No especificado',
      propietario: vehiculo.propietario?.nombre || 'No especificado',
      estado: vehiculo.estado || 'No especificado',
      fechaIncidente: vehiculo.fechaIncidente || 'No especificada',
      lugarIncidente: vehiculo.lugarIncidente || 'No especificado',
      soatVigencia: vehiculo.soat?.vigencia || 'No especificada',
      tecnomecanicaVigencia: vehiculo.tecnomecanica?.vigencia || 'No especificada',
      fechaCreacion: vehiculo.createdAt ? new Date(vehiculo.createdAt).toLocaleDateString() : 'No disponible',
      observaciones: vehiculo.observaciones || 'Ninguna'
    };
  }
}

export default VehiculoService;
