import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Folder, Home as HomeIcon, Mail, Users, Shield, FileText, User, Database, BarChart3 } from 'lucide-react';
import styled from 'styled-components';
import { getTheme } from '../theme/theme';
import ThemeToggle from './ThemeToggle';
import EnhancedSectoresManager from './sectores/EnhancedSectoresManager';
import IndiciadoDetail from './IndiciadoDetail';
import InvitationManager from './admin/InvitationManager';
import UserManagement from './UserManagement';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.background;
  }};
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const Header = styled.header`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.headerBg;
  }};
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.headerBorder;
  }};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.sm;
  }};
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const Title = styled.h1`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.headerText;
  }};
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo2 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const UserName = styled.span`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-weight: 500;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const UserRole = styled.span`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textTertiary;
  }};
  font-size: 12px;
  padding: 2px 6px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 4px;
  text-transform: capitalize;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.danger;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};

  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.dangerHover;
    }};
  }
`;

const LayoutContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 80px);
`;

const Sidebar = styled.nav`
  width: 250px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.sidebarBg;
  }};
  border-right: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.sidebarBorder;
  }};
  padding: 2rem 0;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const NavItem = styled.button`
  width: 100%;
  padding: 12px 24px;
  border: none;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return props.active ? theme.colors.sidebarActive : 'transparent';
  }};
  border-right: ${props => {
    const theme = getTheme(props.$theme);
    return props.active ? `3px solid ${theme.colors.primary}` : '3px solid transparent';
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return props.active ? theme.colors.sidebarActiveText : theme.colors.sidebarText;
  }};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};

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
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.background;
  }};
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const WelcomeCard = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: ${props => {
    const theme = getTheme(props.$theme);
    return theme.borderRadiusLg;
  }};
  padding: 2rem;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.md;
  }};
  text-align: center;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const WelcomeTitle = styled.h2`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  margin-bottom: 1rem;
  font-size: 32px;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const WelcomeText = styled.p`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 18px;
  margin-bottom: 2rem;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const ComingSoonContainer = styled.div`
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const ComingSoonCard = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: ${props => {
    const theme = getTheme(props.$theme);
    return theme.borderRadiusLg;
  }};
  padding: 3rem;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.md;
  }};
  text-align: center;
  max-width: 500px;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const ComingSoonBadge = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1.5rem;
  font-size: 14px;
`;

