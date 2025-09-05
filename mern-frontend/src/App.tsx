import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NewIndiciadoPage } from './pages/NewIndiciadoPage';
import { IndiciadosListPage } from './pages/IndiciadosListPage';
import { EditIndiciadoPage } from './pages/EditIndiciadoPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/indiciados" replace />} />
            <Route path="/indiciados" element={<IndiciadosListPage />} />
            <Route path="/indiciados/new" element={<NewIndiciadoPage />} />
            <Route path="/indiciados/:id/edit" element={<EditIndiciadoPage />} />
            {/* Agregar más rutas según sea necesario */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
