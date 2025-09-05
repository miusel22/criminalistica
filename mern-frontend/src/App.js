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
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: currentTheme.colors.toastBg,
          color: currentTheme.colors.toastText,
          border: `1px solid ${currentTheme.colors.border}`,
        },
        success: {
          duration: 3000,
          style: {
            background: currentTheme.colors.toastBg,
            color: currentTheme.colors.toastText,
            border: `1px solid ${currentTheme.colors.success}`,
          },
        },
        error: {
          duration: 5000,
          style: {
            background: currentTheme.colors.toastBg,
            color: currentTheme.colors.toastText,
            border: `1px solid ${currentTheme.colors.danger}`,
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
