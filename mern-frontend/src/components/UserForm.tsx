import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, User, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { UserService, User as UserType, UserFormData } from '../services/userService';

interface UserFormProps {
  user?: UserType | null;
  onSuccess: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmUpdate?: (user: UserType | null, changes: any) => Promise<boolean>;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  
  &:hover {
    background: #f8f9fa;
    color: #333;
  }
`;

const Body = styled.div`
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
`;

const CheckboxLabel = styled.label`
  font-weight: normal;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const Footer = styled.div`
  padding: 1rem 2rem 2rem 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: #007bff;
  color: white;
  
  &:hover:not(:disabled) {
    background: #0056b3;
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  color: white;
  
  &:hover:not(:disabled) {
    background: #545b62;
  }
`;

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSuccess,
  onCancel,
  loading,
  confirmUpdate
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    role: 'viewer',
    isActive: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      // Extraer nombre y apellidos del fullName para PostgreSQL
      const fullName = user.fullName || '';
      const nameParts = fullName.split(' ');
      const nombre = nameParts[0] || '';
      const apellidos = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        nombre,
        apellidos,
        email: user.email,
        password: '', // Password is always empty when editing
        role: user.role,
        isActive: user.isActive
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];

    // Required fields
    if (!formData.nombre.trim()) {
      validationErrors.push('El nombre es requerido');
    }

    if (!formData.apellidos.trim()) {
      validationErrors.push('Los apellidos son requeridos');
    }

    if (!formData.email.trim()) {
      validationErrors.push('El email es requerido');
    }

    // Password is required only when creating new user
    if (!isEditing && !formData.password) {
      validationErrors.push('La contraseña es requerida');
    }

    // Use service validation for more detailed checks
    const serviceErrors = UserService.validateUserData(formData);
    validationErrors.push(...serviceErrors);

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos de actualización
    const updateData: any = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      email: formData.email,
      role: formData.role,
      isActive: formData.isActive
    };
    
    // Solo incluir contraseña si se proporciona
    if (formData.password) {
      updateData.password = formData.password;
    }

    // Solicitar confirmación si está disponible
    if (confirmUpdate) {
      const confirmed = await confirmUpdate(user || null, updateData);
      if (!confirmed) {
        return; // Usuario canceló
      }
    }

    setSubmitting(true);
    
    try {
      if (isEditing) {
        await UserService.updateUser(user!.id, updateData);
      } else {
        await UserService.createUser(formData);
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.msg || error.message || 'Error desconocido';
      setErrors([errorMessage]);
    } finally {
      setSubmitting(false);
    }
  };

  const currentUser = UserService.getCurrentUser();
  const isEditingSelf = Boolean(user && currentUser && user.id === currentUser.id);

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>
            <User size={24} />
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Title>
          <CloseButton onClick={onCancel}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Body>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>
                <User size={16} />
                Nombre
              </Label>
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingresa el nombre"
                required
                disabled={submitting}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <User size={16} />
                Apellidos
              </Label>
              <Input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                placeholder="Ingresa los apellidos"
                required
                disabled={submitting}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Mail size={16} />
                Email
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="usuario@ejemplo.com"
                required
                disabled={submitting || isEditing}
              />
              {isEditing && (
                <ErrorMessage style={{ color: '#666', fontSize: '0.75rem' }}>
                  El email no se puede modificar por razones de seguridad
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                <Lock size={16} />
                {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              </Label>
              <PasswordContainer>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isEditing ? 'Dejar en blanco para mantener actual' : 'Ingresa la contraseña'}
                  required={!isEditing}
                  disabled={submitting}
                  style={{ paddingRight: '48px' }}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordContainer>
            </FormGroup>

            <FormGroup>
              <Label>
                <Shield size={16} />
                Rol
              </Label>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={Boolean(submitting || isEditingSelf)} // Can't change own role
              >
                <option value="viewer">Visualizador</option>
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </Select>
              {isEditingSelf && (
                <ErrorMessage>
                  No puedes cambiar tu propio rol
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={Boolean(submitting || isEditingSelf)} // Can't deactivate own account
                />
                <CheckboxLabel htmlFor="isActive">
                  Usuario activo
                </CheckboxLabel>
              </CheckboxGroup>
              {isEditingSelf && (
                <ErrorMessage>
                  No puedes desactivar tu propia cuenta
                </ErrorMessage>
              )}
            </FormGroup>

            {errors.length > 0 && (
              <FormGroup>
                {errors.map((error, index) => (
                  <ErrorMessage key={index}>
                    {error}
                  </ErrorMessage>
                ))}
              </FormGroup>
            )}
          </Form>
        </Body>

        <Footer>
          <SecondaryButton
            type="button"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </SecondaryButton>
          
          <PrimaryButton
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Save size={16} />
            {submitting 
              ? 'Guardando...' 
              : (isEditing ? 'Actualizar' : 'Crear Usuario')
            }
          </PrimaryButton>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default UserForm;
