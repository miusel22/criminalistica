import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Lock, Shield } from 'lucide-react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2d2d2d 100%);
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: rgba(10, 10, 10, 0.95);
  border-radius: 20px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  min-height: 700px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 400px;
    background: rgba(5, 5, 5, 0.98);
  }
`;

const ImageSection = styled.div`
  background: url('/assets/detective-board.jpg') center/cover;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg, 
      rgba(0, 0, 0, 0.3) 0%, 
      rgba(0, 0, 0, 0.1) 50%, 
      rgba(0, 0, 0, 0.4) 100%
    );
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const FormSection = styled.div`
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background: rgba(15, 15, 15, 0.8);

  @media (max-width: 768px) {
    padding: 50px 40px;
    background: transparent;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  gap: 15px;
`;

const LogoText = styled.div`
  font-size: 32px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -1px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const LogoIcon = styled.div`
  color: #ffffff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
`;

const Title = styled.h1`
  text-align: center;
  color: #ffffff;
  margin-bottom: 10px;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const Subtitle = styled.p`
  text-align: center;
  color: #cccccc;
  margin-bottom: 50px;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 18px 55px 18px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 16px;
  color: #ffffff;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 0 0 3px rgba(255, 255, 255, 0.1),
      0 8px 25px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }

  &.error {
    border-color: #ff4757;
    box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.2);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: color 0.3s ease;

  &:hover {
    color: ${props => props.clickable ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'};
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.1);
  padding: 18px 25px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 15px 35px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);

    &::before {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4757;
  font-size: 14px;
  margin-top: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 500;
  
  &.general {
    text-align: center;
    margin-bottom: 20px;
    padding: 12px;
    background-color: rgba(255, 71, 87, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 71, 87, 0.3);
    backdrop-filter: blur(10px);
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 30px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;

  a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
    border-bottom: 1px solid transparent;
    transition: all 0.3s ease;

    &:hover {
      border-bottom-color: #ffffff;
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    }
  }

  small {
    color: rgba(255, 255, 255, 0.4) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    // Clear any previous errors
    setErrors({});

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      } else if (result.error) {
        // Handle specific login errors
        handleLoginError(result.error, result.errorType, result.errorData);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback error handling
      setErrors({
        general: 'Error inesperado. Por favor, inténtalo de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (errorMessage, errorType, errorData) => {
    // Handle different types of errors based on errorType
    switch (errorType) {
      case 'credentials':
        setErrors({
          email: '🚫 Credenciales incorrectas',
          password: 'Usuario o contraseña incorrectos'
        });
        break;
      case 'validation':
        // Handle specific validation errors
        if (errorData?.details) {
          const validationErrors = {};
          errorData.details.forEach(detail => {
            if (detail.path === 'email') {
              validationErrors.email = 'El email es requerido';
            } else if (detail.path === 'password') {
              validationErrors.password = 'La contraseña es requerida';
            }
          });
          setErrors(validationErrors);
        } else {
          setErrors({
            general: '⚠️ Por favor, complete todos los campos requeridos.'
          });
        }
        break;
      case 'server':
        setErrors({
          general: '😕 Error del servidor. Por favor, inténtalo más tarde.'
        });
        break;
      case 'network':
        setErrors({
          general: '🌐 Error de conexión. Verifica tu conexión a internet.'
        });
        break;
      case 'auth':
        setErrors({
          general: '🔒 ' + errorMessage
        });
        break;
      default:
        // Generic error
        setErrors({
          general: errorMessage || '❌ Error al iniciar sesión. Inténtalo de nuevo.'
        });
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <ImageSection />
        <FormSection>
          <LogoContainer>
            <LogoIcon>
              <Shield size={40} />
            </LogoIcon>
            <LogoText>Shadow Docket</LogoText>
          </LogoContainer>
          <Title>Acceso al Sistema</Title>
          <Subtitle>Inicia sesión para acceder a los archivos clasificados</Subtitle>
          
          <Form onSubmit={handleSubmit}>
            {errors.general && (
              <ErrorMessage className="general">
                {errors.general}
              </ErrorMessage>
            )}
            
            <InputGroup>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              <InputIcon>
                <User size={20} />
              </InputIcon>
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </InputGroup>

            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              <InputIcon 
                clickable 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </InputIcon>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </InputGroup>

            <Button type="submit" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Form>

          <RegisterLink>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link> <br/>
            <small style={{color: '#999', fontSize: '12px'}}>Necesitarás un código de invitación</small>
          </RegisterLink>
        </FormSection>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
