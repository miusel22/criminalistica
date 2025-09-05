import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Car,
  User,
  Folder,
  FolderOpen,
  Home,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDeleteConfirmation } from '../../hooks/useConfirmation';

// Services
import sectoresService from '../../services/sectoresService';
import { IndiciadoService } from '../../services/indiciadoService';
import { VehiculoService } from '../../services/vehiculoService';

// Simple styles without theme complexity
const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  display: 'flex',
  flexDirection: 'column'
};

const topBarStyle = {
  background: 'white',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  borderBottom: '1px solid #e2e8f0',
  padding: '1rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
  zIndex: 100,
  position: 'sticky',
  top: 0
};

const breadcrumbStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#64748b',
  fontSize: '0.9rem',
  flex: 1,
  minWidth: '200px'
};

const searchContainerStyle = {
  position: 'relative',
  minWidth: '300px',
  flex: 1,
  maxWidth: '500px'
};

const searchInputStyle = {
  width: '100%',
  padding: '0.75rem 1rem 0.75rem 2.5rem',
  border: '2px solid #e2e8f0',
  borderRadius: '25px',
  fontSize: '0.9rem',
  background: 'white',
  color: '#1f2937'
};

const searchIconStyle = {
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#9ca3af',
  pointerEvents: 'none'
};

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap'
};

const primaryButtonStyle = {
  ...buttonStyle,
  background: '#3b82f6',
  color: 'white'
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: 'white',
  color: '#64748b',
  border: '2px solid #e2e8f0'
};

const mainContentStyle = {
  flex: 1,
  padding: '2rem',
  display: 'flex',
  gap: '2rem'
};

const contentAreaStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '1rem'
};

const statCardStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '1.5rem',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
};

const hierarchyAreaStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  flex: 1,
  display: 'flex',
  flexDirection: 'column'
};

const hierarchyHeaderStyle = {
  padding: '1.5rem',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#f8fafc'
};

const hierarchyContentStyle = {
  flex: 1,
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 400px)'
};

const expandableItemStyle = {
  borderBottom: '1px solid #e2e8f0'
};

const expandableHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem 1.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const expandableContentStyle = (isExpanded) => ({
  paddingLeft: '3rem',
  borderTop: '1px solid #e2e8f0',
  background: '#f8fafc',
  display: isExpanded ? 'block' : 'none'
});

const childItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #e2e8f0',
  transition: 'all 0.2s'
};

const actionButtonStyle = {
  padding: '0.5rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  marginLeft: '0.25rem'
};

const editButtonStyle = {
  ...actionButtonStyle,
  background: '#f59e0b',
  color: 'white'
};

const deleteButtonStyle = {
  ...actionButtonStyle,
  background: '#dc2626',
  color: 'white'
};

const viewButtonStyle = {
  ...actionButtonStyle,
  background: '#06b6d4',
  color: 'white'
};

