import React, { useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme/theme';
import { 
  AlertTriangle, 
  X, 
  Check, 
  Info, 
  HelpCircle, 
  Trash2, 
  AlertCircle,
  UserMinus,
  Power,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';

// Animaciones
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  ${css`animation: ${fadeIn} 0.3s ease-out;`}
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.background;
  }};
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  ${css`animation: ${slideIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);`}
  
  @media (max-width: 768px) {
    padding: 2rem;
    max-width: 95%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  border: none;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;

  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.backgroundTertiary;
    }};
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
    transform: scale(1.05);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 50%;
  margin: 0 auto 2rem;
  position: relative;
  
  background: ${props => {
    const gradients = {
      danger: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)',
      warning: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
      success: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
      info: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
      question: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)',
      delete: 'linear-gradient(135deg, #fecaca 0%, #f87171 50%, #ef4444 100%)',
      deactivate: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fb923c 100%)',
      critical: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 50%, #dc2626 100%)'
    };
    return gradients[props.variant] || gradients.info;
  }};
  
  border: 3px solid ${props => {
    const colors = {
      danger: '#fca5a5',
      warning: '#fcd34d',
      success: '#86efac',
      info: '#93c5fd',
      question: '#c4b5fd',
      delete: '#ef4444',
      deactivate: '#fb923c',
      critical: '#dc2626'
    };
    return colors[props.variant] || colors.info;
  }};

  ${props => props.variant === 'danger' || props.variant === 'delete' || props.variant === 'critical' ? css`
    animation: ${pulse} 2s infinite;
  ` : ''}
`;

const Icon = styled.div`
  color: ${props => {
    const colors = {
      danger: '#dc2626',
      warning: '#d97706',
      success: '#16a34a',
      info: '#2563eb',
      question: '#7c3aed',
      delete: '#dc2626',
      deactivate: '#ea580c',
      critical: '#b91c1c'
    };
    return colors[props.variant] || colors.info;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const Title = styled.h3`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  text-align: center;
  line-height: 1.3;
`;

const Message = styled.div`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 1rem;
  margin: 0 0 2rem;
  text-align: center;
  line-height: 1.6;
`;

const UserInfoCard = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 12px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  text-align: left;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const UserEmail = styled.div`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const UserRole = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.$color || '#6c757d'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const WarningBox = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  color: #92400e;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 1rem 1.75rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }

  ${props => {
    const theme = getTheme(props.$theme);
    
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryHover} 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    } else if (props.variant === 'danger') {
      return `
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    } else if (props.variant === 'warning') {
      return `
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(217, 119, 6, 0.4);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    } else if (props.variant === 'success') {
      return `
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(22, 163, 74, 0.4);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    } else {
      return `
        background: ${theme.colors.backgroundSecondary};
        color: ${theme.colors.textSecondary};
        border: 2px solid ${theme.colors.border};
        
        &:hover {
          background: ${theme.colors.backgroundTertiary};
          color: ${theme.colors.textPrimary};
          border-color: ${theme.colors.borderHover || theme.colors.border};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    }
  }}
`;

const getIconForVariant = (variant, customIcon) => {
  if (customIcon) return customIcon;
  
  const icons = {
    danger: AlertTriangle,
    warning: AlertTriangle,
    success: Check,
    info: Info,
    question: HelpCircle,
    error: AlertCircle,
    delete: Trash2,
    deactivate: Power,
    critical: AlertCircle
  };
  return icons[variant] || Info;
};

const getRoleBadgeInfo = (role) => {
  const roleInfo = {
    admin: { color: '#dc2626', text: 'Administrador', icon: Shield },
    editor: { color: '#2563eb', text: 'Editor', icon: Lock },
    viewer: { color: '#16a34a', text: 'Visualizador', icon: Unlock },
    user: { color: '#6b7280', text: 'Usuario', icon: UserMinus },
    indiciado: { color: '#f59e0b', text: 'Indiciado', icon: UserMinus },
    vehiculo: { color: '#3b82f6', text: 'Vehículo', icon: UserMinus },
    sector: { color: '#8b5cf6', text: 'Sector', icon: UserMinus },
    subsector: { color: '#06b6d4', text: 'Subsector', icon: UserMinus },
    documento: { color: '#10b981', text: 'Documento', icon: UserMinus }
  };
  
  return roleInfo[role] || roleInfo.user;
};

const CustomConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title = "Confirmar acción",
  message = "¿Está seguro de que desea continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger", // danger, warning, success, info, question, error, delete, deactivate, critical
  showCancel = true,
  icon: CustomIcon,
  userInfo, // Información adicional del usuario para mostrar
  warningMessage, // Mensaje de advertencia adicional
  isDestructive = false // Si es una acción destructiva
}) => {
  const { theme } = useTheme();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  if (!isOpen) return null;

  const IconComponent = getIconForVariant(variant, CustomIcon);

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer $theme={theme}>
        <CloseButton $theme={theme} onClick={onClose}>
          <X size={20} />
        </CloseButton>
        
        <IconContainer variant={variant}>
          <Icon variant={variant}>
            <IconComponent size={32} />
          </Icon>
        </IconContainer>

        <Title $theme={theme}>{title}</Title>
        <Message $theme={theme}>{message}</Message>

        {userInfo && (
          <UserInfoCard $theme={theme}>
            <UserName $theme={theme}>{userInfo.name}</UserName>
            <UserEmail $theme={theme}>{userInfo.email}</UserEmail>
            {userInfo.role && (
              <UserRole $color={getRoleBadgeInfo(userInfo.role).color}>
                {React.createElement(getRoleBadgeInfo(userInfo.role).icon, { size: 12 })}
                {getRoleBadgeInfo(userInfo.role).text}
              </UserRole>
            )}
          </UserInfoCard>
        )}

        {warningMessage && (
          <WarningBox>
            <AlertTriangle size={16} style={{ minWidth: '16px', marginTop: '2px' }} />
            <div>{warningMessage}</div>
          </WarningBox>
        )}

        <ButtonContainer>
          {showCancel && (
            <Button $theme={theme} variant="secondary" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button 
            $theme={theme} 
            variant={isDestructive ? "danger" : variant === "success" ? "success" : "primary"} 
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CustomConfirmationModal;
