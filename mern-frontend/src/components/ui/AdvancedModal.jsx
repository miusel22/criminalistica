import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme';
import { AlertTriangle, X, Check, Info, HelpCircle, Trash2, AlertCircle } from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContainer = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.background;
  }};
  border-radius: 16px;
  padding: 2rem;
  max-width: 480px;
  width: 90%;
  margin: 1rem;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return `${theme.shadows.xl}, 0 0 0 1px ${theme.colors.border}`;
  }};
  transform: ${props => props.isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)'};
  transition: transform 0.3s ease;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.backgroundTertiary;
    }};
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
    transform: scale(1.1);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  background: ${props => {
    const colors = {
      danger: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      warning: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      success: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      info: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      question: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'
    };
    return colors[props.variant] || colors.info;
  }};
  border: 2px solid ${props => {
    const colors = {
      danger: '#fecaca',
      warning: '#fed7aa',
      success: '#bbf7d0',
      info: '#bfdbfe',
      question: '#ddd6fe'
    };
    return colors[props.variant] || colors.info;
  }};
`;

const Icon = styled.div`
  color: ${props => {
    const colors = {
      danger: '#dc2626',
      warning: '#d97706',
      success: '#16a34a',
      info: '#2563eb',
      question: '#7c3aed'
    };
    return colors[props.variant] || colors.info;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h3`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  text-align: center;
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

const Details = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 90px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    const theme = getTheme(props.$theme);
    
    if (props.variant === 'primary') {
      return `
        background: ${theme.colors.primary};
        color: white;
        
        &:hover {
          background: ${theme.colors.primaryHover};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    } else if (props.variant === 'danger') {
      return `
        background: #dc2626;
        color: white;
        
        &:hover {
          background: #b91c1c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    } else if (props.variant === 'success') {
      return `
        background: #16a34a;
        color: white;
        
        &:hover {
          background: #15803d;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    } else {
      return `
        background: ${theme.colors.backgroundSecondary};
        color: ${theme.colors.textSecondary};
        border: 1px solid ${theme.colors.border};
        
        &:hover {
          background: ${theme.colors.backgroundTertiary};
          color: ${theme.colors.textPrimary};
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    }
  }}
`;

const getIconForVariant = (variant) => {
  const icons = {
    danger: Trash2,
    warning: AlertTriangle,
    success: Check,
    info: Info,
    question: HelpCircle,
    error: AlertCircle
  };
  return icons[variant] || Info;
};

const AdvancedModal = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title = "Confirmar acción",
  message = "¿Está seguro de que desea continuar?",
  details,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger", // danger, warning, success, info, question, error
  showCancel = true,
  icon: CustomIcon
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

  const IconComponent = CustomIcon || getIconForVariant(variant);

  return (
    <ModalOverlay isVisible={isOpen} onClick={handleOverlayClick}>
      <ModalContainer $theme={theme} isVisible={isOpen}>
        <CloseButton $theme={theme} onClick={onClose}>
          <X size={20} />
        </CloseButton>
        
        <IconContainer variant={variant}>
          <Icon variant={variant}>
            <IconComponent size={28} />
          </Icon>
        </IconContainer>

        <Title $theme={theme}>{title}</Title>
        <Message $theme={theme}>{message}</Message>

        {details && (
          <Details $theme={theme}>
            {details}
          </Details>
        )}

        <ButtonContainer>
          {showCancel && (
            <Button $theme={theme} variant="secondary" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button $theme={theme} variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AdvancedModal;
