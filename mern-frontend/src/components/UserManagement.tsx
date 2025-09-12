import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../theme/theme';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  Filter,
  RefreshCw,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UserService, User, UserStats } from '../services/userService';
import { useDeleteUserConfirmation, useToggleUserStatusConfirmation, useUpdateUserConfirmation } from '../hooks/useCustomConfirmation';
import UserForm from './UserForm';
import UserStatsPanel from './UserStatsPanel';

// Type definitions for styled components with theme prop
interface ThemeProps {
  $theme?: string;
}

interface ThemePropsWithVariants extends ThemeProps {
  $active?: boolean;
  $disabled?: boolean;
}

const Container = styled.div<ThemeProps>`
  padding: 2rem;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.background;
  }};
  min-height: 100vh;
`;

const Header = styled.div<ThemeProps>`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.md;
  }};
`;

const Title = styled.h1<ThemeProps>`
  margin: 0 0 1rem 0;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Description = styled.p<ThemeProps>`
  margin: 0 0 1.5rem 0;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 1rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input<ThemeProps>`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
  }
`;

const SearchIcon = styled(Search)<ThemeProps>`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
`;

const FilterSelect = styled.select<ThemeProps>`
  padding: 12px 16px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
  }
`;

const Button = styled.button`
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const PrimaryButton = styled(Button)<ThemeProps>`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primaryHover;
    }};
  }
`;

const SecondaryButton = styled(Button)<ThemeProps>`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
  }
`;

const Content = styled.div<ThemeProps>`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border-radius: 12px;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.md;
  }};
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th<ThemeProps>`
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  font-weight: 600;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
`;

const TableRow = styled.tr<ThemeProps>`
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
  }
  
  &:nth-child(even) {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.backgroundSecondary;
    }};
  }
`;

const TableCell = styled.td<ThemeProps>`
  padding: 1rem;
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  vertical-align: middle;
`;

const UserAvatar = styled.div<ThemeProps>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  font-weight: 600;
  font-size: 14px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div<ThemeProps>`
  font-weight: 600;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  margin-bottom: 4px;
`;

const UserEmail = styled.div<ThemeProps>`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 0.875rem;
`;

const Badge = styled.span<{ $color: string }>`
  background: ${props => props.$color};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const StatusBadge = styled(Badge)<{ $active: boolean }>`
  background: ${props => props.$active ? '#28a745' : '#6c757d'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<ThemeProps>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
  }
  
  &.edit:hover {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
  }
  
  &.delete:hover {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.danger;
    }};
  }
  
  &.toggle:hover {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.warning;
    }};
  }
`;

const EmptyState = styled.div<ThemeProps>`
  text-align: center;
  padding: 3rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
`;

const EmptyIcon = styled.div<ThemeProps>`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textTertiary;
  }};
`;

const LoadingState = styled.div<ThemeProps>`
  text-align: center;
  padding: 3rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
`;

const Pagination = styled.div<ThemeProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  gap: 1rem;
  border-top: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
`;

const PaginationButton = styled.button<ThemePropsWithVariants>`
  padding: 8px 12px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  background: ${props => {
    const theme = getTheme(props.$theme);
    return props.$active ? theme.colors.primary : theme.colors.background;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return props.$active ? theme.colors.textInverse : theme.colors.textPrimary;
  }};
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return props.$active ? theme.colors.primaryHover : theme.colors.hover;
    }};
  }
`;

const PaginationInfo = styled.span<ThemeProps>`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 0.875rem;
`;