export default function SectoresManager() {
  const navigate = useNavigate();
  const { confirmDelete, ConfirmationComponent } = useDeleteConfirmation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample data for demo
  const [sampleHierarchy] = useState([
    {
      id: 1,
      nombre: 'Sector Antioquia - Amalfi',
      tipo: 'sector',
      elementos: 1,
      subsectores: [
        {
          id: 11,
          nombre: 'Subsector Centro',
          tipo: 'subsector',
          elementos: 2,
          indiciados: [
            { id: 111, nombre: 'Juan Pérez', tipo: 'indiciado', cedula: '12345678' },
            { id: 112, nombre: 'Ana García', tipo: 'indiciado', cedula: '87654321' }
          ]
        }
      ]
    },
    {
      id: 2,
      nombre: 'Sector Antioquia - Armenia',
      tipo: 'sector',
      elementos: 0,
      subsectores: []
    },
    {
      id: 3,
      nombre: 'Sector Antioquia - Medellín',
      tipo: 'sector',
      elementos: 1,
      subsectores: [
        {
          id: 31,
          nombre: 'Subsector Norte',
          tipo: 'subsector',
          elementos: 1,
          vehiculos: [
            { id: 311, nombre: 'Toyota Corolla ABC123', tipo: 'vehiculo', placa: 'ABC123' }
          ]
        }
      ]
    },
    {
      id: 4,
      nombre: 'Sector Antioquia - Medellín',
      tipo: 'sector',
      elementos: 1,
      subsectores: []
    }
  ]);
  
  const loadHierarchy = async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHierarchy(sampleHierarchy);
    } catch (error) {
      console.error('Error loading hierarchy:', error);
      toast.error('Error al cargar los sectores');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (item) => {
    const confirmed = await confirmDelete(`el ${item.tipo} \"${item.nombre}\"`);
    if (confirmed) {
      try {
        // Aquí iría la lógica de eliminación real
        toast.success(`El ${item.tipo} ha sido eliminado`);
        loadHierarchy(); // Recargar datos
      } catch (error) {
        toast.error('Error al eliminar el elemento');
      }
    }
  };
  
  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };
  
  const filteredHierarchy = useMemo(() => {
    let filtered = hierarchy;
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Ordenamiento por nombre
    filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    return filtered;
  }, [hierarchy, searchTerm]);
  
  // Stats calculation
  const stats = useMemo(() => {
    const sectores = hierarchy.filter(h => h.tipo === 'sector').length;
    const subsectores = hierarchy.reduce((acc, h) => acc + (h.subsectores?.length || 0), 0);
    const indiciados = hierarchy.reduce((acc, h) => 
      acc + h.subsectores?.reduce((subAcc, sub) => 
        subAcc + (sub.indiciados?.length || 0), 0) || 0, 0);
    const vehiculos = hierarchy.reduce((acc, h) => 
      acc + h.subsectores?.reduce((subAcc, sub) => 
        subAcc + (sub.vehiculos?.length || 0), 0) || 0, 0);
    
    return { sectores, subsectores, indiciados, vehiculos };
  }, [hierarchy]);

  useEffect(() => {
    loadHierarchy();
  }, []);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <ConfirmationComponent />
      <div style={topBarStyle}>
        <div style={breadcrumbStyle}>
          <span 
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#3b82f6' }}
            onClick={() => navigate('/dashboard')}
          >
            <Home size={16} />
            Inicio
          </span>
          <ChevronRight size={14} />
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Folder size={16} />
            Gestión de Sectores
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={searchContainerStyle}>
            <Search size={18} style={searchIconStyle} />
            <input
              style={searchInputStyle}
              type="text"
              placeholder="Buscar sectores, subsectores, indiciados, vehículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button style={primaryButtonStyle}>
            <Plus size={18} />
            Nuevo Sector
          </button>
        </div>
      </div>

      <div style={mainContentStyle}>
        <div style={contentAreaStyle}>
          <div style={statsContainerStyle}>
            <div style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Folder size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
                    {stats.sectores}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                    Sectores
                  </div>
                </div>
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: '#10b981',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FolderOpen size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
                    {stats.subsectores}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                    Subsectores
                  </div>
                </div>
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: '#f59e0b',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
                    {stats.indiciados}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                    Indiciados
                  </div>
                </div>
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: '#06b6d4',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Car size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
                    {stats.vehiculos}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                    Vehículos
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={hierarchyAreaStyle}>
            <div style={hierarchyHeaderStyle}>
              <h3 style={{ color: '#1f2937', margin: 0 }}>Estructura Jerárquica</h3>
            </div>

            <div style={hierarchyContentStyle}>
              {filteredHierarchy.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4rem 2rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>🗂️</div>
                  <h3 style={{ color: '#1f2937' }}>No se encontraron elementos</h3>
                  <p style={{ color: '#64748b' }}>
                    {searchTerm ? 'No hay elementos que coincidan con la búsqueda' : 'Crea tu primer sector para comenzar'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredHierarchy.map(sector => (
                    <div key={sector.id} style={expandableItemStyle}>
                      <div 
                        style={{
                          ...expandableHeaderStyle,
                          ':hover': { background: '#f8fafc' }
                        }}
                        onClick={() => toggleExpanded(sector.id)}
                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                          {expandedItems.has(sector.id) ? (
                            <ChevronDown size={16} style={{ color: '#64748b' }} />
                          ) : (
                            <ChevronRight size={16} style={{ color: '#64748b' }} />
                          )}
                        </div>
                        <div style={{ 
                          width: '32px', 
                          height: '32px',
                          background: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          marginRight: '1rem'
                        }}>
                          <Folder size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#1f2937', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {sector.nombre}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            sector • {sector.subsectores?.length || 0} subsectores • {sector.elementos} elementos
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            style={viewButtonStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Lógica para ver detalles
                              toast.success(`Viendo detalles de ${sector.nombre}`);
                            }}
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            style={editButtonStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Lógica para editar
                              toast.success(`Editando ${sector.nombre}`);
                            }}
                            title="Editar sector"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            style={deleteButtonStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(sector);
                            }}
                            title="Eliminar sector"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {sector.subsectores && sector.subsectores.length > 0 && (
                        <div style={expandableContentStyle(expandedItems.has(sector.id))}>
                          {sector.subsectores.map(subsector => (
                            <div key={subsector.id} style={childItemStyle}>
                              <div style={{ 
                                width: '24px', 
                                height: '24px',
                                background: '#10b981',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                marginRight: '0.75rem'
                              }}>
                                <FolderOpen size={16} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  color: '#1f2937',
                                  fontWeight: '600',
                                  fontSize: '0.9rem',
                                  marginBottom: '0.25rem'
                                }}>
                                  {subsector.nombre}
                                </div>
                                <div style={{ 
                                  color: '#64748b',
                                  fontSize: '0.8rem'
                                }}>
                                  subsector • {(subsector.indiciados?.length || 0) + (subsector.vehiculos?.length || 0)} elementos
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <button
                                  style={viewButtonStyle}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success(`Viendo detalles de ${subsector.nombre}`);
                                  }}
                                  title="Ver detalles"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  style={editButtonStyle}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success(`Editando ${subsector.nombre}`);
                                  }}
                                  title="Editar subsector"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  style={deleteButtonStyle}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(subsector);
                                  }}
                                  title="Eliminar subsector"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
