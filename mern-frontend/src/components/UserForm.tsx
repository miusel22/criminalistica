import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { X, Save, User as UserIcon, Mail, Lock, Shield } from 'lucide-react';
import { UserService, User as UserType, UserFormData } from '../services/userService';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../theme/theme';
import EnhancedPasswordInput from './ui/EnhancedPasswordInput';
import ValidationMessage from './ui/ValidationMessage';
import { useUserFormValidation } from '../hooks/useUserFormValidation';

// Type definitions for styled components with theme prop
interface ThemeProps {
  $theme?: string;
}

interface UserFormProps {
  user?: UserType | null;
  onSuccess: () => void;
  onCancel: () => void;
  loading?: boolean;
  theme?: string;
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

const Modal = styled.div<ThemeProps>`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border-radius: 12px;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.lg;
  }};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
`;

const Header = styled.div<ThemeProps>`
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2<ThemeProps>`
  margin: 0;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button<ThemeProps>`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  padding: 0.5rem;
  border-radius: 50%;
  
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

const Label = styled.label<ThemeProps>`
  font-weight: 600;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input<ThemeProps>`
  padding: 12px 16px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBorder;
  }};
  border-radius: 8px;
  font-size: 16px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus;
    }};
  }
  
  &:disabled {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.disabled;
    }};
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textSecondary;
    }};
  }
`;

const Select = styled.select<ThemeProps>`
  padding: 12px 16px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBorder;
  }};
  border-radius: 8px;
  font-size: 16px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus;
    }};
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

const CheckboxLabel = styled.label<ThemeProps>`
  font-weight: normal;
  cursor: pointer;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
`;

const StatusMessage = styled.div<ThemeProps & { $type?: 'error' | 'warning' | 'info' }>`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return props.$type === 'warning' 
      ? '#f59e0b' 
      : props.$type === 'info' 
        ? theme.colors.primary 
        : theme.colors.danger;
  }};
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const PrimaryButton = styled(Button)<ThemeProps>`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  
  &:hover:not(:disabled) {
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
  
  &:hover:not(:disabled) {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
  }
`;

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSuccess,
  onCancel,
  loading,
  theme: passedTheme,
  confirmUpdate
}) => {
  // Use passed theme or get from context
  const { theme: contextTheme } = useTheme();
  const theme = passedTheme || contextTheme;
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    role: 'viewer',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  // Estados removidos por no usar en esta implementación
  // Se podrían usar para funcionalidades adicionales en el futuro
  const [serverError, setServerError] = useState<string>('');

  const isEditing = !!user;
  
  // Obtener emails existentes para validación
  const [existingEmails, setExistingEmails] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await UserService.getAllUsers(1, 1000); // Obtener todos los usuarios
        const emails = response.users
          .filter((u: UserType) => !user || u.id !== user.id) // Excluir el usuario actual en edición
          .map((u: UserType) => u.email.toLowerCase());
        setExistingEmails(emails);
      } catch (error) {
        console.error('Error fetching user emails for validation:', error);
      }
    };
    
    fetchEmails();
  }, [user]);

  // Configurar validación
  const validation = useUserFormValidation({
    isEditing,
    existingEmails
  });

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
    
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validar el campo actualizado
    validation.validateField(name as keyof UserFormData, newValue);
    
    // Limpiar errores del servidor cuando el usuario hace cambios
    if (serverError) {
      setServerError('');
    }
  };
  
  // Manejar cambios en la contraseña
  const handlePasswordChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      password: value
    }));
    
    // Validar contraseña
    validation.validateField('password', value);
    
    // Limpiar errores del servidor cuando el usuario hace cambios
    if (serverError) {
      setServerError('');
    }
  }, [validation, serverError]);
  
  // Manejar cambios en la validación de contraseña (placeholder para futuras funcionalidades)
  const handlePasswordValidation = useCallback((_isValid: boolean, _strength: number) => {
    // Funcionalidad disponible para futuras mejoras
  }, []);

  const validateForm = (): boolean => {
    // Usar nuestro hook de validación personalizado
    validation.validateForm(formData);
    return !validation.hasErrors;
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
      setServerError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const currentUser = UserService.getCurrentUser();
  const isEditingSelf = Boolean(user && currentUser && user.id === currentUser.id);

  return (
    <Overlay>
      <Modal $theme={theme}>
        <Header $theme={theme}>
          <Title $theme={theme}>
            <UserIcon size={24} />
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Title>
          <CloseButton onClick={onCancel} $theme={theme}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Body>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label $theme={theme}>
                <UserIcon size={16} />
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
                $theme={theme}
              />
            </FormGroup>

            <FormGroup>
              <Label $theme={theme}>
                <UserIcon size={16} />
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
                $theme={theme}
              />
            </FormGroup>

            <FormGroup>
              <Label $theme={theme}>
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
                $theme={theme}
              />
              {isEditing && (
                <StatusMessage $theme={theme} $type="info" style={{ fontSize: '0.75rem' }}>
                  El email no se puede modificar por razones de seguridad
                </StatusMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label $theme={theme}>
                <Lock size={16} />
                {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
              </Label>
              <EnhancedPasswordInput
                value={formData.password}
                onChange={handlePasswordChange}
                required={!isEditing}
                disabled={submitting}
                isEditing={isEditing}
                showStrengthMeter={true}
                showGenerator={true}
                showValidation={true}
                onValidationChange={handlePasswordValidation}
              />
            </FormGroup>

            <FormGroup>
              <Label $theme={theme}>
                <Shield size={16} />
                Rol
              </Label>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={Boolean(submitting || isEditingSelf)} // Can't change own role
                $theme={theme}
              >
                <option value="viewer">Visualizador</option>
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </Select>
              {isEditing && isEditingSelf && (
                <StatusMessage $theme={theme} $type="info">
                  No puedes cambiar tu propio rol
                </StatusMessage>
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
                <CheckboxLabel htmlFor="isActive" $theme={theme}>
                  Usuario activo
                </CheckboxLabel>
              </CheckboxGroup>
              {isEditingSelf && (
                <StatusMessage $theme={theme} $type="info">
                  No puedes desactivar tu propia cuenta
                </StatusMessage>
              )}
            </FormGroup>

            {(validation.errors.length > 0 || serverError) && (
              <FormGroup>
                <ValidationMessage 
                  errors={[
                    ...validation.errors,
                    ...(serverError ? [{
                      field: 'form',
                      message: serverError,
                      severity: 'error' as const
                    }] : [])
                  ]}
                />
              </FormGroup>
            )}
          </Form>
        </Body>

        <Footer>
          <SecondaryButton
            type="button"
            onClick={onCancel}
            disabled={submitting}
            $theme={theme}
          >
            Cancelar
          </SecondaryButton>
          
          <PrimaryButton
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            $theme={theme}
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
