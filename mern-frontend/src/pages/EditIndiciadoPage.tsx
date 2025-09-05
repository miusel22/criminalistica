import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IndiciadoForm } from '../components/IndiciadoForm';
import { IndiciadoService } from '../services/indiciadoService';
import { transformBackendDataToFormData } from '../utils/indiciadoTransforms';

export const EditIndiciadoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [indiciadoData, setIndiciadoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIndiciado = async () => {
      if (!id) {
        setError('ID de indiciado no válido');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Cargando indiciado para editar:', id);
        const data = await IndiciadoService.obtenerPorId(id);
        console.log('📋 Datos del indiciado cargados:', data);
        
        // Debug específico del documento de identidad
        console.log('📄 DOCUMENTO IDENTIDAD EN BACKEND:', data.documentoIdentidad);
        
        // Transformar los datos del backend al formato del formulario
        const transformedData = transformBackendDataToFormData(data);
        console.log('🔄 Datos transformados para el formulario:', transformedData);
        
        // Debug específico del subsectorId
        console.log('🔍 SubsectorId Debug:', {
          original: data.subsectorId,
          transformed: transformedData.subsectorId,
          type_original: typeof data.subsectorId,
          type_transformed: typeof transformedData.subsectorId
        });
        
        setIndiciadoData({
          ...transformedData,
          id: data.id || data._id,
          _id: data.id || data._id
        });
        
      } catch (error: any) {
        console.error('❌ Error cargando indiciado:', error);
        setError(error.response?.data?.message || error.message || 'Error al cargar indiciado');
      } finally {
        setLoading(false);
      }
    };

    loadIndiciado();
  }, [id]);

  const handleSuccess = (updatedIndiciado: any) => {
    console.log('✅ Indiciado actualizado exitosamente:', updatedIndiciado);
    alert(`¡Indiciado "${updatedIndiciado.nombreCompleto}" actualizado exitosamente!`);
    navigate('/indiciados');
  };

  const handleCancel = () => {
    navigate('/indiciados');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '1rem' }}>
            Cargando datos del indiciado...
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4f46e5',
            borderRadius: '50%',
            margin: '0 auto'
          }} className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #fca5a5',
          backgroundColor: '#fee2e2'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error</h2>
          <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={() => navigate('/indiciados')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Volver a Lista
          </button>
        </div>
      </div>
    );
  }

  if (!indiciadoData) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p>No se encontraron datos del indiciado</p>
          <button
            onClick={() => navigate('/indiciados')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Volver a Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <IndiciadoForm
        initialData={indiciadoData}
        isEdit={true}
        isEditing={true}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
