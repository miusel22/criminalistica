import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, UserPlus, Eye, RefreshCw, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme/theme';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ $theme }) => getTheme($theme).colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const Button = styled.button`
  background: ${props => {
    if (props.variant === 'danger') return getTheme(props.$theme).colors.danger;
    return getTheme(props.$theme).colors.primary;
  }};
  color: ${({ $theme }) => getTheme($theme).colors.textInverse};
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => {
      if (props.variant === 'danger') return getTheme(props.$theme).colors.dangerHover;
      return getTheme(props.$theme).colors.primaryHover;
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: ${({ $theme }) => $theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ $theme }) => getTheme($theme).colors.primary};
  }

  &.error {
    border-color: ${({ $theme }) => getTheme($theme).colors.danger};
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ $theme }) => getTheme($theme).colors.primary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid ${({ $theme }) => getTheme($theme).colors.border};
  font-weight: 600;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  vertical-align: middle;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
`;

const StatusBadge = styled.span`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    switch (props.status) {
      case 'pending': return theme.colors.warning;
      case 'used': return theme.colors.success;
      case 'expired': return theme.colors.danger;
      default: return theme.colors.backgroundSecondary;
    }
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    switch (props.status) {
      case 'pending': 
      case 'used': 
      case 'expired': return theme.colors.textInverse;
      default: return theme.colors.textPrimary;
    }
  }};
`;

const RoleBadge = styled.span`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
  display: inline-block;
  background: ${props => {
    const theme = getTheme(props.$theme);
    switch (props.role) {
      case 'admin': return theme.colors.primary;
      case 'editor': return theme.colors.success;
      case 'viewer': return theme.colors.backgroundSecondary;
      default: return theme.colors.backgroundSecondary;
    }
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    switch (props.role) {
      case 'admin': 
      case 'editor': return theme.colors.textInverse;
      case 'viewer': 
      default: return theme.colors.textPrimary;
    }
  }};
