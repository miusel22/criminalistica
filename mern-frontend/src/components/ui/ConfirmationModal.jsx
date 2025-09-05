import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme';
import { AlertTriangle, X } from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const ModalContainer = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.background;
  }};
  border-radius: 12px;
  padding: 2rem;
  max-width: 450px;
  width: 90%;
  margin: 1rem;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.xl;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  transform: ${props => props.isVisible ? 'scale(1)' : 'scale(0.95)'};
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
  padding: 0.25rem;
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
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: ${props => {
    if (props.variant === 'danger') return '#fef2f2';
    if (props.variant === 'warning') return '#fffbeb';
    return '#f0f9ff';
  }};
  margin: 0 auto 1.5rem;
`;

const Icon = styled.div`
  color: ${props => {
    if (props.variant === 'danger') return '#dc2626';
    if (props.variant === 'warning') return '#d97706';
    return '#2563eb';
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
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  text-align: center;
`;

const Message = styled.p`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 0.95rem;
  margin: 0 0 2rem;
  text-align: center;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 80px;

  ${props => {
    const theme = getTheme(props.$theme);
    
    if (props.variant === 'primary') {
      return `
        background: ${theme.colors.primary};
        color: white;
        
        &:hover {
          background: ${theme.colors.primaryHover};
          transform: translateY(-1px);
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
          transform: translateY(-1px);
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
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    }
  }}
`;

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Está seguro de que desea continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger" // danger, warning, info
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

  if (!isOpen) return null;

  return (
    <ModalOverlay isVisible={isOpen} onClick={handleOverlayClick}>
      <ModalContainer $theme={theme} isVisible={isOpen}>
        <CloseButton $theme={theme} onClick={onClose}>
          <X size={20} />
        </CloseButton>
        
        <IconContainer variant={variant}>
          <Icon variant={variant}>
            <AlertTriangle size={24} />
          </Icon>
        </IconContainer>

        <Title $theme={theme}>{title}</Title>
        <Message $theme={theme}>{message}</Message>

        <ButtonContainer>
          <Button $theme={theme} variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button $theme={theme} variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ConfirmationModal;
