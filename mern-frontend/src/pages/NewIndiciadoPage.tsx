import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndiciadoForm } from '../components/IndiciadoForm';
import { Indiciado } from '../types/indiciado';

export const NewIndiciadoPage: React.FC = () => {
  const navigate = useNavigate();

  // Temporal: Agregar token para desarrollo
  useEffect(() => {
    // Solo para desarrollo - en producción esto vendrá del login
    if (!localStorage.getItem('access_token')) {
      localStorage.setItem('access_token', 'temp-development-token');
    }
  }, []);

  const handleSuccess = (indiciado: Indiciado) => {
    console.log('Indiciado creado exitosamente:', indiciado);
    // Mostrar mensaje de éxito
    alert(`¡Indiciado "${indiciado.nombreCompleto}" creado exitosamente!`);
    // Redirigir a la lista de indiciados o al detalle
    navigate('/indiciados');
  };

  const handleCancel = () => {
    // Redirigir de vuelta a la lista
    navigate('/indiciados');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <IndiciadoForm
        initialData={{
          // Dejar vacío para que use el valor por defecto del backend
        }}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
