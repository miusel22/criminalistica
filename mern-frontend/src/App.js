import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { getTheme } from './theme/theme';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
      />
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="/" />} 
      />
    </Routes>
  );
}

// Componente interno que usa el contexto del tema
function ThemedToaster() {
  const { theme } = useTheme();
  const currentTheme = getTheme(theme);

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 6000,
        style: {
          background: '#ffffff',
          color: '#333333',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          minWidth: '300px',
          maxWidth: '500px',
          zIndex: 9999,
        },
        success: {
          duration: 4000,
          style: {
            background: '#f0f9ff',
            color: '#0c4a6e',
            border: '1px solid #0ea5e9',
          },
        },
        error: {
          duration: 8000,
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #ef4444',
            fontWeight: '600',
          },
        },
      }}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <ThemedToaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
