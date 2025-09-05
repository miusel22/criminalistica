import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Folder, FolderOpen, FileText, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import sectoresService from '../../services/sectoresService';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #555;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #0056b3;
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  
  &:hover {
    background: #545b62;
  }
`;

const DangerButton = styled(Button)`
  background: #dc3545;
  
  &:hover {
    background: #c82333;
  }
`;

const ItemList = styled.div`
  margin-top: 1rem;
`;

const Item = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  
  &:hover {
    background: #f8f9fa;
    color: #333;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
`;

const StatLabel = styled.div`
  color: #666;
  margin-top: 0.5rem;
`;

const SectoresDemo = () => {
  const [sectores, setSectores] = useState([]);
  const [stats, setStats] = useState({ sectores: 0, subsectores: 0, indiciados: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await sectoresService.getSectores(true);
      setSectores(data);
      
      // Calculate stats
      let subsectores = 0;
      let indiciados = 0;
      
      data.forEach(sector => {
        if (sector.subsectores) {
          subsectores += sector.subsectores.length;
          sector.subsectores.forEach(subsector => {
            if (subsector.indiciados) {
              indiciados += subsector.indiciados.length;
            }
          });
        }
      });
      
      setStats({
        sectores: data.length,
        subsectores,
        indiciados
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const createSampleSector = async () => {
    try {
      await sectoresService.createSector({
        nombre: `Sector de Prueba ${Date.now()}`,
        descripcion: 'Sector creado para demostración',
        departamentoId: '11',
        ciudadId: '11001'
      });
      toast.success('Sector creado');
      loadData();
    } catch (error) {
      toast.error('Error al crear sector');
    }
  };

  const createSampleSubsector = async (sectorId) => {
    try {
      await sectoresService.createSubsector(sectorId, {
        nombre: `Subsector ${Date.now()}`,
        descripcion: 'Subsector de ejemplo'
      });
      toast.success('Subsector creado');
      loadData();
    } catch (error) {
      toast.error('Error al crear subsector');
    }
  };

  const createSampleIndiciado = async (subsectorId) => {
    try {
      await sectoresService.createIndiciado(subsectorId, {
        nombre: `Indiciado ${Date.now()}`,
        descripcion: 'Indiciado de ejemplo'
      });
      toast.success('Indiciado creado');
      loadData();
    } catch (error) {
      toast.error('Error al crear indiciado');
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`¿Eliminar ${item.nombre}?`)) return;
    
    try {
      switch (item.type) {
        case 'sector':
          await sectoresService.deleteSector(item.id);
          break;
        case 'subsector':
          await sectoresService.deleteSubsector(item.id);
          break;
        case 'indiciado':
          await sectoresService.deleteIndiciado(item.id);
          break;
      }
      toast.success('Elemento eliminado');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'sector': return <Folder size={18} color="#007bff" />;
      case 'subsector': return <FolderOpen size={16} color="#28a745" />;
      case 'indiciado': return <FileText size={14} color="#ffc107" />;
      default: return null;
    }
  };

  if (loading) {
    return <Container><div>Cargando...</div></Container>;
  }

  return (
    <Container>
      <Title>Sectores Module - Clean Implementation</Title>
      
      <Stats>
        <StatCard>
          <StatValue>{stats.sectores}</StatValue>
          <StatLabel>Sectores</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.subsectores}</StatValue>
          <StatLabel>Subsectores</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.indiciados}</StatValue>
          <StatLabel>Indiciados</StatLabel>
        </StatCard>
      </Stats>

      <Section>
        <SectionTitle>Actions</SectionTitle>
        <Button onClick={createSampleSector}>
          <Plus size={16} />
          Create Sample Sector
        </Button>
        <SecondaryButton onClick={loadData}>
          Refresh Data
        </SecondaryButton>
      </Section>

      <Section>
        <SectionTitle>Hierarchy (Sectores → Subsectores → Indiciados)</SectionTitle>
        
        {sectores.length === 0 ? (
          <p>No sectors found. Create one to get started!</p>
        ) : (
          <ItemList>
            {sectores.map(sector => (
              <div key={sector.id}>
                <Item>
                  <ItemInfo>
                    {renderIcon(sector.type)}
                    <div>
                      <strong>{sector.nombre}</strong>
                      {sector.descripcion && <div style={{fontSize: '0.9em', color: '#666'}}>{sector.descripcion}</div>}
                    </div>
                  </ItemInfo>
                  <ItemActions>
                    <ActionButton onClick={() => createSampleSubsector(sector.id)}>
                      <Plus size={14} />
                    </ActionButton>
                    <ActionButton onClick={() => deleteItem(sector)}>
                      <Trash2 size={14} />
                    </ActionButton>
                  </ItemActions>
                </Item>
                
                {sector.subsectores && sector.subsectores.map(subsector => (
                  <div key={subsector.id} style={{marginLeft: '2rem'}}>
                    <Item>
                      <ItemInfo>
                        {renderIcon(subsector.type)}
                        <div>
                          <strong>{subsector.nombre}</strong>
                          {subsector.descripcion && <div style={{fontSize: '0.9em', color: '#666'}}>{subsector.descripcion}</div>}
                        </div>
                      </ItemInfo>
                      <ItemActions>
                        <ActionButton onClick={() => createSampleIndiciado(subsector.id)}>
                          <Plus size={14} />
                        </ActionButton>
                        <ActionButton onClick={() => deleteItem(subsector)}>
                          <Trash2 size={14} />
                        </ActionButton>
                      </ItemActions>
                    </Item>
                    
                    {subsector.indiciados && subsector.indiciados.map(indiciado => (
                      <div key={indiciado.id} style={{marginLeft: '4rem'}}>
                        <Item>
                          <ItemInfo>
                            {renderIcon(indiciado.type)}
                            <div>
                              <strong>{indiciado.nombre}</strong>
                              {indiciado.descripcion && <div style={{fontSize: '0.9em', color: '#666'}}>{indiciado.descripcion}</div>}
                            </div>
                          </ItemInfo>
                          <ItemActions>
                            <ActionButton onClick={() => deleteItem(indiciado)}>
                              <Trash2 size={14} />
                            </ActionButton>
                          </ItemActions>
                        </Item>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </ItemList>
        )}
      </Section>
    </Container>
  );
};

export default SectoresDemo;
