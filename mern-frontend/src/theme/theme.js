// Definición de temas light y dark
export const lightTheme = {
  name: 'light',
  colors: {
    // Colores principales
    primary: '#007bff',
    primaryHover: '#0056b3',
    secondary: '#6c757d',
    success: '#10b981',
    danger: '#e53e3e',
    dangerHover: '#c53030',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Backgrounds
    background: '#f5f7fa',
    backgroundAlt: '#ffffff',
    backgroundCard: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#e9ecef',

    // Texto
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#ffffff',
    textMuted: '#6b7280',

    // Bordes
    border: '#e1e5e9',
    borderLight: '#f1f3f4',
    borderFocus: '#3b82f6',
    borderError: '#ef4444',
    borderSuccess: '#10b981',

    // Estados
    hover: '#f8f9fa',
    focus: '#e3f2fd',
    active: '#f8f9fa',
    disabled: '#e5e7eb',

    // Sombras
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(0, 0, 0, 0.15)',
    shadowFocus: 'rgba(59, 130, 246, 0.1)',

    // Sidebar y navegación
    sidebarBg: '#ffffff',
    sidebarText: '#666666',
    sidebarActive: '#f8f9fa',
    sidebarActiveText: '#007bff',
    sidebarBorder: '#e1e5e9',

    // Header
    headerBg: '#ffffff',
    headerText: '#333333',
    headerBorder: '#e1e5e9',

    // Formularios
    inputBg: '#ffffff',
    inputBorder: '#e5e7eb',
    inputText: '#374151',
    inputPlaceholder: '#9ca3af',
    inputFocus: '#3b82f6',

    // Loading spinner
    spinnerPrimary: '#3b82f6',
    spinnerSecondary: '#f3f4f6',

    // Toasts
    toastBg: '#333333',
    toastText: '#ffffff',
  },
  
  // Propiedades adicionales
  borderRadius: '8px',
  borderRadiusLg: '12px',
  borderRadiusSm: '4px',
  
  // Sombras predefinidas
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },

  // Transiciones
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  }
};

export const darkTheme = {
  name: 'dark',
  colors: {
    // Colores principales
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#6b7280',
    success: '#10b981',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    warning: '#f59e0b',
    info: '#06b6d4',

    // Backgrounds
    background: '#111827',
    backgroundAlt: '#1f2937',
    backgroundCard: '#1f2937',
    backgroundSecondary: '#374151',
    backgroundTertiary: '#4b5563',

    // Texto
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    textInverse: '#111827',
    textMuted: '#6b7280',

    // Bordes
    border: '#374151',
    borderLight: '#4b5563',
    borderFocus: '#3b82f6',
    borderError: '#ef4444',
    borderSuccess: '#10b981',

    // Estados
    hover: '#374151',
    focus: '#1e3a8a',
    active: '#374151',
    disabled: '#4b5563',

    // Sombras
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowHover: 'rgba(0, 0, 0, 0.4)',
    shadowFocus: 'rgba(59, 130, 246, 0.2)',

    // Sidebar y navegación
    sidebarBg: '#1f2937',
    sidebarText: '#d1d5db',
    sidebarActive: '#374151',
    sidebarActiveText: '#3b82f6',
    sidebarBorder: '#374151',

    // Header
    headerBg: '#1f2937',
    headerText: '#f9fafb',
    headerBorder: '#374151',

    // Formularios
    inputBg: '#374151',
    inputBorder: '#4b5563',
    inputText: '#f9fafb',
    inputPlaceholder: '#9ca3af',
    inputFocus: '#3b82f6',

    // Loading spinner
    spinnerPrimary: '#3b82f6',
    spinnerSecondary: '#4b5563',

    // Toasts
    toastBg: '#374151',
    toastText: '#f9fafb',
  },
  
  // Propiedades adicionales (iguales al tema claro)
  borderRadius: '8px',
  borderRadiusLg: '12px',
  borderRadiusSm: '4px',
  
  // Sombras predefinidas
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 2px 8px rgba(0, 0, 0, 0.3)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.4)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },

  // Transiciones
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  }
};

// Función helper para obtener el tema actual
export const getTheme = (themeName) => {
  return themeName === 'dark' ? darkTheme : lightTheme;
};
