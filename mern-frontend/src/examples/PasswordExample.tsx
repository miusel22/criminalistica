import React, { useState } from 'react';
import styled from 'styled-components';
import EnhancedPasswordInput from '../components/ui/EnhancedPasswordInput';
import ValidationMessage from '../components/ui/ValidationMessage';
import { useUserFormValidation } from '../hooks/useUserFormValidation';

const Container = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
`;

const Button = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const Stats = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Ejemplo de uso de los componentes mejorados
const PasswordExample: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [strength, setStrength] = useState(0);
  const [showDemo, setShowDemo] = useState<'new' | 'edit'>('new');

  // Hook de validación
  const validation = useUserFormValidation({
    isEditing: showDemo === 'edit',
    existingEmails: ['test@example.com', 'admin@test.com']
  });

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Validar en tiempo real
    validation.validateField('password', value);
  };

  const handlePasswordValidation = (isValid: boolean, strengthValue: number) => {
    setIsPasswordValid(isValid);
    setStrength(strengthValue);
  };

  const demoPasswords = [
    { label: 'Débil', value: '123456' },
    { label: 'Media', value: 'Password123' },
    { label: 'Fuerte', value: 'MyS3cur3P@ssw0rd!' },
    { label: 'Muy débil', value: 'abc' },
  ];

  return (
    <Container>
      <Title>
        🔐 Ejemplo: Campo de Contraseña Mejorado
      </Title>

      <div style={{ marginBottom: '2rem' }}>
        <Label>Modo de demostración:</Label>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <label>
            <input
              type="radio"
              checked={showDemo === 'new'}
              onChange={() => setShowDemo('new')}
            />
            Usuario nuevo
          </label>
          <label>
            <input
              type="radio"
              checked={showDemo === 'edit'}
              onChange={() => setShowDemo('edit')}
            />
            Editar usuario
          </label>
        </div>
      </div>

      <FormGroup>
        <Label>
          {showDemo === 'edit' ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
        </Label>
        <EnhancedPasswordInput
          value={password}
          onChange={handlePasswordChange}
          required={showDemo === 'new'}
          disabled={false}
          isEditing={showDemo === 'edit'}
          showStrengthMeter={true}
          showGenerator={true}
          showValidation={true}
          onValidationChange={handlePasswordValidation}
        />
      </FormGroup>

      {/* Mostrar errores de validación */}
      {validation.errors.length > 0 && (
        <FormGroup>
          <ValidationMessage errors={validation.errors} />
        </FormGroup>
      )}

      {/* Estadísticas */}
      <Stats>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>
          📊 Estadísticas en tiempo real:
        </h3>
        <StatItem>
          <span>Longitud:</span>
          <span>{password.length} caracteres</span>
        </StatItem>
        <StatItem>
          <span>Fortaleza:</span>
          <span>{Math.round(strength)}% ({
            strength < 30 ? 'Muy débil' :
            strength < 60 ? 'Débil' :
            strength < 80 ? 'Fuerte' : 'Muy fuerte'
          })</span>
        </StatItem>
        <StatItem>
          <span>Válida:</span>
          <span style={{ color: isPasswordValid ? '#10b981' : '#ef4444' }}>
            {isPasswordValid ? '✓ Sí' : '✗ No'}
          </span>
        </StatItem>
        <StatItem>
          <span>Modo:</span>
          <span>{showDemo === 'edit' ? 'Edición' : 'Nuevo usuario'}</span>
        </StatItem>
      </Stats>

      {/* Contraseñas de prueba */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
          🧪 Prueba con estas contraseñas:
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {demoPasswords.map((demo, index) => (
            <Button
              key={index}
              onClick={() => setPassword(demo.value)}
              style={{ fontSize: '0.875rem', padding: '8px 16px' }}
            >
              {demo.label}
            </Button>
          ))}
          <Button
            onClick={() => setPassword('')}
            style={{ 
              fontSize: '0.875rem', 
              padding: '8px 16px',
              background: '#6b7280'
            }}
          >
            Limpiar
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default PasswordExample;
