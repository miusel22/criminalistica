import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimpleManager = () => {
  const [sectores, setSectores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedSubsector, setSelectedSubsector] = useState(null);
  
  // Formularios
  const [newSectorName, setNewSectorName] = useState('');
  const [newSubsectorName, setNewSubsectorName] = useState('');
  const [newIndiciadoData, setNewIndiciadoData] = useState({
    nombre: '',
    apellidos: '',
    alias: '',
    telefono: ''
  });

  useEffect(() => {
    loadSectores();
  }, []);

  const loadSectores = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/sectores');
      setSectores(response.data);
    } catch (error) {
      console.error('Error cargando sectores:', error);
      alert('Error cargando sectores: ' + (error.response?.data?.msg || error.message));
    }
    setLoading(false);
  };

  const createSector = async () => {
    if (!newSectorName.trim()) {
      alert('Ingresa un nombre para el sector');
      return;
    }
    
    try {
      await axios.post('/sectores', { nombre: newSectorName });
      setNewSectorName('');
      loadSectores();
      alert('Sector creado exitosamente');
    } catch (error) {
      console.error('Error creando sector:', error);
      alert('Error creando sector: ' + (error.response?.data?.msg || error.message));
    }
  };

  const createSubsector = async () => {
    if (!selectedSector) {
      alert('Selecciona un sector primero');
      return;
    }
    if (!newSubsectorName.trim()) {
      alert('Ingresa un nombre para el subsector');
      return;
    }
    
    try {
      await axios.post('/subsectores', { 
        nombre: newSubsectorName,
        sectorId: selectedSector._id
      });
      setNewSubsectorName('');
      loadSectores();
      alert('Subsector creado exitosamente');
    } catch (error) {
      console.error('Error creando subsector:', error);
      alert('Error creando subsector: ' + (error.response?.data?.msg || error.message));
    }
  };

  const createIndiciado = async () => {
    if (!selectedSubsector) {
      alert('Selecciona un subsector primero');
      return;
    }
    if (!newIndiciadoData.nombre.trim() || !newIndiciadoData.apellidos.trim()) {
      alert('Ingresa nombre y apellidos del indiciado');
      return;
    }
    
    try {
      await axios.post('/indiciados', {
        ...newIndiciadoData,
        subsectorId: selectedSubsector._id
      });
      setNewIndiciadoData({ nombre: '', apellidos: '', alias: '', telefono: '' });
      loadSectores();
      alert('Indiciado creado exitosamente');
    } catch (error) {
      console.error('Error creando indiciado:', error);
      alert('Error creando indiciado: ' + (error.response?.data?.msg || error.message));
    }
  };

  const deleteItem = async (type, id) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`¿Estás seguro de eliminar este ${type}?`)) return;
    
    try {
      await axios.delete(`/${type}s/${id}`);
      loadSectores();
      alert(`${type} eliminado exitosamente`);
    } catch (error) {
      console.error(`Error eliminando ${type}:`, error);
      alert(`Error eliminando ${type}: ` + (error.response?.data?.msg || error.message));
    }
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    section: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    form: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      alignItems: 'center'
    },
    input: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    deleteButton: {
      padding: '4px 8px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    selectButton: {
      padding: '4px 8px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    list: {
      listStyle: 'none',
      padding: 0
    },
    listItem: {
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '8px',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    selected: {
      backgroundColor: '#e3f2fd',
      border: '2px solid #2196f3'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🕵️ Shadow Docket</h1>
        <p>Crea y gestiona Sectores → Subsectores → Indiciados</p>
        {loading && <p>Cargando...</p>}
      </div>

      {/* Crear Sector */}
      <div style={styles.section}>
        <h2>📍 Crear Sector</h2>
        <div style={styles.form}>
          <input
            type="text"
            placeholder="Nombre del sector"
            value={newSectorName}
            onChange={(e) => setNewSectorName(e.target.value)}
            style={styles.input}
          />
          <button onClick={createSector} style={styles.button}>
            Crear Sector
          </button>
        </div>
        
        <h3>Sectores Existentes:</h3>
        <ul style={styles.list}>
          {sectores.map(sector => (
            <li 
              key={sector._id} 
              style={{
                ...styles.listItem,
                ...(selectedSector?._id === sector._id ? styles.selected : {})
              }}
            >
              <span><strong>{sector.nombre}</strong></span>
              <div>
                <button 
                  onClick={() => setSelectedSector(sector)}
                  style={styles.selectButton}
                >
                  Seleccionar
                </button>
                <button 
                  onClick={() => deleteItem('sector', sector._id)}
                  style={{...styles.deleteButton, marginLeft: '5px'}}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Crear Subsector */}
      <div style={styles.section}>
        <h2>📂 Crear Subsector</h2>
        {selectedSector && (
          <p style={{color: '#2196f3'}}>
            Sector seleccionado: <strong>{selectedSector.nombre}</strong>
          </p>
        )}
        <div style={styles.form}>
          <input
            type="text"
            placeholder="Nombre del subsector"
            value={newSubsectorName}
            onChange={(e) => setNewSubsectorName(e.target.value)}
            style={styles.input}
            disabled={!selectedSector}
          />
          <button 
            onClick={createSubsector} 
            style={styles.button}
            disabled={!selectedSector}
          >
            Crear Subsector
          </button>
        </div>
        
        {selectedSector && (
          <>
            <h3>Subsectores del sector "{selectedSector.nombre}":</h3>
            <ul style={styles.list}>
              {selectedSector.subsectores?.map(subsector => (
                <li 
                  key={subsector._id}
                  style={{
                    ...styles.listItem,
                    ...(selectedSubsector?._id === subsector._id ? styles.selected : {})
                  }}
                >
                  <span>{subsector.nombre}</span>
                  <div>
                    <button 
                      onClick={() => setSelectedSubsector(subsector)}
                      style={styles.selectButton}
                    >
                      Seleccionar
                    </button>
                    <button 
                      onClick={() => deleteItem('subsector', subsector._id)}
                      style={{...styles.deleteButton, marginLeft: '5px'}}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              )) || []}
            </ul>
          </>
        )}
      </div>

      {/* Crear Indiciado */}
      <div style={styles.section}>
        <h2>👤 Crear Indiciado</h2>
        {selectedSubsector && (
          <p style={{color: '#2196f3'}}>
            Subsector seleccionado: <strong>{selectedSubsector.nombre}</strong>
          </p>
        )}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px'}}>
          <input
            type="text"
            placeholder="Nombre"
            value={newIndiciadoData.nombre}
            onChange={(e) => setNewIndiciadoData(prev => ({...prev, nombre: e.target.value}))}
            style={styles.input}
            disabled={!selectedSubsector}
          />
          <input
            type="text"
            placeholder="Apellidos"
            value={newIndiciadoData.apellidos}
            onChange={(e) => setNewIndiciadoData(prev => ({...prev, apellidos: e.target.value}))}
            style={styles.input}
            disabled={!selectedSubsector}
          />
          <input
            type="text"
            placeholder="Alias (opcional)"
            value={newIndiciadoData.alias}
            onChange={(e) => setNewIndiciadoData(prev => ({...prev, alias: e.target.value}))}
            style={styles.input}
            disabled={!selectedSubsector}
          />
          <input
            type="text"
            placeholder="Teléfono (opcional)"
            value={newIndiciadoData.telefono}
            onChange={(e) => setNewIndiciadoData(prev => ({...prev, telefono: e.target.value}))}
            style={styles.input}
            disabled={!selectedSubsector}
          />
        </div>
        <button 
          onClick={createIndiciado} 
          style={styles.button}
          disabled={!selectedSubsector}
        >
          Crear Indiciado
        </button>
        
        {selectedSubsector && (
          <>
            <h3>Indiciados del subsector "{selectedSubsector.nombre}":</h3>
            <ul style={styles.list}>
              {selectedSubsector.indiciados?.map(indiciado => (
                <li key={indiciado._id} style={styles.listItem}>
                  <span>
                    <strong>{indiciado.nombre} {indiciado.apellidos}</strong>
                    {indiciado.alias && <em> ({indiciado.alias})</em>}
                    {indiciado.telefono && <span> - Tel: {indiciado.telefono}</span>}
                  </span>
                  <button 
                    onClick={() => deleteItem('indiciado', indiciado._id)}
                    style={styles.deleteButton}
                  >
                    Eliminar
                  </button>
                </li>
              )) || []}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleManager;
