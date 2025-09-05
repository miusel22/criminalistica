import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, UserCheck, Key } from 'lucide-react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

// Keyframe for spinner animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 60px 40px;
  width: 100%;
  max-width: 450px;

  @media (max-width: 768px) {
    padding: 40px 30px;
    max-width: 350px;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  font-size: 16px;
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
  padding: 15px 50px 15px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &.error {
    border-color: #e53e3e;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 14px;
  margin-top: 5px;
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #666;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #007bff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Register = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    invitationCode: searchParams.get('code') || '',
    username: '',
    email: searchParams.get('email') || '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [invitationInfo, setInvitationInfo] = useState(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate invitation code when component loads or code changes
  useEffect(() => {
    if (formData.invitationCode && formData.invitationCode.length >= 16) {
      validateInvitationCode(formData.invitationCode);
    } else if (formData.invitationCode.length === 0) {
      // Reset validation state when code is cleared
      setInvitationInfo(null);
      setCodeValidated(false);
      setFormData(prev => ({ ...prev, email: '' })); // Clear email when code is cleared
      setErrors(prev => ({ ...prev, invitationCode: '', email: '' }));
    }
  }, [formData.invitationCode]);

  const validateInvitationCode = async (code) => {
    if (!code) return;
    
    setValidatingCode(true);
    setCodeValidated(false);
    try {
      const response = await axios.get(`/invitations/validate/${code}`);
      setInvitationInfo(response.data.invitation);
      setCodeValidated(true);
      
      // Always load the email from the invitation and lock it
      setFormData(prev => ({
        ...prev,
        email: response.data.invitation.email
      }));
      
      setErrors(prev => ({ ...prev, invitationCode: '', email: '' }));
    } catch (error) {
      setInvitationInfo(null);
      setCodeValidated(false);
      setErrors(prev => ({
        ...prev,
        invitationCode: error.response?.data?.message || 'Código de invitación inválido'
      }));
    } finally {
      setValidatingCode(false);
    }
  };

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

    if (!formData.invitationCode.trim()) {
      newErrors.invitationCode = 'El código de invitación es requerido';
    } else if (!invitationInfo) {
      newErrors.invitationCode = 'Código de invitación inválido o expirado';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    } else if (invitationInfo && formData.email !== invitationInfo.email) {
      newErrors.email = 'El email debe coincidir con el de la invitación';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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

    try {
      const result = await register({
        invitationCode: formData.invitationCode,
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password
      });
      
      if (result.success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Title>Crear Cuenta</Title>
        <Subtitle>
          {invitationInfo ? 
            `✅ Código válido - Te registrarás como ${invitationInfo.role}` : 
            'Ingresa tu código de invitación para crear una cuenta'
          }
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="text"
              name="invitationCode"
              placeholder="Ingresa tu código de invitación (ej: A1B2C3D4E5F6G7H8)"
              value={formData.invitationCode}
              onChange={handleChange}
              className={errors.invitationCode ? 'error' : (codeValidated ? 'success' : '')}
              disabled={validatingCode}
              style={{
                borderColor: codeValidated ? '#28a745' : (errors.invitationCode ? '#dc3545' : '#e1e5e9')
              }}
            />
            <InputIcon>
              <Key size={20} color={codeValidated ? '#28a745' : '#999'} />
            </InputIcon>
            {validatingCode && (
              <div style={{color: '#007bff', fontSize: '14px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Spinner />
                Validando código...
              </div>
            )}
            {errors.invitationCode && <ErrorMessage>{errors.invitationCode}</ErrorMessage>}
            {invitationInfo && (
              <div style={{color: '#28a745', fontSize: '14px', marginTop: '5px'}}>
                ✅ Código válido - Te registrarás como <strong>{invitationInfo.role}</strong>
                <br/>
                <span style={{color: '#666', fontSize: '12px'}}>
                  Email del código: {invitationInfo.email}
                </span>
              </div>
            )}
          </InputGroup>

          <InputGroup>
            <Input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
            />
            <InputIcon>
              <User size={20} />
            </InputIcon>
            {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Input
              type="email"
              name="email"
              placeholder={invitationInfo ? "Email cargado desde la invitación" : "Email"}
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              disabled={!!invitationInfo}
              style={{
                backgroundColor: invitationInfo ? '#f8f9fa' : 'white',
                cursor: invitationInfo ? 'not-allowed' : 'text'
              }}
            />
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Input
              type="text"
              name="fullName"
              placeholder="Nombre completo (opcional)"
              value={formData.fullName}
              onChange={handleChange}
            />
            <InputIcon>
              <UserCheck size={20} />
            </InputIcon>
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

          <InputGroup>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            <InputIcon 
              clickable 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </InputIcon>
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </Form>

        <LoginLink>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
