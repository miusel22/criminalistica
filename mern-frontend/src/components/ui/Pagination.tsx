import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme/theme';

interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showLimitSelector?: boolean;
  disabled?: boolean;
  className?: string;
}

interface ThemeProps {
  $theme?: string;
}

const Container = styled.div<ThemeProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PageButton = styled.button<ThemeProps & { $active?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return props.$active ? theme.colors.primary : theme.colors.border;
  }};
  border-radius: 6px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    if (props.$disabled) return theme.colors.disabled;
    if (props.$active) return theme.colors.primary;
    return theme.colors.backgroundCard;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    if (props.$disabled) return theme.colors.textSecondary;
    if (props.$active) return theme.colors.textInverse;
    return theme.colors.textPrimary;
  }};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => {
      const theme = getTheme(props.$theme);
      if (props.$active) return theme.colors.primaryHover;
      return theme.colors.hover;
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const Ellipsis = styled.div<ThemeProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
`;

const InfoText = styled.div<ThemeProps>`
  font-size: 0.875rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const LimitSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const LimitSelect = styled.select<ThemeProps>`
  padding: 0.5rem;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 4px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
  }
`;

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  disabled = false,
  className
}) => {
  const { theme } = useTheme();
  
  const { current, pages, total, limit } = pagination;
  
  const getVisiblePages = () => {
    const delta = 2; // Número de páginas a mostrar alrededor de la página actual
    const range = [];
    
    // Siempre mostrar la primera página
    range.push(1);
    
    // Calcular el rango alrededor de la página actual
    const start = Math.max(2, current - delta);
    const end = Math.min(pages - 1, current + delta);
    
    // Añadir ellipsis si es necesario
    if (start > 2) {
      range.push('ellipsis-start');
    }
    
    // Añadir páginas del rango
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    // Añadir ellipsis si es necesario
    if (end < pages - 1) {
      range.push('ellipsis-end');
    }
    
    // Añadir la última página si hay más de 1 página
    if (pages > 1) {
      range.push(pages);
    }
    
    return range;
  };

  const handlePageChange = (page: number) => {
    if (!disabled && page >= 1 && page <= pages && page !== current) {
      onPageChange(page);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (onLimitChange && !disabled) {
      onLimitChange(newLimit);
    }
  };

  // Calcular el rango de elementos mostrados
  const startItem = (current - 1) * limit + 1;
  const endItem = Math.min(current * limit, total);

  const visiblePages = getVisiblePages();

  if (pages <= 1 && !showLimitSelector) {
    return null;
  }

  return (
    <Container $theme={theme} className={className}>
      <InfoText $theme={theme}>
        Mostrando {startItem}-{endItem} de {total} elementos
      </InfoText>

      <PaginationControls>
        {/* Botón Anterior */}
        <PageButton
          $theme={theme}
          $disabled={disabled || current <= 1}
          onClick={() => handlePageChange(current - 1)}
          disabled={disabled || current <= 1}
          title="Página anterior"
        >
          <ChevronLeft />
        </PageButton>

        {/* Números de página */}
        {visiblePages.map((page, index) => {
          if (typeof page === 'string') {
            return (
              <Ellipsis key={page} $theme={theme}>
                <MoreHorizontal size={16} />
              </Ellipsis>
            );
          }
          
          return (
            <PageButton
              key={page}
              $theme={theme}
              $active={page === current}
              $disabled={disabled}
              onClick={() => handlePageChange(page)}
              disabled={disabled}
            >
              {page}
            </PageButton>
          );
        })}

        {/* Botón Siguiente */}
        <PageButton
          $theme={theme}
          $disabled={disabled || current >= pages}
          onClick={() => handlePageChange(current + 1)}
          disabled={disabled || current >= pages}
          title="Página siguiente"
        >
          <ChevronRight />
        </PageButton>
      </PaginationControls>

      {/* Selector de límite */}
      {showLimitSelector && onLimitChange && (
        <LimitSelector>
          <InfoText $theme={theme}>Elementos por página:</InfoText>
          <LimitSelect
            $theme={theme}
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            disabled={disabled}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </LimitSelect>
        </LimitSelector>
      )}
    </Container>
  );
};

export default Pagination;
