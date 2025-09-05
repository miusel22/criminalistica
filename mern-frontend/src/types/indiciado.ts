// Tipos para el modelo de Indiciado

export interface DocumentoIdentidad {
  tipo?: string;
  numero?: string;
  expedidoEn?: string;
}

export interface FechaNacimiento {
  fecha?: string;
  lugar?: string;
}

export interface SenalesFisicas {
  estatura?: string;
  peso?: string;
  contexturaFisica?: string;
  colorPiel?: string;
  colorOjos?: string;
  colorCabello?: string;
  marcasEspeciales?: string;
  // Campos adicionales para PostgreSQL
  tatuajes?: string;
  cicatrices?: string;
  piercing?: string;
  deformidades?: string;
  otras?: string;
}

export interface FotoIndiciado {
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  path?: string;
  fechaSubida?: string;
}

// Interfaces específicas para PostgreSQL
export interface InformacionMedica {
  enfermedades?: string;
  medicamentos?: string;
  alergias?: string;
  discapacidades?: string;
  adicciones?: string;
  tratamientos?: string;
}

export interface InformacionDelito {
  fechaDelito?: string;
  lugarDelito?: string;
  tipoDelito?: string;
  modalidad?: string;
  descripcionHechos?: string;
  victimas?: string[];
  testigos?: string[];
  coautores?: string[];
}

export interface InformacionJudicial {
  numeroRadicado?: string;
  fiscalAsignado?: string;
  juzgado?: string;
  estadoProceso?: string;
  fechaCaptura?: string;
  lugarCaptura?: string;
  ordenesPendientes?: string[];
  antecedentes?: string[];
}

export interface InformacionPolicial {
  unidadCaptura?: string;
  investigadorAsignado?: string;
  numeroInvestigacion?: string;
  clasificacionRiesgo?: string;
  observacionesEspeciales?: string;
}

export interface Indiciado {
  id?: string;
  _id?: string; // MongoDB ObjectId
  sectorQueOpera?: string;
  nombre: string;
  apellidos: string;
  alias?: string;
  documentoIdentidad?: DocumentoIdentidad;
  fechaNacimiento?: FechaNacimiento;
  edad?: number;
  hijoDe?: string;
  genero?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  residencia?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estudiosRealizados?: string;
  profesion?: string;
  oficio?: string;
  senalesFisicas?: SenalesFisicas;
  // Campos específicos de PostgreSQL
  informacionMedica?: InformacionMedica;
  informacionDelito?: InformacionDelito;
  informacionJudicial?: InformacionJudicial;
  informacionPolicial?: InformacionPolicial;
  estado?: string;
  // Campos legacy para compatibilidad con MongoDB
  bandaDelincuencial?: string;
  delitosAtribuidos?: string;
  situacionJuridica?: string;
  observaciones?: string;
  foto?: FotoIndiciado;
  fotoUrl?: string;
  googleEarthUrl?: string;
  subsectorId?: string;
  ownerId?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  nombreCompleto?: string;
}

export interface IndiciadosResponse {
  indiciados: Indiciado[];
  total: number;
  page: number;
  pages: number;
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface EstadisticasIndiciados {
  total: number;
  eliminados: number;
  recientes: number;
  estadoCivil: { _id: string; count: number }[];
  sectores: { _id: string; count: number }[];
}

export enum EstadoCivil {
  SOLTERO = 'Soltero',
  CASADO = 'Casado',
  UNION_LIBRE = 'Unión Libre',
  VIUDO = 'Viudo',
  DIVORCIADO = 'Divorciado',
  SEPARADO = 'Separado'
}

// Tipo para el formulario de indiciado
export interface IndiciadoFormData {
  id?: string;
  sectorQueOpera?: string;
  nombre: string;
  apellidos: string;
  alias?: string;
  // Documento
  documentoIdentidad?: {
    tipo?: string;
    numero?: string;
    expedidoEn?: string;
  }
  // Fecha de nacimiento
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  edad?: string;
  // Personal
  hijoDe?: string;
  genero?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  residencia?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  // Académica/Laboral
  estudiosRealizados?: string;
  profesion?: string;
  oficio?: string;
  // Señales físicas básicas
  senalesFisicas?: {
    estatura?: string;
    peso?: string;
    contexturaFisica?: string;
    colorPiel?: string;
    colorOjos?: string;
    colorCabello?: string;
    marcasEspeciales?: string;
  }
  // Señales físicas detalladas
  senalesFisicasDetalladas?: {
    complexion?: string;
    formaCara?: string;
    tipoCabello?: string;
    largoCabello?: string;
    formaOjos?: string;
    formaNariz?: string;
    formaBoca?: string;
    formaLabios?: string;
  }
  // Señales físicas adicionales para PostgreSQL
  tatuajes?: string;
  cicatrices?: string;
  piercing?: string;
  deformidades?: string;
  otras?: string;
  // Información específica de PostgreSQL
  informacionMedica?: InformacionMedica | string;
  informacionDelito?: InformacionDelito | string;
  informacionJudicial?: InformacionJudicial | string;
  informacionPolicial?: InformacionPolicial | string;
  estado?: string;
  // Información delictiva (legacy MongoDB)
  bandaDelincuencial?: string;
  delitosAtribuidos?: string;
  situacionJuridica?: string;
  antecedentes?: string;
  // Adicionales
  observaciones?: string;
  googleEarthUrl?: string;
  urlGoogleEarth?: string;
  cedula?: string;
  ocupacion?: string;
  subsectorId?: string;
  foto?: File;
}