// Componente ComingSoon temático
const ComingSoon = ({ title, description, icon: Icon }) => {
  const { theme } = useTheme();
  const currentTheme = getTheme(theme);
  
  return (
    <ComingSoonContainer>
      <ComingSoonCard $theme={theme}>
        {Icon && <Icon size={64} color={currentTheme.colors.primary} style={{ marginBottom: '1rem' }} />}
        <h2 style={{ color: currentTheme.colors.textPrimary, marginBottom: '1rem' }}>{title}</h2>
        <p style={{ color: currentTheme.colors.textSecondary, marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {description}
        </p>
        <ComingSoonBadge>
          🚧 Próximamente Disponible
        </ComingSoonBadge>
        <p style={{ color: currentTheme.colors.textTertiary, fontSize: '14px', marginTop: '1rem' }}>
          Este módulo está en desarrollo y estará disponible en futuras actualizaciones.
        </p>
      </ComingSoonCard>
    </ComingSoonContainer>
  );
};

// Styled component para la sección de permisos
const PermissionsSection = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return props.$userRole === 'admin' 
      ? theme.name === 'dark' ? '#1e3a8a' : '#dbeafe'
      : props.$userRole === 'editor' 
      ? theme.name === 'dark' ? '#064e3b' : '#d1fae5'
      : theme.name === 'dark' ? '#374151' : '#f3f4f6';
  }};
  padding: 1rem;
  border-radius: ${props => {
    const theme = getTheme(props.$theme);
    return theme.borderRadius;
  }};
  margin-bottom: 2rem;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const SectionTitle = styled.h3`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  margin-bottom: 1rem;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const PermissionsTitle = styled.h4`
  margin: 0;
  margin-bottom: 0.5rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const ModulesList = styled.ul`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  padding-left: 1.2rem;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

// Componente Home temático
const Home = ({ user }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{ padding: '2rem' }}>
      <WelcomeCard $theme={theme}>
        <WelcomeTitle $theme={theme}>¡Bienvenido al Dashboard, {user?.fullName || user?.username}!</WelcomeTitle>
        <WelcomeText $theme={theme}>
          Shadow Docket - Sistema completo de gestión con control de acceso basado en roles.
        </WelcomeText>
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <SectionTitle $theme={theme}>Tu rol: {user?.role}</SectionTitle>
          <PermissionsSection $theme={theme} $userRole={user?.role}>
            <PermissionsTitle $theme={theme}>Permisos disponibles:</PermissionsTitle>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {user?.role === 'admin' && (
                <>
                  <li>Enviar invitaciones por correo a nuevos usuarios</li>
                  <li>Gestionar cuentas y roles de usuarios</li>
                  <li>Crear, editar y eliminar todos los registros</li>
                  <li>Acceso completo a todas las funciones del sistema</li>
                  <li>Configuración del sistema</li>
                </>
              )}
              {user?.role === 'editor' && (
                <>
                  <li>Crear, editar y eliminar registros</li>
                  <li>Subir y gestionar documentos</li>
                  <li>Acceso a la mayoría de funciones del sistema</li>
                </>
              )}
              {user?.role === 'viewer' && (
                <>
                  <li>Ver registros y datos</li>
                  <li>Buscar y filtrar información</li>
                  <li>Acceso a funciones de solo lectura</li>
                </>
              )}
            </ul>
          </PermissionsSection>
          <SectionTitle $theme={theme}>Módulos Disponibles:</SectionTitle>
          <ModulesList $theme={theme}>
            <li>🏠 <strong>Dashboard Principal:</strong> Visión general del sistema</li>
            <li>📁 <strong>Gestión de Sectores:</strong> Organiza información en estructura jerárquica</li>
            <li>👤 <strong>Gestión de Indiciados:</strong> Registro y seguimiento de personas investigadas</li>
            {(user?.role === 'admin' || user?.role === 'editor') && (
              <li>🗃️ <strong>Base de Datos:</strong> Acceso directo a información almacenada</li>
            )}
            {user?.role === 'admin' && (
              <>
                <li>👥 <strong>Gestión de Usuarios:</strong> Administrar cuentas y permisos</li>
                <li>✉️ <strong>Gestión de Invitaciones:</strong> Invitar nuevos usuarios al sistema</li>
              </>
            )}
          </ModulesList>
        </div>
      </WelcomeCard>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Inicio', exact: true },
    { 
      path: '/dashboard/sectores', 
      icon: Folder, 
      label: 'Gestión de Sectores',
      allowedRoles: ['admin', 'editor', 'viewer']
    },
    /*{ 
      path: '/dashboard/indiciados', 
      icon: User, 
      label: 'Gestión de Indiciados',
      allowedRoles: ['admin', 'editor', 'viewer']
    },
    { 
      path: '/dashboard/documentos', 
      icon: FileText, 
      label: 'Gestión de Documentos',
      allowedRoles: ['admin', 'editor', 'viewer']
    },
    { 
      path: '/dashboard/reportes', 
      icon: BarChart3, 
      label: 'Reportes y Estadísticas',
      allowedRoles: ['admin', 'editor', 'viewer']
    },
    { 
      path: '/dashboard/base-datos', 
      icon: Database, 
      label: 'Base de Datos',
      allowedRoles: ['admin', 'editor']
    }*/
  ];

  // Add admin-only items
  if (user?.role === 'admin') {
    navigationItems.push(
      {
        path: '/dashboard/usuarios',
        icon: Users,
        label: 'Gestión de Usuarios',
        allowedRoles: ['admin']
      },
      {
        path: '/dashboard/invitations',
        icon: Mail,
        label: 'Gestión de Invitaciones',
        allowedRoles: ['admin']
      }
    );
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <DashboardContainer $theme={theme}>
      <Header $theme={theme}>
        <Title $theme={theme}>Shadow Docket</Title>
        <UserInfo>
          <HeaderActions>
            <ThemeToggle size={16} />
            <UserInfo2>
              <UserName $theme={theme}>Hola, {user?.fullName || user?.username}</UserName>
              <UserRole $theme={theme}>
                <Shield size={12} style={{ marginRight: '4px' }} />
                {user?.role}
              </UserRole>
            </UserInfo2>
            <LogoutButton $theme={theme} onClick={logout}>
              <LogOut size={16} />
              Cerrar Sesión
            </LogoutButton>
          </HeaderActions>
        </UserInfo>
      </Header>
      
      <LayoutContainer>
        <Sidebar $theme={theme}>
          {navigationItems
            .filter(item => !item.allowedRoles || item.allowedRoles.includes(user?.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavItem
                  key={item.path}
                  $theme={theme}
                  active={isActive(item)}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon size={18} />
                  {item.label}
                </NavItem>
              );
            })
          }
        </Sidebar>
        
        <Content $theme={theme}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/sectores" element={<EnhancedSectoresManager />} />
            <Route 
              path="/sectores/:sectorId/subsectores/:subsectorId/indiciados/:indiciadoId" 
              element={<IndiciadoDetail />} 
            />
            <Route 
              path="/indiciados" 
              element={
                <ComingSoon 
                  title="Gestión de Indiciados" 
                  description="Módulo para el registro, seguimiento y gestión de personas investigadas en procesos criminalísticos."
                  icon={User}
                />
              } 
            />
            <Route 
              path="/documentos" 
              element={
                <ComingSoon 
                  title="Gestión de Documentos" 
                  description="Sistema de archivos y evidencia documental para casos criminalísticos."
                  icon={FileText}
                />
              } 
            />
            <Route 
              path="/reportes" 
              element={
                <ComingSoon 
                  title="Reportes y Estadísticas" 
                  description="Análisis de datos, métricas del sistema y generación de reportes detallados."
                  icon={BarChart3}
                />
              } 
            />
            {(user?.role === 'admin' || user?.role === 'editor') && (
              <Route 
                path="/base-datos" 
                element={
                  <ComingSoon 
                    title="Base de Datos" 
                    description="Acceso directo a la información almacenada en el sistema criminalístico."
                    icon={Database}
                  />
                } 
              />
            )}
            {user?.role === 'admin' && (
              <>
                <Route path="/usuarios" element={<UserManagement />} />
                <Route path="/invitations" element={<InvitationManager />} />
              </>
            )}
          </Routes>
        </Content>
      </LayoutContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
