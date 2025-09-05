import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Indiciado, IndiciadosResponse } from '../types/indiciado';
import { IndiciadoService } from '../services/indiciadoService';

export const IndiciadosList: React.FC = () => {
  const navigate = useNavigate();
  const [indiciados, setIndiciados] = useState<Indiciado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalIndiciados, setTotalIndiciados] = useState(0);

  const loadIndiciados = async (page = 1, search = '') => {
    try {
      setLoading(true);
      let response: IndiciadosResponse;
      
      if (search.trim()) {
        // Si hay búsqueda, usar el endpoint de búsqueda
        const searchResults = await IndiciadoService.buscar(search);
        response = {
          indiciados: searchResults,
          total: searchResults.length,
          page: 1,
          pages: 1,
          pagination: {
            current: 1,
            pages: 1,
            total: searchResults.length
          }
        };
      } else {
        // Si no, usar el endpoint normal con paginación
        response = await IndiciadoService.obtenerTodos(page, 10, search);
      }
      
      setIndiciados(response.indiciados);
      setCurrentPage(response.pagination?.current || response.page);
      setTotalPages(response.pagination?.pages || response.pages);
      setTotalIndiciados(response.pagination?.total || response.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al cargar indiciados');
      console.error('Error cargando indiciados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndiciados(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadIndiciados(1, searchTerm);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        await IndiciadoService.eliminar(id);
        alert('Indiciado eliminado exitosamente');
        loadIndiciados(currentPage, searchTerm);
      } catch (error: any) {
        alert(`Error al eliminar: ${error.response?.data?.msg || error.message}`);
      }
    }
  };

  const handleEdit = (id: string) => {
    console.log('🔄 Navegando a editar indiciado:', id);
    navigate(`/indiciados/${id}/edit`);
  };

  const handleViewDetails = (id: string) => {
    // Navegar a la página de detalles - por ahora mostrar alerta
    alert(`Funcionalidad de ver detalles para ID: ${id} - Próximamente implementaremos la navegación`);
    // TODO: Implementar navegación a página de detalles
    // navigate(`/indiciados/${id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        fontSize: '18px'
      }}>
        Cargando indiciados...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fca5a5',
        borderRadius: '8px',
        color: '#dc2626',
        textAlign: 'center'
      }}>
        <p>{error}</p>
        <button 
          onClick={() => loadIndiciados(currentPage, searchTerm)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '2px solid #4f46e5'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <User size={32} style={{ color: '#4f46e5' }} />
          Lista de Indiciados
        </h1>
        
        <Link
          to="/indiciados/new"
          style={{
            padding: '12px 24px',
            backgroundColor: '#4f46e5',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}
        >
          <Plus size={16} />
          Nuevo Indiciado
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, apellidos, alias o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '12px 20px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Buscar
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                loadIndiciados(1, '');
              }}
              style={{
                padding: '12px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </form>

      {/* Results count */}
      <div style={{
        marginBottom: '20px',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        {totalIndiciados > 0 ? (
          `Mostrando ${indiciados.length} de ${totalIndiciados} indiciados`
        ) : (
          'No se encontraron indiciados'
        )}
      </div>

      {/* List */}
      {indiciados.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#6b7280'
        }}>
          <User size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
          <p style={{ fontSize: '18px', margin: 0 }}>
            {searchTerm ? 'No se encontraron resultados' : 'No hay indiciados registrados'}
          </p>
          {!searchTerm && (
            <Link
              to="/indiciados/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#4f46e5',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                marginTop: '20px',
                fontWeight: '500'
              }}
            >
              <Plus size={16} />
              Crear Primer Indiciado
            </Link>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {indiciados.map((indiciado) => (
            <div
              key={indiciado.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '20px',
                alignItems: 'center'
              }}
            >
              {/* Photo */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {indiciado.fotoUrl || indiciado.foto?.filename ? (
                  <img
                    src={IndiciadoService.obtenerUrlFoto(indiciado.foto?.filename) || indiciado.fotoUrl || ''}
                    alt={indiciado.nombreCompleto || 'Foto de indiciado'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.removeAttribute('style');
                    }}
                  />
                ) : (
                  <User size={24} style={{ color: '#6b7280' }} />
                )}
              </div>

              {/* Info */}
              <div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {indiciado.nombreCompleto || `${indiciado.nombre} ${indiciado.apellidos}`}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {indiciado.alias && (
                    <div>
                      <strong>Alias:</strong> {indiciado.alias}
                    </div>
                  )}
                  {indiciado.documentoIdentidad?.numero && (
                    <div>
                      <strong>Documento:</strong> {indiciado.documentoIdentidad.numero}
                    </div>
                  )}
                  {indiciado.edad && (
                    <div>
                      <strong>Edad:</strong> {indiciado.edad} años
                    </div>
                  )}
                  {indiciado.sectorQueOpera && (
                    <div>
                      <strong>Sector:</strong> {indiciado.sectorQueOpera}
                    </div>
                  )}
                  <div>
                    <strong>Creado:</strong> {formatDate(indiciado.createdAt)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  title="Ver detalles"
                  style={{
                    padding: '8px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={() => handleViewDetails(indiciado.id!)}
                >
                  <Eye size={16} />
                </button>
                
                <button
                  title="Editar"
                  style={{
                    padding: '8px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={() => handleEdit(indiciado.id!)}
                >
                  <Edit size={16} />
                </button>
                
                <button
                  title="Eliminar"
                  style={{
                    padding: '8px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={() => handleDelete(
                    indiciado.id!,
                    indiciado.nombreCompleto || `${indiciado.nombre} ${indiciado.apellidos}`
                  )}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage <= 1 ? '#f9fafb' : '#ffffff',
              color: currentPage <= 1 ? '#6b7280' : '#374151',
              borderRadius: '4px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Anterior
          </button>
          
          <span style={{
            padding: '8px 16px',
            color: '#374151',
            fontWeight: '500'
          }}>
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage >= totalPages ? '#f9fafb' : '#ffffff',
              color: currentPage >= totalPages ? '#6b7280' : '#374151',
              borderRadius: '4px',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
