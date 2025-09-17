import React from 'react';
import styled from 'styled-components';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme/theme';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

interface ValidationMessageProps {
  errors: ValidationError[];
  className?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Message = styled.div<{ severity: string; $theme?: string }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  line-height: 1.4;
  
  ${props => {
    const theme = getTheme(props.$theme);
    switch (props.severity) {
      case 'error':
        return `
          background: ${theme.colors.danger}15;
          border: 1px solid ${theme.colors.danger}30;
          color: ${theme.colors.danger};
        `;
      case 'warning':
        return `
          background: #f59e0b15;
          border: 1px solid #f59e0b30;
          color: #f59e0b;
        `;
      case 'info':
        return `
          background: ${theme.colors.primary}15;
          border: 1px solid ${theme.colors.primary}30;
          color: ${theme.colors.primary};
        `;
      case 'success':
        return `
          background: ${theme.colors.success}15;
          border: 1px solid ${theme.colors.success}30;
          color: ${theme.colors.success};
        `;
      default:
        return `
          background: ${theme.colors.textSecondary}15;
          border: 1px solid ${theme.colors.textSecondary}30;
          color: ${theme.colors.textSecondary};
        `;
    }
  }}
`;

const IconContainer = styled.div`
  margin-top: 2px;
  flex-shrink: 0;
`;

const MessageText = styled.div`
  flex: 1;
`;

const ValidationMessage: React.FC<ValidationMessageProps> = ({ errors, className }) => {
  const { theme } = useTheme();

  if (!errors || errors.length === 0) {
    return null;
  }

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'info':
        return <Info size={16} />;
      case 'success':
        return <CheckCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  // Agrupar errores por severidad para mostrar primero los más importantes
  const sortedErrors = [...errors].sort((a, b) => {
    const severityOrder = { error: 0, warning: 1, info: 2, success: 3 };
    return severityOrder[a.severity as keyof typeof severityOrder] - 
           severityOrder[b.severity as keyof typeof severityOrder];
  });

  return (
    <Container className={className}>
      {sortedErrors.map((error, index) => (
        <Message key={`${error.field}-${index}`} severity={error.severity} $theme={theme}>
          <IconContainer>
            {getIcon(error.severity)}
          </IconContainer>
          <MessageText>
            {error.message}
          </MessageText>
        </Message>
      ))}
    </Container>
  );
};

export default ValidationMessage;