const UserManagement: React.FC = () => {
  // Get current theme from context
  const { theme } = useTheme();
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Modal states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Custom confirmation hooks
  const { confirmDeleteUser, ConfirmationComponent: DeleteConfirmation } = useDeleteUserConfirmation();
  const { confirmToggleUserStatus, ConfirmationComponent: ToggleStatusConfirmation } = useToggleUserStatusConfirmation();
  const { confirmUpdateUser, ConfirmationComponent: UpdateConfirmation } = useUpdateUserConfirmation();

  const usersPerPage = 10;

  // Debug: verificar permisos al cargar el componente
  useEffect(() => {
    const checkPermissions = () => {
      console.log('🔍 UserManagement - Verificando permisos...');
      const isAdmin = UserService.isCurrentUserAdmin();
      const currentUser = UserService.getCurrentUser();
      console.log('🔍 UserManagement - Resultado:', { isAdmin, currentUser });
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers(
        currentPage,
        usersPerPage,
        searchTerm,
        roleFilter
      );
      
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
      setTotalUsers(response.pagination.total);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios: ' + (error.response?.data?.msg || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await UserService.getUserStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = await confirmDeleteUser(user);
    
    if (!confirmed) {
      return;
    }

    try {
      await UserService.deleteUser(user.id);
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario: ' + (error.response?.data?.msg || error.message));
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const confirmed = await confirmToggleUserStatus(user);
    
    if (!confirmed) {
      return;
    }

    try {
      await UserService.toggleUserStatus(user.id);
      toast.success(`Usuario ${user.isActive ? 'desactivado' : 'activado'} exitosamente`);
      loadUsers();
      loadStats();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast.error('Error al cambiar estado: ' + (error.response?.data?.msg || error.message));
    }
  };

  const handleFormSuccess = () => {
    toast.success(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
    setShowUserForm(false);
    setEditingUser(null);
    loadUsers();
    loadStats();
  };

  const handleFormCancel = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const getInitials = (user: User) => {
    // Para PostgreSQL usa fullName, para MongoDB usa nombre + apellidos
    if (user.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      } else if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
      }
    }
    
    // Fallback para estructura MongoDB legacy
    const nombre = (user as any).nombre;
    const apellidos = (user as any).apellidos;
    if (nombre && apellidos) {
      return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
    }
    
    // Fallback al username
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return 'US';
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <PaginationButton
        key="prev"
        onClick={() => setCurrentPage(currentPage - 1)}
        $disabled={currentPage === 1}
        $theme={theme}
      >
        Anterior
      </PaginationButton>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationButton
          key={i}
          onClick={() => setCurrentPage(i)}
          $active={i === currentPage}
          $theme={theme}
        >
          {i}
        </PaginationButton>
      );
    }

    // Next button
    pages.push(
      <PaginationButton
        key="next"
        onClick={() => setCurrentPage(currentPage + 1)}
        $disabled={currentPage === totalPages}
        $theme={theme}
      >
        Siguiente
      </PaginationButton>
    );

    return pages;
  };

  const renderUserRow = (user: User) => {
    const roleBadge = UserService.getRoleBadge(user.role);
    const statusBadge = UserService.getStatusBadge(user.isActive);

    return (
      <TableRow key={user.id} $theme={theme}>
        <TableCell $theme={theme}>
          <UserInfo>
            <UserAvatar $theme={theme}>
              {getInitials(user)}
            </UserAvatar>
            <UserDetails>
              <UserName $theme={theme}>{UserService.getFullName(user)}</UserName>
              <UserEmail $theme={theme}>{user.email}</UserEmail>
            </UserDetails>
          </UserInfo>
        </TableCell>
        <TableCell $theme={theme}>
          <Badge $color={roleBadge.color}>
            {user.role === 'admin' && <Shield size={12} />}
            {(user.role === 'editor' || user.role === 'viewer') && <UserIcon size={12} />}
            {roleBadge.text}
          </Badge>
        </TableCell>
        <TableCell $theme={theme}>
          <StatusBadge $active={user.isActive} $color={statusBadge.color}>
            {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {statusBadge.text}
          </StatusBadge>
        </TableCell>
        <TableCell $theme={theme}>
          {new Date(user.createdAt).toLocaleDateString('es-ES')}
        </TableCell>
        <TableCell $theme={theme}>
          <ActionButtons>
            <ActionButton
              className="edit"
              onClick={() => handleEditUser(user)}
              title="Editar usuario"
              $theme={theme}
            >
              <Edit size={16} />
            </ActionButton>
            <ActionButton
              className="toggle"
              onClick={() => handleToggleUserStatus(user)}
              title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
              $theme={theme}
            >
              {user.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
            </ActionButton>
            {user.role !=="admin" &&(<ActionButton
              className="delete"
              onClick={() => handleDeleteUser(user)}
              title="Eliminar usuario"
              $theme={theme}
            >
              <Trash2 size={16} />
            </ActionButton>)}
          </ActionButtons>
        </TableCell>
      </TableRow>
    );
  };

  if (!UserService.isCurrentUserAdmin()) {
    return (
      <Container $theme={theme}>
        <EmptyState>
          <EmptyIcon><AlertTriangle /></EmptyIcon>
          <h3>Acceso Denegado</h3>
          <p>No tienes permisos para acceder a la gestión de usuarios.</p>
          <p>Esta funcionalidad está reservada solo para administradores.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container $theme={theme}>
      <Header $theme={theme}>
        <Title $theme={theme}>
          <Users size={28} />
          Gestión de Usuarios
        </Title>
        <Description $theme={theme}>
          Administra los usuarios del sistema. Solo los administradores pueden acceder a esta sección.
        </Description>
        <Controls>
          <SearchContainer>
            <SearchIcon size={18} $theme={theme} />
            <SearchInput
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              value={searchTerm}
              onChange={handleSearch}
              $theme={theme}
            />
          </SearchContainer>
          
          <FilterSelect value={roleFilter} onChange={handleRoleFilter} $theme={theme}>
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="editor">Editores</option>
            <option value="viewer">Visualizadores</option>
            <option value="user">Usuarios</option>
          </FilterSelect>

          <SecondaryButton onClick={loadUsers} $theme={theme}>
            <RefreshCw size={18} />
            Actualizar
          </SecondaryButton>

          <PrimaryButton onClick={handleCreateUser} $theme={theme}>
            <Plus size={18} />
            Nuevo Usuario
          </PrimaryButton>
        </Controls>
      </Header>

      {stats && <UserStatsPanel stats={stats} theme={theme} />}

      <Content $theme={theme}>
        {loading ? (
          <LoadingState>
            <div>Cargando usuarios...</div>
          </LoadingState>
        ) : users.length === 0 ? (
          <EmptyState>
            <EmptyIcon><Users /></EmptyIcon>
            <h3>No hay usuarios</h3>
            <p>
              {searchTerm || roleFilter !== 'all' 
                ? 'No se encontraron usuarios con los filtros aplicados'
                : 'Aún no hay usuarios registrados en el sistema'
              }
            </p>
          </EmptyState>
        ) : (
          <>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader $theme={theme}>Usuario</TableHeader>
                    <TableHeader $theme={theme}>Rol</TableHeader>
                    <TableHeader $theme={theme}>Estado</TableHeader>
                    <TableHeader $theme={theme}>Fecha de Registro</TableHeader>
                    <TableHeader $theme={theme}>Acciones</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {users.map(renderUserRow)}
                </tbody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Pagination $theme={theme}>
                {renderPagination()}
                <PaginationInfo $theme={theme}>
                  Página {currentPage} de {totalPages} • {totalUsers} usuarios total
                </PaginationInfo>
              </Pagination>
            )}
          </>
        )}
      </Content>

      {showUserForm && (
        <UserForm
          user={editingUser}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          loading={formLoading}
          theme={theme}
        />
      )}
      
      {/* Custom Confirmation Modals */}
      <DeleteConfirmation />
      <ToggleStatusConfirmation />
      <UpdateConfirmation />
    </Container>
  );
};

export default UserManagement;
