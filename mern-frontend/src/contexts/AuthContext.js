import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5004/api';
console.log('API Base URL:', axios.defaults.baseURL);

// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('access_token');
    
    // Para desarrollo: si no hay token o es inválido, usar token de desarrollo válido
    if (!token || token === 'temp-development-token') {
      // Token de desarrollo válido de PostgreSQL
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwOGM3NmFkLWQ0MmEtNGJiZS1iNjAxLTY1MThmNzYxZTE1NyIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJhZG1pbl8xNzU2MTQ5NjQzMTIwIiwiaWF0IjoxNzU2MTU1MjYyLCJleHAiOjE3NTY3NjAwNjJ9.d20Ii8-LnYfgmqm7r-Sd78t_XKH8vUqQVY5HhsrKaIM';
      localStorage.setItem('access_token', token);
      
      // Agregar datos del usuario de desarrollo para permisos
      const devUser = {
        _id: '108c76ad-d42a-4bbe-b601-6518f761e157',
        email: 'admin@admin.com',
        role: 'admin',
        nombre: 'Admin',
        apellidos: 'Desarrollo',
        isActive: true,
        username: 'admin_1756149643120'
      };
      
      if (!localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(devUser));
        sessionStorage.setItem('user', JSON.stringify(devUser));
        console.log('👨‍💻 Usuario de desarrollo configurado:', devUser);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      // Backend expects email field
      const loginData = {
        email: credentials.email || credentials.username,
        password: credentials.password
      };
      const response = await axios.post('/auth/login', loginData);
      const { access_token, user: userData } = response.data;
      
      // Guardar token y datos del usuario
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('👤 Usuario logueado:', userData);
      toast.success('Inicio de sesión exitoso');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      return { success: false, error: message };
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
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
