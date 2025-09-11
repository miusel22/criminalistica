import axios from 'axios';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Campos adicionales de PostgreSQL
  lastLogin?: string;
  profileImage?: string;
  department?: string;
  position?: string;
  phone?: string;
  emailNotifications?: boolean;
  invitedBy?: string;
  invitationAcceptedAt?: string;
}

export interface UserFormData {
  nombre: string;
  apellidos: string;
  username?: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive?: boolean;
}

export interface UserUpdateData {
  nombre?: string;
  apellidos?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'editor' | 'viewer';
  isActive?: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  regularUsers: number;
  recent: number;
}

export class UserService {
  // Obtener todos los usuarios con paginación y filtros
  static async getAllUsers(
    page = 1, 
    limit = 10, 
    search = '', 
    role = 'all'
  ): Promise<UsersResponse> {
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (role !== 'all') params.append('role', role);
    
    const response = await axios.get(`/users?${params.toString()}`);
    return response.data;
  }

  // Obtener usuario por ID
  static async getUserById(id: string): Promise<User> {
    const response = await axios.get(`/users/${id}`);
    return response.data;
  }

  // Crear nuevo usuario
  static async createUser(userData: UserFormData): Promise<{ msg: string; user: User }> {
    const response = await axios.post('/users', userData);
    return response.data;
  }

  // Actualizar usuario
  static async updateUser(
    id: string, 
    userData: UserUpdateData
  ): Promise<{ msg: string; user: User }> {
    const response = await axios.put(`/users/${id}`, userData);
    return response.data;
  }

  // Eliminar usuario
  static async deleteUser(id: string): Promise<{ msg: string }> {
    const response = await axios.delete(`/users/${id}`);
    return response.data;
  }

  // Cambiar estado activo/inactivo del usuario
  static async toggleUserStatus(id: string): Promise<{ msg: string; user: User }> {
    const response = await axios.patch(`/users/${id}/toggle-status`);
    return response.data;
  }

  // Obtener estadísticas de usuarios
  static async getUserStats(): Promise<UserStats> {
    const response = await axios.get('/users/stats');
    return response.data;
  }

  // Validar si el usuario actual es administrador
  static isCurrentUserAdmin(): boolean {
    try {
      console.log('🔍 UserService - Verificando permisos de administrador...');
      
      // Método 1: localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            return true;
          }
        } catch (parseError) {
          console.error('❌ Error parseando usuario de localStorage:', parseError);
        }
      }

      // Método 2: sessionStorage como fallback
      const sessionUserStr = sessionStorage.getItem('user');
      if (sessionUserStr) {
        try {
          const user = JSON.parse(sessionUserStr);
          if (user.role === 'admin') {
            return true;
          }
        } catch (parseError) {
          console.error('❌ Error parseando usuario de sessionStorage:', parseError);
        }
      }

      // Método 3: Verificar token JWT para extraer rol (fallback de emergencia)
      const token = localStorage.getItem('access_token');
      if (token && token !== 'temp-development-token') {
        try {
          // Decodificar payload JWT (solo para verificar rol, no para validar)
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role === 'admin') {
            return true;
          }
        } catch (tokenError) {
          console.error('❌ Error decodificando token JWT:', tokenError);
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error general validando rol de admin:', error);
      return false;
    }
  }

  // Obtener información del usuario actual
  static getCurrentUser(): User | null {
    try {
      // Intentar múltiples fuentes
      const userStr = localStorage.getItem('user');
      
      if (userStr) {
        return JSON.parse(userStr);
      }

      // Fallback a sessionStorage
      const sessionUserStr = sessionStorage.getItem('user');
      if (sessionUserStr) {
        return JSON.parse(sessionUserStr);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Formatear nombre completo
  static getFullName(user: User): string {
    // Para PostgreSQL usa fullName, para compatibilidad con MongoDB usa nombre + apellidos
    if (user.fullName) {
      return user.fullName.trim();
    }
    // Fallback para estructura MongoDB legacy
    const nombre = (user as any).nombre || '';
    const apellidos = (user as any).apellidos || '';
    if (nombre || apellidos) {
      return `${nombre} ${apellidos}`.trim();
    }
    // Fallback al username si no hay fullName
    return user.username || 'Sin nombre';
  }

  // Obtener badge de rol
  static getRoleBadge(role: string): { text: string; color: string } {
    switch (role) {
      case 'admin':
        return { text: 'Administrador', color: '#dc3545' };
      case 'editor':
        return { text: 'Editor', color: '#ffc107' };
      case 'viewer':
        return { text: 'Visualizador', color: '#28a745' };
      case 'user': // Compatibilidad con MongoDB
        return { text: 'Usuario', color: '#28a745' };
      default:
        return { text: role, color: '#6c757d' };
    }
  }

  // Obtener badge de estado
  static getStatusBadge(isActive: boolean): { text: string; color: string } {
    return isActive 
      ? { text: 'Activo', color: '#28a745' }
      : { text: 'Inactivo', color: '#6c757d' };
  }

  // Validar datos del formulario
  static validateUserData(data: Partial<UserFormData>): string[] {
    const errors: string[] = [];

    if (data.nombre && (data.nombre.length < 2 || data.nombre.length > 50)) {
      errors.push('El nombre debe tener entre 2 y 50 caracteres');
    }

    if (data.apellidos && (data.apellidos.length < 2 || data.apellidos.length > 50)) {
      errors.push('Los apellidos deben tener entre 2 y 50 caracteres');
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('El email no tiene un formato válido');
      }
    }

    if (data.password) {
      if (data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        errors.push('La contraseña debe contener al menos una minúscula, una mayúscula y un número');
      }
    }

    if (data.role && !['admin', 'editor', 'viewer'].includes(data.role)) {
      errors.push('El rol debe ser "admin", "editor" o "viewer"');
    }

    return errors;
  }
}
