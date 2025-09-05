import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimpleSectoresTest = () => {
  const [sectores, setSectores] = useState([]);
  const [subsectores, setSubsectores] = useState([]);
  const [indiciados, setIndiciados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🧪 SimpleSectoresTest - Iniciando carga de datos...');
      setLoading(true);
      
      // Hacer peticiones directas
      const [sectoresRes, subsectoresRes, indiciadosRes, vehiculosRes] = await Promise.all([
        axios.get('/sectores').catch(err => ({ data: { error: err.message } })),
        axios.get('/subsectores').catch(err => ({ data: { error: err.message } })),
        axios.get('/indiciados').catch(err => ({ data: { error: err.message } })),
        axios.get('/vehiculos').catch(err => ({ data: { error: err.message } }))
      ]);

      console.log('📊 Respuestas recibidas:', {
        sectores: sectoresRes.data,
        subsectores: subsectoresRes.data,
        indiciados: indiciadosRes.data,
        vehiculos: vehiculosRes.data
      });

      // Procesar sectores
      const sectoresData = sectoresRes.data.sectores || sectoresRes.data || [];
      setSectores(Array.isArray(sectoresData) ? sectoresData : []);

      // Procesar subsectores
      const subsectoresData = Array.isArray(subsectoresRes.data) ? subsectoresRes.data : [];
      setSubsectores(subsectoresData);

      // Procesar indiciados
      const indiciadosData = Array.isArray(indiciadosRes.data) ? indiciadosRes.data : [];
      setIndiciados(indiciadosData);

      // Procesar vehículos
      const vehiculosData = Array.isArray(vehiculosRes.data) ? vehiculosRes.data : [];
      setVehiculos(vehiculosData);

      console.log('✅ Datos procesados:', {
        sectores: sectoresData.length,
        subsectores: subsectoresData.length,
        indiciados: indiciadosData.length,
        vehiculos: vehiculosData.length
      });

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>🔄 Cargando datos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>❌ Error: {error}</h2>
        <button onClick={loadData}>🔄 Reintentar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📊 Test Simple de Datos PostgreSQL</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
          <h3>📁 Sectores</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{sectores.length}</p>
        </div>
        
        <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px' }}>
          <h3>📂 Subsectores</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{subsectores.length}</p>
        </div>
        
        <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
          <h3>👤 Indiciados</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{indiciados.length}</p>
        </div>
        
        <div style={{ background: '#e0f2f1', padding: '1rem', borderRadius: '8px' }}>
          <h3>🚗 Vehículos</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{vehiculos.length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <h3>📁 Sectores ({sectores.length})</h3>
          <div style={{ maxHeight: '200px', overflow: 'auto', background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
            {sectores.map((sector, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>{sector.nombre}</strong>
                <br />
                <small>ID: {sector.id}</small>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3>📂 Subsectores ({subsectores.length})</h3>
          <div style={{ maxHeight: '200px', overflow: 'auto', background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
            {subsectores.map((subsector, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>{subsector.nombre}</strong>
                <br />
                <small>ID: {subsector.id} | Parent: {subsector.parentId}</small>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3>👤 Indiciados ({indiciados.length})</h3>
          <div style={{ maxHeight: '200px', overflow: 'auto', background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
            {indiciados.map((indiciado, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>{indiciado.nombre} {indiciado.apellidos}</strong>
                <br />
                <small>ID: {indiciado.id}</small>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3>🚗 Vehículos ({vehiculos.length})</h3>
          <div style={{ maxHeight: '200px', overflow: 'auto', background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
            {vehiculos.map((vehiculo, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>{vehiculo.marca || 'Sin marca'} - {vehiculo.placa}</strong>
                <br />
                <small>ID: {vehiculo.id}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={loadData} style={{ padding: '0.5rem 1rem', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Recargar Datos
        </button>
      </div>
    </div>
  );
};

export default SimpleSectoresTest;
