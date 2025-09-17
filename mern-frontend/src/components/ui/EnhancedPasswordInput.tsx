import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme/theme';

interface ThemeProps {
  $theme?: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface EnhancedPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  showStrengthMeter?: boolean;
  showGenerator?: boolean;
  showValidation?: boolean;
  onValidationChange?: (isValid: boolean, strength: number) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
`;

const Input = styled.input<ThemeProps>`
  flex: 1;
  padding: 12px 48px 12px 16px;
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
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus;
    }};
    box-shadow: 0 0 0 3px ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus + '20';
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

const ToggleButton = styled.button<ThemeProps>`
  position: absolute;
  right: 44px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
  }
`;

const GenerateButton = styled.button<ThemeProps>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primaryHover + '20';
    }};
  }
`;

const StrengthMeter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StrengthBar = styled.div`
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
`;

const StrengthFill = styled.div<{ strength: number; $theme?: string }>`
  height: 100%;
  width: ${props => props.strength}%;
  background: ${props => {
    const theme = getTheme(props.$theme);
    if (props.strength < 30) return theme.colors.danger;
    if (props.strength < 60) return '#f59e0b';
    if (props.strength < 80) return '#10b981';
    return theme.colors.success;
  }};
  transition: all 0.3s ease;
`;

const StrengthLabel = styled.span<{ strength: number; $theme?: string }>`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => {
    const theme = getTheme(props.$theme);
    if (props.strength < 30) return theme.colors.danger;
    if (props.strength < 60) return '#f59e0b';
    if (props.strength < 80) return '#10b981';
    return theme.colors.success;
  }};
`;

const ValidationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ValidationItem = styled.li<{ isValid: boolean; $theme?: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return props.isValid ? theme.colors.success : theme.colors.textSecondary;
  }};
`;

const Tooltip = styled.div<ThemeProps>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  padding: 0.5rem;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 6px;
  font-size: 0.75rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.sm;
  }};
  z-index: 1000;
  white-space: nowrap;
`;

const EnhancedPasswordInput: React.FC<EnhancedPasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Ingresa la contraseña",
  required = false,
  disabled = false,
  isEditing = false,
  showStrengthMeter = true,
  showGenerator = true,
  showValidation = true,
  onValidationChange
}) => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const validatePassword = useCallback((password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }, []);

  const calculateStrength = useCallback((validation: PasswordValidation): number => {
    const criteria = Object.values(validation);
    const score = criteria.filter(Boolean).length;
    return (score / criteria.length) * 100;
  }, []);

  const generateSecurePassword = useCallback((): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    // Asegurar que tenga al menos un carácter de cada tipo
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }, []);

  const validation = validatePassword(value);
  const strength = calculateStrength(validation);
  const isValid = Object.values(validation).every(Boolean);

  const getStrengthLabel = (strength: number): string => {
    if (strength < 30) return 'Muy débil';
    if (strength < 60) return 'Débil';
    if (strength < 80) return 'Fuerte';
    return 'Muy fuerte';
  };

  const validationCriteria = [
    { key: 'minLength', label: 'Al menos 8 caracteres', isValid: validation.minLength },
    { key: 'hasUppercase', label: 'Una letra mayúscula', isValid: validation.hasUppercase },
    { key: 'hasLowercase', label: 'Una letra minúscula', isValid: validation.hasLowercase },
    { key: 'hasNumber', label: 'Un número', isValid: validation.hasNumber },
    { key: 'hasSpecialChar', label: 'Un carácter especial', isValid: validation.hasSpecialChar }
  ];

  // Notify parent component about validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid, strength);
    }
  }, [isValid, strength, onValidationChange]);

  const handleGenerate = () => {
    const newPassword = generateSecurePassword();
    onChange(newPassword);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <Container>
      <InputContainer>
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isEditing ? 'Dejar en blanco para mantener actual' : placeholder}
          required={required && !isEditing}
          disabled={disabled}
          $theme={theme}
        />
        
        <ToggleButton
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          $theme={theme}
          title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </ToggleButton>
        
        {showGenerator && !disabled && (
          <GenerateButton
            type="button"
            onClick={handleGenerate}
            disabled={disabled}
            $theme={theme}
            title="Generar contraseña segura"
          >
            <RefreshCw size={16} />
          </GenerateButton>
        )}
        
        {showTooltip && (
          <Tooltip $theme={theme}>
            ¡Contraseña segura generada!
          </Tooltip>
        )}
      </InputContainer>
      
      {showStrengthMeter && value.length > 0 && (
        <StrengthMeter>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StrengthLabel strength={strength} $theme={theme}>
              Fortaleza: {getStrengthLabel(strength)}
            </StrengthLabel>
            <span style={{ fontSize: '0.75rem', color: getTheme(theme).colors.textSecondary }}>
              {Math.round(strength)}%
            </span>
          </div>
          <StrengthBar>
            <StrengthFill strength={strength} $theme={theme} />
          </StrengthBar>
        </StrengthMeter>
      )}
      
      {showValidation && value.length > 0 && (
        <ValidationList>
          {validationCriteria.map((criterion) => (
            <ValidationItem key={criterion.key} isValid={criterion.isValid} $theme={theme}>
              {criterion.isValid ? (
                <Check size={14} />
              ) : (
                <X size={14} />
              )}
              {criterion.label}
            </ValidationItem>
          ))}
        </ValidationList>
      )}
      
      {isEditing && value.length === 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: getTheme(theme).colors.textSecondary
        }}>
          <AlertCircle size={14} />
          Dejar en blanco mantendrá la contraseña actual
        </div>
      )}
    </Container>
  );
};

export default EnhancedPasswordInput;
