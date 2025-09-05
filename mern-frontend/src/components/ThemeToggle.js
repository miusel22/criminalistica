import React from 'react';
import styled from 'styled-components';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../theme/theme';

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  cursor: pointer;
  transition: all ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};

  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.shadowFocus;
    }};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  ${ToggleButton}:hover & {
    transform: rotate(20deg);
  }
`;

const ThemeToggle = ({ size = 18, className }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <ToggleButton
      onClick={toggleTheme}
      $theme={theme}
      className={className}
      title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <IconWrapper>
        {isDark ? <Sun size={size} /> : <Moon size={size} />}
      </IconWrapper>
    </ToggleButton>
  );
};

export default ThemeToggle;
