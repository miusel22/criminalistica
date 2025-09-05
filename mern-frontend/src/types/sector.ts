// Tipos para sectores y subsectores

export interface Sector {
  id?: string;
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipo: 'sector' | 'subsector';
  parentId?: string; // Para subsectores, referencia al sector padre
  ownerId: string;
  miembros?: {
    userId: string;
    role: string;
    joinedAt: Date;
  }[];
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectorTreeNode extends Sector {
  children?: SectorTreeNode[];
  level: number;
}

export interface SectoresResponse {
  sectores: Sector[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}
