import { Indiciado } from './indiciado.model';

export interface Carpeta {
  id: number;
  nombre: string;
  owner_id: number;
  parent_id?: number | null;
  sub_carpetas?: Carpeta[]; 
  indiciados?: Indiciado[];
}