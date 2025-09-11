import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, User, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { UserService, User as UserType, UserFormData } from '../services/userService';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../theme/theme';

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

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button<ThemeProps>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  
  &:hover {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
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

const ErrorMessage = styled.div<ThemeProps>`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.danger;
  }};
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
      <Modal $theme={theme}>
        <Header $theme={theme}>
          <Title $theme={theme}>
            <User size={24} />
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
                $theme={theme}
              />
            </FormGroup>

            <FormGroup>
              <Label $theme={theme}>
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
                <ErrorMessage $theme={theme} style={{ fontSize: '0.75rem' }}>
                  El email no se puede modificar por razones de seguridad
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label $theme={theme}>
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
                  $theme={theme}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={submitting}
                  $theme={theme}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordContainer>
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
              {isEditingSelf && (
                <ErrorMessage $theme={theme}>
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
                <CheckboxLabel htmlFor="isActive" $theme={theme}>
                  Usuario activo
                </CheckboxLabel>
              </CheckboxGroup>
              {isEditingSelf && (
                <ErrorMessage $theme={theme}>
                  No puedes desactivar tu propia cuenta
                </ErrorMessage>
              )}
            </FormGroup>

            {errors.length > 0 && (
              <FormGroup>
                {errors.map((error, index) => (
                  <ErrorMessage key={index} $theme={theme}>
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
