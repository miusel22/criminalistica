// Tipos para el modelo de Vehículo

export interface PropietarioVehiculo {
  nombre?: string;
  documento?: {
    tipo?: 'CC' | 'CE' | 'TI' | 'NIT' | 'Pasaporte' | 'Otro' | '';
    numero?: string;
  };
  telefono?: string;
  direccion?: string;
}

export interface SoatVehiculo {
  numeroPoliza?: string;
  vigencia?: string; // ISO date string
  aseguradora?: string;
}

export interface TecnomecanicaVehiculo {
  numero?: string;
  vigencia?: string; // ISO date string
  cda?: string;
}

export interface FotoVehiculo {
  _id?: string;
  filename?: string;
  originalName?: string;
  descripcion?: string;
  mimeType?: string;
  size?: number;
  path?: string;
  url?: string;
  fechaSubida?: string;
}

export interface DocumentoVehiculo {
  filename: string;
  originalName: string;
  descripcion: string;
  mimeType: string;
  size: number;
  path: string;
  fechaSubida?: string;
}

export interface Vehiculo {
  id?: string;
  _id?: string; // MongoDB ObjectId
  
  // Información básica
  sectorQueOpera?: string;
  tipoVehiculo: 'Taxi' | 'Automóvil' | 'Motocicleta' | 'Camioneta' | 'Camión' | 'Bus' | 'Microbus' | 'Furgón' | 'Tractocamión' | 'Otro';
  
  // Información técnica
  marca?: string;
  linea?: string;
  modelo?: string;
  
  // Identificación
  placa?: string;
  numeroChasis?: string;
  numeroMotor?: string;
  
  // Características físicas
  color?: string;
  cilindraje?: string;
  combustible?: 'Gasolina' | 'Diesel' | 'Gas' | 'Eléctrico' | 'Híbrido' | 'Otro' | '';
  
  // Información de propiedad
  propietario?: PropietarioVehiculo;
  
  // Información legal
  soat?: SoatVehiculo;
  tecnomecanica?: TecnomecanicaVehiculo;
  
  // Estado
  estado?: 'Activo' | 'Inmovilizado' | 'Retenido' | 'Decomisado' | 'Destruido' | 'Otro';
  
  // Información del incidente
  fechaIncidente?: string; // ISO date string
  lugarIncidente?: string;
  tipoIncidente?: string;
  
  // Observaciones
  observaciones?: string;
  caracteristicasParticulares?: string;
  
  // Multimedia
  fotos?: FotoVehiculo[];
  documentosRelacionados?: DocumentoVehiculo[];
  
  // Ubicación
  googleEarthUrl?: string;
  
  // Metadatos
  subsectorId?: string;
  ownerId?: string;
  activo?: boolean;
  identificacion?: string; // Virtual field
  createdAt?: string;
  updatedAt?: string;
}

export interface VehiculosResponse {
  vehiculos: Vehiculo[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface EstadisticasVehiculos {
  total: number;
  eliminados: number;
  recientes: number;
  porTipo: { _id: string; count: number }[];
  porEstado: { _id: string; count: number }[];
}

// Tipos para formularios
export interface VehiculoFormData {
  id?: string;
  sectorQueOpera?: string;
  tipoVehiculo: string;
  marca?: string;
  linea?: string;
  modelo?: string;
  placa?: string;
  numeroChasis?: string;
  numeroMotor?: string;
  color?: string;
  cilindraje?: string;
  combustible?: string;
  
  // Propietario
  propietarioNombre?: string;
  propietarioDocumentoTipo?: string;
  propietarioDocumentoNumero?: string;
  propietarioTelefono?: string;
  propietarioDireccion?: string;
  
  // SOAT
  soatNumeroPoliza?: string;
  soatVigencia?: string;
  soatAseguradora?: string;
  
  // Tecnomecánica
  tecnomecanicaNumero?: string;
  tecnomecanicaVigencia?: string;
  tecnomecanicaCda?: string;
  
  // Estado e incidente
  estado?: string;
  fechaIncidente?: string;
  lugarIncidente?: string;
  tipoIncidente?: string;
  
  // Observaciones
  observaciones?: string;
  caracteristicasParticulares?: string;
  
  // Ubicación
  googleEarthUrl?: string;
  
  // Archivos
  fotos?: File[];
  
  // Metadatos
  subsectorId?: string;
}

// Constantes para los tipos de vehículo
export const TIPOS_VEHICULO = [
  'Taxi',
  'Automóvil',
  'Motocicleta',
  'Camioneta',
  'Camión',
  'Bus',
  'Microbus',
  'Furgón',
  'Tractocamión',
  'Otro'
] as const;

export const TIPOS_COMBUSTIBLE = [
  'Gasolina',
  'Diesel',
  'Gas',
  'Eléctrico',
  'Híbrido',
  'Otro'
] as const;

export const ESTADOS_VEHICULO = [
  'Activo',
  'Inmovilizado',
  'Retenido',
  'Decomisado',
  'Destruido',
  'Otro'
] as const;

export const TIPOS_DOCUMENTO_PROPIETARIO = [
  'CC',
  'CE',
  'TI',
  'NIT',
  'Pasaporte',
  'Otro'
] as const;

// Filtros para búsqueda
export interface FiltrosVehiculo {
  subsectorId?: string;
  tipoVehiculo?: string;
  estado?: string;
  search?: string;
  page?: number;
  limit?: number;
}
