import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, UserPlus, Eye, RefreshCw, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
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
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const Button = styled.button`
  background: ${props => props.variant === 'danger' ? '#dc3545' : '#007bff'};
  color: white;
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
    background: ${props => props.variant === 'danger' ? '#c82333' : '#0056b3'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &.error {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
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
  border-bottom: 2px solid #e1e5e9;
  font-weight: 600;
  color: #333;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'used': return '#d1edff';
      case 'expired': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'used': return '#0c5460';
      case 'expired': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const RoleBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.role) {
      case 'admin': return '#d1ecf1';
      case 'editor': return '#d4edda';
      case 'viewer': return '#e2e3e5';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.role) {
      case 'admin': return '#0c5460';
      case 'editor': return '#155724';
      case 'viewer': return '#383d41';
      default: return '#495057';
    }
  }};
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button`
  background: ${props => {
    switch (props.variant) {
      case 'danger': return '#dc3545';
      case 'secondary': return '#6c757d';
      default: return '#007bff';
    }
  }};
  color: white;
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
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer'
  });
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState({ status: 'all', role: 'all' });

  // All hooks must be called before any early returns
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchInvitations();
    }
  }, [filter, user]);

  // Check if user is administrator
  if (!user || user.role !== 'admin') {
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <AlertCircle size={48} color="#dc3545" style={{ marginBottom: '1rem' }} />
            <h2>Acceso Denegado</h2>
            <p>Solo los administradores pueden acceder a esta sección.</p>
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
      await axios.post('/invitations/send', formData);
      toast.success('Invitación enviada exitosamente');
      setFormData({ email: '', role: 'viewer' });
      fetchInvitations();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al enviar la invitación';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (invitationId) => {
    try {
      await axios.post(`/invitations/resend/${invitationId}`);
      toast.success('Invitación reenviada');
      fetchInvitations();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al reenviar invitación';
      toast.error(message);
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
    <Container>
      <Header>
        <Title>Gestión de Invitaciones</Title>
        <Button onClick={fetchInvitations} disabled={loading}>
          <RefreshCw size={16} />
          Actualizar
        </Button>
      </Header>

      {/* Send Invitation Form */}
      <Card>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Enviar Nueva Invitación</h3>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label>Rol</Label>
            <Select
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

          <Button type="submit" disabled={loading}>
            <UserPlus size={16} />
            {loading ? 'Enviando...' : 'Enviar Invitación'}
          </Button>
        </Form>
      </Card>

      {/* Filters */}
      <Card>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Filtros</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <InputGroup style={{ minWidth: '150px' }}>
            <Label>Estado</Label>
            <Select
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
            <Label>Rol</Label>
            <Select
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
      <Card>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>
          Invitaciones ({invitations.length})
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Cargando invitaciones...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No hay invitaciones que mostrar</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <Th>Email</Th>
                  <Th>Rol</Th>
                  <Th>Estado</Th>
                  <Th>Código</Th>
                  <Th>Creada</Th>
                  <Th>Expira</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => {
                  const status = getInvitationStatus(invitation);
                  return (
                    <tr key={invitation.id}>
                      <Td>{invitation.email}</Td>
                      <Td>
                        <RoleBadge role={invitation.role}>
                          {invitation.role}
                        </RoleBadge>
                      </Td>
                      <Td>
                        <StatusBadge status={status}>
                          {status === 'pending' && <Clock size={12} style={{ marginRight: '4px' }} />}
                          {status === 'used' && <CheckCircle size={12} style={{ marginRight: '4px' }} />}
                          {status === 'expired' && <AlertCircle size={12} style={{ marginRight: '4px' }} />}
                          {status === 'pending' ? 'Pendiente' : status === 'used' ? 'Usada' : 'Expirada'}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <code style={{ 
                          background: '#f8f9fa', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {invitation.code}
                        </code>
                      </Td>
                      <Td>{formatDate(invitation.createdAt)}</Td>
                      <Td>{formatDate(invitation.expiresAt)}</Td>
                      <Td>
                        <ActionButtons>
                          {status === 'pending' && (
                            <>
                              <SmallButton
                                onClick={() => handleResend(invitation.id)}
                                title="Reenviar invitación"
                              >
                                <Mail size={12} />
                                Reenviar
                              </SmallButton>
                              <SmallButton
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
                            <SmallButton variant="secondary" disabled>
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
