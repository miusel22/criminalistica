import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Description = styled.p`
  margin: 0 0 1.5rem 0;
  color: #666;
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

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
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

const PrimaryButton = styled(Button)`
  background: #007bff;
  color: white;
  
  &:hover {
    background: #0056b3;
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  color: white;
  
  &:hover {
    background: #545b62;
  }
`;

const Content = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  color: #495057;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
  
  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.02);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #0056b3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
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

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  color: #666;
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

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    color: #333;
  }
  
  &.edit:hover {
    color: #007bff;
  }
  
  &.delete:hover {
    color: #dc3545;
  }
  
  &.toggle:hover {
    color: #ffc107;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ddd;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  gap: 1rem;
  border-top: 1px solid #e9ecef;
`;

const PaginationButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#495057'};
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#0056b3' : '#f8f9fa'};
  }
`;

const PaginationInfo = styled.span`
  color: #6c757d;
  font-size: 0.875rem;
`;

const UserManagement: React.FC = () => {
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
      <TableRow key={user.id}>
        <TableCell>
          <UserInfo>
            <UserAvatar>
              {getInitials(user)}
            </UserAvatar>
            <UserDetails>
              <UserName>{UserService.getFullName(user)}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserDetails>
          </UserInfo>
        </TableCell>
        <TableCell>
          <Badge $color={roleBadge.color}>
            {user.role === 'admin' && <Shield size={12} />}
            {(user.role === 'editor' || user.role === 'viewer') && <UserIcon size={12} />}
            {roleBadge.text}
          </Badge>
        </TableCell>
        <TableCell>
          <StatusBadge $active={user.isActive} $color={statusBadge.color}>
            {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {statusBadge.text}
          </StatusBadge>
        </TableCell>
        <TableCell>
          {new Date(user.createdAt).toLocaleDateString('es-ES')}
        </TableCell>
        <TableCell>
          <ActionButtons>
            <ActionButton
              className="edit"
              onClick={() => handleEditUser(user)}
              title="Editar usuario"
            >
              <Edit size={16} />
            </ActionButton>
            <ActionButton
              className="toggle"
              onClick={() => handleToggleUserStatus(user)}
              title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
            >
              {user.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
            </ActionButton>
            <ActionButton
              className="delete"
              onClick={() => handleDeleteUser(user)}
              title="Eliminar usuario"
            >
              <Trash2 size={16} />
            </ActionButton>
          </ActionButtons>
        </TableCell>
      </TableRow>
    );
  };

  if (!UserService.isCurrentUserAdmin()) {
    return (
      <Container>
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
    <Container>
      <Header>
        <Title>
          <Users size={28} />
          Gestión de Usuarios
        </Title>
        <Description>
          Administra los usuarios del sistema. Solo los administradores pueden acceder a esta sección.
        </Description>
        <Controls>
          <SearchContainer>
            <SearchIcon size={18} />
            <SearchInput
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </SearchContainer>
          
          <FilterSelect value={roleFilter} onChange={handleRoleFilter}>
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="editor">Editores</option>
            <option value="viewer">Visualizadores</option>
            <option value="user">Usuarios</option>
          </FilterSelect>

          <SecondaryButton onClick={loadUsers}>
            <RefreshCw size={18} />
            Actualizar
          </SecondaryButton>

          <PrimaryButton onClick={handleCreateUser}>
            <Plus size={18} />
            Nuevo Usuario
          </PrimaryButton>
        </Controls>
      </Header>

      {stats && <UserStatsPanel stats={stats} />}

      <Content>
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
                    <TableHeader>Usuario</TableHeader>
                    <TableHeader>Rol</TableHeader>
                    <TableHeader>Estado</TableHeader>
                    <TableHeader>Fecha de Registro</TableHeader>
                    <TableHeader>Acciones</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {users.map(renderUserRow)}
                </tbody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Pagination>
                {renderPagination()}
                <PaginationInfo>
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