`;

const ErrorMessage = styled.div`
  color: ${({ $theme }) => getTheme($theme).colors.danger};
  font-size: 12px;
  margin-top: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button`
  background: ${props => {
    const theme = getTheme(props.$theme);
    switch (props.variant) {
      case 'danger': return theme.colors.danger;
      case 'secondary': return theme.colors.backgroundSecondary;
      default: return theme.colors.primary;
    }
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return props.variant === 'secondary' ? theme.colors.textPrimary : theme.colors.textInverse;
  }};
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InvitationManager = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer'
  });
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState({ status: 'all', role: 'all' });
  const [processingInvitations, setProcessingInvitations] = useState(new Set());

  // All hooks must be called before any early returns
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchInvitations();
    }
  }, [filter, user]);

  // Check if user is administrator
  if (!user || user.role !== 'admin') {
    return (
      <Container $theme={theme}>
        <Card $theme={theme}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={48} color={getTheme(theme).colors.danger} style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: getTheme(theme).colors.textPrimary }}>Acceso Denegado</h2>
            <p style={{ color: getTheme(theme).colors.textSecondary }}>Solo los administradores pueden acceder a esta sección.</p>
          </div>
        </Card>
      </Container>
    );
  }

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.role !== 'all') params.append('role', filter.role);
      
      const response = await axios.get(`/invitations?${params}`);
      setInvitations(response.data.invitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Error al cargar las invitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post('/invitations/send', formData);
      
      // Show success message with additional context if available
      const successMessage = response.data?.message || 'Invitación enviada exitosamente';
      toast.success(successMessage, {
        duration: 4000,
        id: 'invitation-sent'
      });
      
      // Show additional info if it was a replacement invitation
      if (response.data?.previousInvitations) {
        const { total, expired } = response.data.previousInvitations;
        toast.success(
          `🔄 Se reemplazaron ${expired} invitación${expired > 1 ? 'es' : ''} expirada${expired > 1 ? 's' : ''} anterior${expired > 1 ? 'es' : ''}`,
          {
            duration: 4000,
            id: 'invitation-replacement'
          }
        );
      }
      
      setFormData({ email: '', role: 'viewer' });
      fetchInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error.response?.data);
      
      const errorData = error.response?.data;
      const statusCode = error.response?.status;
      
      // Handle different types of errors with specific messages
      if (statusCode === 400) {
        if (errorData?.error === 'User already exists') {
          toast.error('🙅‍♂️ Este usuario ya existe en el sistema. No es necesario enviar una invitación.', {
            duration: 6000,
            id: 'user-already-exists'
          });
        } else if (errorData?.error === 'User already invited') {
          toast.error(
            '📫 Este email ya fue usado para crear una cuenta. El usuario ya está en el sistema.',
            {
              duration: 6000,
              id: 'user-already-invited'
            }
          );
          if (errorData?.suggestion) {
            toast.success(
              `💡 ${errorData.suggestion}`,
              {
                duration: 4000,
                id: 'suggestion-check-users'
              }
            );
          }
        } else if (errorData?.error === 'Invitation already exists') {
          const invitation = errorData?.invitation;
          const expireDate = invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString('es-ES') : 'fecha desconocida';
          toast.error(
            `⚠️ Ya existe una invitación pendiente para este email que expira el ${expireDate}`,
            {
              duration: 6000,
              id: 'invitation-already-exists'
            }
          );
          if (errorData?.suggestion) {
            toast.success(
              `💡 ${errorData.suggestion}`,
              {
                duration: 4000,
                id: 'suggestion-resend'
              }
            );
          }
        } else {
          // Generic validation error
          const message = errorData?.message || 'Error de validación';
          toast.error(message, {
            duration: 5000,
            id: 'validation-error'
          });
        }
        
        // Refresh invitations to show current state
        fetchInvitations();
      } else {
        // Server error or other issues
        const message = errorData?.message || 'Error del servidor al enviar la invitación';
        toast.error(message, {
          duration: 6000,
          id: 'server-error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (invitationId) => {
    try {
      setProcessingInvitations(prev => new Set(prev).add(invitationId));
      await axios.post(`/invitations/resend/${invitationId}`);
      toast.success('Invitación reenviada');
      fetchInvitations();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al reenviar invitación';
      toast.error(message);
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
  };

  const handleRevoke = async (invitationId) => {
    if (!window.confirm('¿Estás seguro de que quieres revocar esta invitación?')) {
      return;
    }

    try {
      await axios.delete(`/invitations/${invitationId}`);
      toast.success('Invitación revocada');
      fetchInvitations();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al revocar invitación';
      toast.error(message);
    }
  };

  const getInvitationStatus = (invitation) => {
    if (invitation.isUsed) return 'used';
    if (new Date(invitation.expiresAt) <= new Date()) return 'expired';
    return 'pending';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container $theme={theme}>
      <Header $theme={theme}>
        <Title $theme={theme}>Gestión de Invitaciones</Title>
        <Button $theme={theme} onClick={fetchInvitations} disabled={loading}>
          <RefreshCw size={16} />
          Actualizar
        </Button>
      </Header>

      {/* Send Invitation Form */}
      <Card $theme={theme}>
        <h3 style={{ marginBottom: '1rem', color: getTheme(theme).colors.textPrimary }}>Enviar Nueva Invitación</h3>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label $theme={theme}>Email</Label>
            <Input
              $theme={theme}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <ErrorMessage $theme={theme}>{errors.email}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label $theme={theme}>Rol</Label>
            <Select
              $theme={theme}
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrator</option>
            </Select>
          </InputGroup>

          <div></div>

          <Button $theme={theme} type="submit" disabled={loading}>
            <UserPlus size={16} />
            {loading ? 'Enviando...' : 'Enviar Invitación'}
          </Button>
        </Form>
      </Card>

      {/* Filters */}
      <Card $theme={theme}>
        <h3 style={{ marginBottom: '1rem', color: getTheme(theme).colors.textPrimary }}>Filtros</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <InputGroup style={{ minWidth: '150px' }}>
            <Label $theme={theme}>Estado</Label>
            <Select
              $theme={theme}
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="used">Usadas</option>
              <option value="expired">Expiradas</option>
            </Select>
          </InputGroup>

          <InputGroup style={{ minWidth: '150px' }}>
            <Label $theme={theme}>Rol</Label>
            <Select
              $theme={theme}
              value={filter.role}
              onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="all">Todos</option>
              <option value="admin">Administrator</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </Select>
          </InputGroup>
        </div>
      </Card>

      {/* Invitations List */}
      <Card $theme={theme}>
        <h3 style={{ marginBottom: '1rem', color: getTheme(theme).colors.textPrimary }}>
          Invitaciones ({invitations.length})
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: getTheme(theme).colors.textSecondary }} />
            <p style={{ color: getTheme(theme).colors.textSecondary }}>Cargando invitaciones...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: getTheme(theme).colors.textSecondary }}>
            <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No hay invitaciones que mostrar</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <Th $theme={theme}>Email</Th>
                  <Th $theme={theme}>Rol</Th>
                  <Th $theme={theme}>Estado</Th>
                  <Th $theme={theme}>Código</Th>
                  <Th $theme={theme}>Creada</Th>
                  <Th $theme={theme}>Expira</Th>
                  <Th $theme={theme}>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => {
                  const status = getInvitationStatus(invitation);
                  return (
                    <tr key={invitation.id}>
                      <Td $theme={theme}>{invitation.email}</Td>
                      <Td $theme={theme}>
                        <RoleBadge $theme={theme} role={invitation.role}>
                          {invitation.role}
                        </RoleBadge>
                      </Td>
                      <Td $theme={theme}>
                        <StatusBadge $theme={theme} status={status}>
                          {status === 'pending' && <Clock size={12} style={{ marginRight: '4px' }} />}
                          {status === 'used' && <CheckCircle size={12} style={{ marginRight: '4px' }} />}
                          {status === 'expired' && <AlertCircle size={12} style={{ marginRight: '4px' }} />}
                          {status === 'pending' ? 'Pendiente' : status === 'used' ? 'Usada' : 'Expirada'}
                        </StatusBadge>
                      </Td>
                      <Td $theme={theme}>
                        <code style={{ 
                          background: getTheme(theme).colors.backgroundSecondary, 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: getTheme(theme).colors.textPrimary
                        }}>
                          {invitation.code}
                        </code>
                      </Td>
                      <Td $theme={theme}>{formatDate(invitation.createdAt)}</Td>
                      <Td $theme={theme}>{formatDate(invitation.expiresAt)}</Td>
                      <Td $theme={theme}>
                        <ActionButtons>
                          {status === 'pending' && (
                            <>
                              <SmallButton
                                $theme={theme}
                                onClick={() => handleResend(invitation.id)}
                                title="Reenviar invitación"
                                disabled={processingInvitations.has(invitation.id)}
                              >
                                {processingInvitations.has(invitation.id) ? (
                                  <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  <Mail size={12} />
                                )}
                                {processingInvitations.has(invitation.id) ? 'Enviando...' : 'Reenviar'}
                              </SmallButton>
                              <SmallButton
                                $theme={theme}
                                variant="danger"
                                onClick={() => handleRevoke(invitation.id)}
                                title="Revocar invitación"
                              >
                                <Trash2 size={12} />
                                Revocar
                              </SmallButton>
                            </>
                          )}
                          {status !== 'pending' && (
                            <SmallButton $theme={theme} variant="secondary" disabled>
                              <Eye size={12} />
                              Ver
                            </SmallButton>
                          )}
                        </ActionButtons>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default InvitationManager;
