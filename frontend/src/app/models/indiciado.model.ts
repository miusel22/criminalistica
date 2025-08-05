export interface Indiciado {
  id: number;
  nombres: string;
  apellidos: string;
  cc: string;
  alias?: string;
  fecha_nacimiento?: string;
  edad?: number;
  foto_url?: string;
  carpeta_id: number;
  
  hijo_de?: string;
  estado_civil?: string;
  residencia?: string;
  telefono?: string;
  estudios_realizados?: string;
  profesion?: string;
  oficio?: string;
  senales_fisicas?: string;
  banda_delincuencial?: string;
  delitos_atribuidos?: string;
  situacion_juridica?: string;
  observaciones?: string;
  sub_sector?: string;
}