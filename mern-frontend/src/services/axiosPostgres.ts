import axios from 'axios';

// Crear instancia de axios para PostgreSQL
const axiosPostgres = axios.create({
  baseURL: process.env.REACT_APP_POSTGRES_API_URL || 'http://localhost:5004/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar el token
axiosPostgres.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🐘 PostgreSQL Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('🐘 PostgreSQL Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores
axiosPostgres.interceptors.response.use(
  (response) => {
    console.log('🐘 PostgreSQL Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('🐘 PostgreSQL Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    // Si el token es inválido, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // No redirigimos automáticamente aquí para evitar loops infinitos
      // El componente de autenticación debe manejar esto
    }

    return Promise.reject(error);
  }
);

export default axiosPostgres;
