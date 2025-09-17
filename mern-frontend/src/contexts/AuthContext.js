import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_POSTGRES_API_URL || 'http://localhost:5005/api';
console.log('API Base URL:', axios.defaults.baseURL);

// Clear any invalid tokens on app start (development only)
if (process.env.NODE_ENV === 'development') {
  const token = localStorage.getItem('access_token');
  if (token && token.includes('temp-development-token')) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    console.log('🧼 Tokens de desarrollo limpiados');
  }
}

// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Only add token if it exists and it's not a login request
    if (token && !config.url?.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor removed to prevent automatic redirects during login
// Token expiration will be handled manually in individual API calls

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Manual token expiration handler
  const handleTokenExpiration = () => {
    console.log('🔄 Token expirado, limpiando sesión...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login') {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', {
        duration: 4000,
        id: 'session-expired'
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  const login = async (credentials) => {
    console.log('🟡 LOGIN: Iniciando proceso de login...');
    try {
      // Backend expects email field
      const loginData = {
        email: credentials.email || credentials.username,
        password: credentials.password
      };
      console.log('🟡 LOGIN: Enviando petición a /auth/login');
      const response = await axios.post('/auth/login', loginData);
      console.log('🟡 LOGIN: Respuesta recibida exitosamente');
      
      const { access_token, user: userData } = response.data;
      
      // Guardar token y datos del usuario
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('👤 Usuario logueado:', userData);
      toast.success('✅ Inicio de sesión exitoso', {
        duration: 3000,
        id: 'login-success'
      });
      return { success: true };
    } catch (error) {
      console.error('🔴 LOGIN: Error capturado:', error);
      console.error('🔴 LOGIN: Status:', error.response?.status);
      console.error('🔴 LOGIN: URL:', error.config?.url);
      
      let message = 'Error al iniciar sesión';
      let errorType = 'general';
      
      // Handle different types of errors
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 401:
            if (errorData.error === 'Invalid credentials') {
              message = 'Usuario o contraseña incorrectos';
              errorType = 'credentials';
            } else {
              message = errorData.message || 'Credenciales inválidas';
              errorType = 'auth';
            }
            break;
          case 400:
            if (errorData.error === 'Validation error') {
              message = 'Por favor, complete todos los campos requeridos';
              errorType = 'validation';
            } else {
              message = errorData.message || 'Datos inválidos';
              errorType = 'validation';
            }
            break;
          case 500:
            message = 'Error del servidor. Inténtalo más tarde.';
            errorType = 'server';
            break;
          default:
            message = errorData.message || 'Error inesperado';
            errorType = 'unknown';
        }
      } else if (error.request) {
        // Network error
        message = 'Error de conexión. Verifica tu conexión a internet.';
        errorType = 'network';
      } else {
        message = 'Error inesperado. Inténtalo de nuevo.';
        errorType = 'unknown';
      }
      
      // Don't show toast for credential errors (will be handled by the form)
      if (errorType !== 'credentials') {
        toast.error(message, {
          duration: 5000,
          id: 'login-error'
        });
      }
      
      return { 
        success: false, 
        error: message, 
        errorType,
        errorData: error.response?.data
      };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('/auth/register', userData);
      toast.success('Registro exitoso. Por favor, inicia sesión.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar usuario';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    toast.success('Sesión cerrada');
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/auth/profile');
      const userData = response.data;
      
      // Sincronizar datos del usuario en todos los almacenamientos
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('👤 Perfil actualizado:', userData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Handle 401 (token expired) manually
      if (error.response?.status === 401) {
        handleTokenExpiration();
      } else {
        // For other errors, just clean up without redirecting
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
