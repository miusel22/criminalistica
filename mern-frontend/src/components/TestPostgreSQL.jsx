import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { testService } from '../services/testService';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const TestSection = styled.div`
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #f8f9fa;
`;

const SectionTitle = styled.h2`
  color: #495057;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border: none;
  border-radius: 6px;
  background: #17a2b8;
  color: white;
  cursor: pointer;
  
  &:hover {
    background: #138496;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Results = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  max-height: 200px;
  overflow-y: auto;
`;

const Input = styled.input`
  padding: 0.5rem;
  margin: 0.25rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 150px;
`;

const TestPostgreSQL = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  
  const [testData, setTestData] = useState({
    sector: { nombre: 'Sector Test Frontend' },
    indiciado: { 
      nombre: 'Juan Test', 
      apellidos: 'Frontend Test',
      cedula: `${Date.now()}`,
      genero: 'Masculino',
      estado: 'Activo'
    },
    vehiculo: { 
      tipoVehiculo: 'Automóvil',
      marca: 'Toyota Test',
      linea: 'Corolla Test',
      modelo: '2024',
      placa: `TST${Date.now().toString().slice(-3)}`,
      color: 'Azul',
      estado: 'Activo'
    }
  });

  const updateResult = (section, data) => {
    setResults(prev => ({ ...prev, [section]: data }));
  };

  // ==========================================
  // PRUEBAS DE SECTORES
  // ==========================================
  const testObtenerSectores = async () => {
    setLoading(true);
    try {
      const sectores = await testService.obtenerSectores();
      updateResult('sectores', `✅ ${sectores.length} sectores obtenidos`);
      toast.success(`${sectores.length} sectores obtenidos`);
    } catch (error) {
      updateResult('sectores', `❌ Error: ${error.message}`);
      toast.error('Error obteniendo sectores');
    } finally {
      setLoading(false);
    }
  };

  const testCrearSector = async () => {
    setLoading(true);
    try {
      const response = await testService.crearSector({
        ...testData.sector,
        nombre: `${testData.sector.nombre} ${Date.now()}`
      });
      updateResult('crearSector', `✅ Sector creado: ${response.sector.nombre}`);
      toast.success('Sector creado exitosamente');
    } catch (error) {
      updateResult('crearSector', `❌ Error: ${error.message}`);
      toast.error('Error creando sector');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PRUEBAS DE INDICIADOS
  // ==========================================
  const testObtenerIndiciados = async () => {
    setLoading(true);
    try {
      const indiciados = await testService.obtenerIndiciados();
      const count = indiciados.length || 0;
      updateResult('indiciados', `✅ ${count} indiciados obtenidos`);
      toast.success(`${count} indiciados obtenidos`);
    } catch (error) {
      updateResult('indiciados', `❌ Error: ${error.message}`);
      toast.error('Error obteniendo indiciados');
    } finally {
      setLoading(false);
    }
  };

  const testCrearIndiciado = async () => {
    setLoading(true);
    try {
      const response = await testService.crearIndiciado({
        ...testData.indiciado,
        cedula: `${Date.now()}`
      });
      updateResult('crearIndiciado', `✅ Indiciado creado: ${response.indiciado.nombre} ${response.indiciado.apellidos}`);
      toast.success('Indiciado creado exitosamente');
    } catch (error) {
      updateResult('crearIndiciado', `❌ Error: ${error.message}`);
      toast.error('Error creando indiciado');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PRUEBAS DE VEHÍCULOS
  // ==========================================
  const testObtenerVehiculos = async () => {
    setLoading(true);
    try {
      const vehiculos = await testService.obtenerVehiculos();
      const count = vehiculos.length || 0;
      updateResult('vehiculos', `✅ ${count} vehículos obtenidos`);
      toast.success(`${count} vehículos obtenidos`);
    } catch (error) {
      updateResult('vehiculos', `❌ Error: ${error.message}`);
      toast.error('Error obteniendo vehículos');
    } finally {
      setLoading(false);
    }
  };

  const testCrearVehiculo = async () => {
    setLoading(true);
    try {
      const response = await testService.crearVehiculo({
        ...testData.vehiculo,
        placa: `TST${Date.now().toString().slice(-3)}`
      });
      updateResult('crearVehiculo', `✅ Vehículo creado: ${response.vehiculo.marca} ${response.vehiculo.linea || response.vehiculo.modelo}`);
      toast.success('Vehículo creado exitosamente');
    } catch (error) {
      updateResult('crearVehiculo', `❌ Error: ${error.message}`);
      toast.error('Error creando vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🐘 Pruebas PostgreSQL Frontend</Title>

      <TestSection>
        <SectionTitle>📁 Sectores</SectionTitle>
        <div>
          <Button onClick={testObtenerSectores} disabled={loading}>
            Obtener Sectores
          </Button>
          <Button onClick={testCrearSector} disabled={loading}>
            Crear Sector Test
          </Button>
        </div>
        <Results>
          <div><strong>Obtener:</strong> {results.sectores || 'No ejecutado'}</div>
          <div><strong>Crear:</strong> {results.crearSector || 'No ejecutado'}</div>
        </Results>
      </TestSection>

      <TestSection>
        <SectionTitle>👤 Indiciados</SectionTitle>
        <div>
          <Button onClick={testObtenerIndiciados} disabled={loading}>
            Obtener Indiciados
          </Button>
          <Button onClick={testCrearIndiciado} disabled={loading}>
            Crear Indiciado Test
          </Button>
        </div>
        <Results>
          <div><strong>Obtener:</strong> {results.indiciados || 'No ejecutado'}</div>
          <div><strong>Crear:</strong> {results.crearIndiciado || 'No ejecutado'}</div>
        </Results>
      </TestSection>

      <TestSection>
        <SectionTitle>🚗 Vehículos</SectionTitle>
        <div>
          <Button onClick={testObtenerVehiculos} disabled={loading}>
            Obtener Vehículos
          </Button>
          <Button onClick={testCrearVehiculo} disabled={loading}>
            Crear Vehículo Test
          </Button>
        </div>
        <Results>
          <div><strong>Obtener:</strong> {results.vehiculos || 'No ejecutado'}</div>
          <div><strong>Crear:</strong> {results.crearVehiculo || 'No ejecutado'}</div>
        </Results>
      </TestSection>

      <TestSection>
        <SectionTitle>🔥 Prueba Rápida - Todos los Módulos</SectionTitle>
        <Button 
          onClick={async () => {
            await testObtenerSectores();
            await testObtenerIndiciados();
            await testObtenerVehiculos();
            toast.success('Todas las pruebas de lectura completadas');
          }} 
          disabled={loading}
        >
          Probar Obtener Todos
        </Button>
        <Button 
          onClick={async () => {
            await testCrearSector();
            await testCrearIndiciado();
            await testCrearVehiculo();
            toast.success('Todas las pruebas de creación completadas');
          }} 
          disabled={loading}
        >
          Probar Crear Todos
        </Button>
      </TestSection>

      {loading && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div>⏳ Ejecutando prueba...</div>
        </div>
      )}
    </Container>
  );
};

export default TestPostgreSQL;
