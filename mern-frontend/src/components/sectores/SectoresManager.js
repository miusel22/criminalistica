import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Plus, 
  Search, 
  FolderPlus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Eye,
  Car,
  Filter,
  Grid,
  List,
  ArrowUp,
  ArrowDown,
  Home,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import sectoresService from '../../services/sectoresService';
import ItemForm from './ItemForm';
import SectoresStats from './SectoresStats';
import { IndiciadoForm } from '../IndiciadoForm';
import { IndiciadoService } from '../../services/indiciadoService';
import { VehiculoService } from '../../services/vehiculoService';
import VehiculoForm from '../vehiculos/VehiculoForm';
import { transformBackendDataToFormData } from '../../utils/indiciadoTransforms';

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.75rem;
`;

const Description = styled.p`
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 1rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const Button = styled.button`
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const PrimaryButton = styled(Button)`
  background: #007bff;
  color: white;
  
  &:hover {
    background: #0056b3;
  }
`;

const Content = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HierarchyContainer = styled.div`
  padding: 1.5rem;
`;

const HierarchyItem = styled.div`
  margin-bottom: 0.5rem;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const ItemRowExpanded = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  gap: 16px;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  display: flex;
  align-items: center;
  margin-right: 8px;
  
  &:hover {
    color: #333;
  }
`;

const ItemIcon = styled.div`
  margin-right: 12px;
  color: ${props => {
    switch(props.type) {
      case 'sector': return '#007bff';
      case 'subsector': return '#28a745';
      case 'indiciado': return '#ffc107';
      case 'vehiculo': return '#17a2b8';
      default: return '#666';
    }
  }};
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  margin: 0 0 4px 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
`;

const ItemDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    color: #333;
  }
  
  &.edit:hover {
    color: #007bff;
  }
  
  &.delete:hover {
    color: #dc3545;
  }
`;

const ChildrenContainer = styled.div`
  margin-left: ${props => props.level * 24}px;
  border-left: 2px solid #e9ecef;
  padding-left: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ddd;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

// Styled components para el modal de detalles
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: auto;
  margin: 2rem;
`;

const ModalHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  
  &:hover {
    background: #f8f9fa;
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const DetailSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
  align-items: start;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #495057;
`;

const DetailValue = styled.span`
  color: #333;
  word-wrap: break-word;
`;

const ImageContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImageWrapper = styled.div`
  text-align: center;
`;

const Image = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ImageLabel = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #666;
`;

// Styled components para mostrar indiciados con imágenes
const IndiciadoPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const IndiciadoImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  background: #f8f9fa;
`;

const IndiciadoImagePlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 18px;
  font-weight: 600;
`;

const IndiciadoInfo = styled.div`
  flex: 1;
`;

const IndiciadoMainInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const IndiciadoName = styled.h4`
  margin: 0;
  color: #333;
  font-size: 0.95rem;
  font-weight: 600;
`;

const IndiciadoBadge = styled.span`
  background: ${props => props.status === 'activo' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.status === 'activo' ? '#155724' : '#721c24'};
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const IndiciadoDetails = styled.div`
  color: #666;
  font-size: 0.8rem;
  line-height: 1.3;
`;

const IndiciadoMeta = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 4px;
`;

const IndiciadoMetaItem = styled.span`
  color: #6c757d;
  font-size: 0.75rem;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
`;

const SectoresManager = () => {
  const navigate = useNavigate();
  
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('sector');
  const [editingItem, setEditingItem] = useState(null);
  const [parentItem, setParentItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showFullIndiciadoForm, setShowFullIndiciadoForm] = useState(false);

  useEffect(() => {
    loadHierarchy();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      // Get sectores with their children (subsectores and indiciados)
      const data = await sectoresService.getSectores(true);
      
      console.log('✅ Loaded hierarchy data:', data);
      setHierarchy(data);
    } catch (error) {
      console.error('❌ Error loading hierarchy:', error);
      toast.error('Error al cargar los sectores');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      const response = await sectoresService.search(searchTerm);
      setSearchResults(response.resultados || []);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleCreateSector = () => {
    setModalType('sector');
    setEditingItem(null);
    setParentItem(null);
    setShowModal(true);
  };

  const handleCreateSubsector = (sector) => {
    setModalType('subsector');
    setEditingItem(null);
    setParentItem(sector);
    setShowModal(true);
  };

  const handleCreateIndiciado = (subsector) => {
    setParentItem(subsector);
    setEditingItem(null);
    setShowFullIndiciadoForm(true);
  };

  const handleEdit = (item) => {
    if (item.type === 'indiciado') {
      // Para indiciados, usar la función especializada
      handleEditIndiciado(item);
    } else {
      setModalType(item.type);
      setEditingItem(item);
      setParentItem(null);
      setShowModal(true);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Está seguro de eliminar este ${item.type}? Esto eliminará también todos sus elementos hijos.`)) {
      return;
    }

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
        default:
          break;
      }
      
      toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} eliminado exitosamente`);
      loadHierarchy();
    } catch (error) {
      toast.error('Error al eliminar el elemento');
      console.error(error);
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      setModalLoading(true);
      
      if (editingItem) {
        // Actualizar
        switch (editingItem.type) {
          case 'sector':
            await sectoresService.updateSector(editingItem.id, formData);
            break;
          case 'subsector':
            await sectoresService.updateSubsector(editingItem.id, formData);
            break;
          case 'indiciado':
            await sectoresService.updateIndiciado(editingItem.id, formData);
            break;
          default:
            break;
        }
        toast.success(`${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)} actualizado exitosamente`);
      } else {
        // Crear
        switch (modalType) {
          case 'sector':
            await sectoresService.createSector(formData);
            toast.success('Sector creado exitosamente');
            break;
          case 'subsector':
            await sectoresService.createSubsector(parentItem.id, formData);
            toast.success('Subsector creado exitosamente');
            break;
          case 'indiciado':
            await sectoresService.createIndiciado(parentItem.id, formData);
            toast.success('Indiciado creado exitosamente');
            break;
          default:
            break;
        }
      }
      
      setShowModal(false);
      loadHierarchy();
    } catch (error) {
      console.error('Error al guardar elemento:', error);
      
      // Manejo específico de errores
      let errorMessage = 'Error al guardar el elemento';
      
      if (error.response) {
        // Error HTTP del servidor
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 409) {
          // Error de conflicto (elemento ya existe)
          errorMessage = data.error || data.message || 'Ya existe un elemento con ese nombre';
        } else if (status === 400) {
          // Error de validación
          errorMessage = data.error || data.message || 'Datos de validación incorrectos';
        } else if (status === 401) {
          // No autorizado
          errorMessage = 'No tiene permisos para realizar esta acción';
        } else if (status === 500) {
          // Error del servidor
          errorMessage = 'Error interno del servidor. Intente nuevamente.';
        } else {
          // Otros errores HTTP
          errorMessage = data.error || data.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        // Error de red/conexión
        errorMessage = 'Error de conexión. Verifique su conexión a internet.';
      } else {
        // Error desconocido
        errorMessage = error.message || 'Error desconocido';
      }
      
      toast.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  // Handlers para el formulario completo de indiciado
  const handleFullIndiciadoSuccess = (indiciado) => {
    const isEditing = modalType === 'edit-indiciado';
    const message = isEditing 
      ? 'Indiciado actualizado exitosamente' 
      : 'Indiciado creado exitosamente con todos los detalles';
    
    toast.success(message);
    setShowFullIndiciadoForm(false);
    loadHierarchy();
  };

  const handleFullIndiciadoCancel = () => {
    setShowFullIndiciadoForm(false);
    setParentItem(null);
    setEditingItem(null);
  };

  // Función auxiliar para encontrar el sector y subsector de un indiciado
  const findIndiciadoHierarchy = (indiciadoId) => {
    for (const sector of hierarchy) {
      if (sector.subsectores) {
        for (const subsector of sector.subsectores) {
          if (subsector.indiciados) {
            const foundIndiciado = subsector.indiciados.find(ind => ind.id === indiciadoId);
            if (foundIndiciado) {
              return {
                sectorId: sector.id,
                subsectorId: subsector.id,
                sector,
                subsector
              };
            }
          }
        }
      }
    }
    return null;
  };

  // Handler para navegar a los detalles del indiciado
  const handleViewIndiciado = (indiciado) => {
    try {
      console.log('🔍 Navegando a detalles del indiciado:', indiciado);
      
      // Validar que tenemos un ID
      if (!indiciado || !indiciado.id) {
        console.error('❌ ID de indiciado no válido:', indiciado);
        toast.error('ID de indiciado no válido');
        return;
      }
      
      // Buscar la jerarquía del indiciado
      const hierarchyInfo = findIndiciadoHierarchy(indiciado.id);
      
      let sectorId, subsectorId;
      if (hierarchyInfo) {
        sectorId = hierarchyInfo.sectorId;
        subsectorId = hierarchyInfo.subsectorId;
        console.log('✅ Jerarquía encontrada:', { sectorId, subsectorId });
      } else {
        // Fallback: usar valores del indiciado si están disponibles
        sectorId = indiciado.sectorId || 'unknown';
        subsectorId = indiciado.subsectorId || 'unknown';
        console.log('⚠️ Usando valores fallback:', { sectorId, subsectorId });
      }
      
      // Navegar a la nueva ruta con parámetros
      const detailPath = `/dashboard/sectores/${sectorId}/subsectores/${subsectorId}/indiciados/${indiciado.id}`;
      console.log('📍 Navegando a:', detailPath);
      
      navigate(detailPath);
    } catch (error) {
      console.error('❌ Error al navegar a detalles del indiciado:', error);
      toast.error('Error al abrir los detalles del indiciado');
    }
  };

  // Handler para editar indiciado (modo edición)
  const handleEditIndiciado = async (indiciado) => {
    try {
      console.log('✏️ Cargando datos para editar indiciado:', indiciado);
      
      // Validar que tenemos un ID
      if (!indiciado || !indiciado.id) {
        console.error('❌ ID de indiciado no válido:', indiciado);
        toast.error('ID de indiciado no válido');
        return;
      }
      
      // Obtener los datos completos del indiciado
      console.log('📡 Llamando a IndiciadoService.getIndiciado con ID:', indiciado.id);
      const fullIndiciadoData = await IndiciadoService.getIndiciado(indiciado.id);
      console.log('✅ Datos completos recibidos para edición:', fullIndiciadoData);
      
      setEditingItem(fullIndiciadoData);
      setParentItem({ id: fullIndiciadoData.subsectorId || indiciado.subsectorId });
      setModalType('edit-indiciado'); // Modo edición
      setShowFullIndiciadoForm(true);
    } catch (error) {
      console.error('❌ Error detallado al cargar indiciado para edición:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        indiciado
      });
      
      const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
      toast.error(`Error al cargar los detalles del indiciado: ${errorMsg}`);
    }
  };

  const renderIcon = (type, expanded = false) => {
    switch (type) {
      case 'sector':
        return expanded ? <FolderOpen size={18} /> : <Folder size={18} />;
      case 'subsector':
        return expanded ? <FolderOpen size={16} /> : <Folder size={16} />;
      case 'indiciado':
        return <FileText size={14} />;
      case 'vehiculo':
        return <Car size={14} />;
      default:
        return <Folder size={16} />;
    }
  };

  // Función auxiliar para obtener URL de imagen
  const getImageUrl = (item) => {
    if (!item.foto) return null;
    
    // Si foto es un objeto, priorizar path (URL de Cloudinary) sobre filename
    if (typeof item.foto === 'object') {
      // Priorizar path que viene de Cloudinary
      if (item.foto.path && item.foto.path.startsWith('https://')) {
        return item.foto.path;
      }
      // Fallback a filename para compatibilidad con archivos antiguos
      if (item.foto.filename) {
        return IndiciadoService.obtenerUrlFoto(item.foto.filename);
      }
    }
    
    // Si foto es un string directo (filename)
    if (typeof item.foto === 'string') {
      return IndiciadoService.obtenerUrlFoto(item.foto);
    }
    
    // Fallback adicional para fotoUrl
    if (item.fotoUrl) {
      return item.fotoUrl;
    }
    
    return null;
  };

  // Función auxiliar para obtener iniciales
  const getInitials = (nombre) => {
    if (!nombre) return '?';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const renderHierarchyItem = (item, level = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = (item.subsectores && item.subsectores.length > 0) || 
                       (item.indiciados && item.indiciados.length > 0) ||
                       (item.vehiculos && item.vehiculos.length > 0);

    // Renderizado especial para indiciados con vista mejorada
    if (item.type === 'indiciado') {
      const imageUrl = getImageUrl(item);
      const initials = getInitials(item.nombre);
      
      return (
        <HierarchyItem key={item.id}>
          <ItemRow>
            <ExpandButton 
              onClick={() => toggleExpanded(item.id)}
              style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </ExpandButton>
            
            <ItemIcon type={item.type}>
              {renderIcon(item.type, isExpanded)}
            </ItemIcon>
            
            <IndiciadoPreview>
              {imageUrl ? (
                <IndiciadoImage 
                  src={imageUrl} 
                  alt={item.nombre}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <IndiciadoImagePlaceholder>
                  {initials}
                </IndiciadoImagePlaceholder>
              )}
              
              <IndiciadoInfo>
                <IndiciadoMainInfo>
                  <IndiciadoName>
                    {item.alias ? item.alias : (item.nombre + ' ' + (item.apellidos || ''))}
                  </IndiciadoName>
                  {item.estado && (
                    <IndiciadoBadge status={item.estado.toLowerCase()}>
                      {item.estado}
                    </IndiciadoBadge>
                  )}
                </IndiciadoMainInfo>
                <IndiciadoDetails>
                  {item.documentoIdentidad?.numero ? (
                    `Doc: ${item.documentoIdentidad.numero}`
                  ) : (
                    'Sin documento'
                  )}
                  {item.alias && item.nombre && (
                    <> • {item.nombre} {item.apellidos || ''}</>
                  )}
                </IndiciadoDetails>
                {(item.edad || item.genero || item.sectorQueOpera) && (
                  <IndiciadoMeta>
                    {item.edad && <IndiciadoMetaItem>Edad: {item.edad}</IndiciadoMetaItem>}
                    {item.genero && <IndiciadoMetaItem>{item.genero}</IndiciadoMetaItem>}
                    {item.sectorQueOpera && <IndiciadoMetaItem>{item.sectorQueOpera}</IndiciadoMetaItem>}
                  </IndiciadoMeta>
                )}
              </IndiciadoInfo>
            </IndiciadoPreview>
            
            <ItemActions>
              <ActionButton 
                className="view"
                onClick={() => handleViewIndiciado(item)}
                title="Ver detalles completos"
                style={{ color: '#17a2b8' }}
              >
                <Eye size={16} />
              </ActionButton>
              <ActionButton 
                className="edit"
                onClick={() => handleEdit(item)}
                title="Editar"
              >
                <Edit size={16} />
              </ActionButton>
              <ActionButton 
                className="delete"
                onClick={() => handleDelete(item)}
                title="Eliminar"
              >
                <Trash2 size={16} />
              </ActionButton>
            </ItemActions>
          </ItemRow>
        </HierarchyItem>
      );
    }

    // Renderizado normal para sectores y subsectores
    return (
      <HierarchyItem key={item.id}>
        <ItemRow>
          <ExpandButton 
            onClick={() => toggleExpanded(item.id)}
            style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </ExpandButton>
          
          <ItemIcon type={item.type}>
            {renderIcon(item.type, isExpanded)}
          </ItemIcon>
          
          <ItemInfo>
            <ItemName>{item.nombre}</ItemName>
            {item.descripcion && (
              <ItemDescription>{item.descripcion}</ItemDescription>
            )}
          </ItemInfo>
          
          <ItemActions>
            {item.type === 'sector' && (
              <ActionButton 
                onClick={() => handleCreateSubsector(item)}
                title="Agregar subsector"
              >
                <FolderPlus size={16} />
              </ActionButton>
            )}
            {item.type === 'subsector' && (
              <ActionButton 
                onClick={() => handleCreateIndiciado(item)}
                title="Agregar indiciado"
              >
                <Plus size={16} />
              </ActionButton>
            )}
            <ActionButton 
              className="edit"
              onClick={() => handleEdit(item)}
              title="Editar"
            >
              <Edit size={16} />
            </ActionButton>
            <ActionButton 
              className="delete"
              onClick={() => handleDelete(item)}
              title="Eliminar"
            >
              <Trash2 size={16} />
            </ActionButton>
          </ItemActions>
        </ItemRow>
        
        {isExpanded && hasChildren && (
          <ChildrenContainer level={level}>
            {item.subsectores?.map(subsector => renderHierarchyItem(subsector, level + 1))}
            {item.indiciados?.map(indiciado => renderHierarchyItem(indiciado, level + 1))}
            {item.vehiculos?.map(vehiculo => renderHierarchyItem(vehiculo, level + 1))}
          </ChildrenContainer>
        )}
      </HierarchyItem>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingState>
          <div>Cargando jerarquía...</div>
        </LoadingState>
      );
    }

    if (searchTerm && searchResults.length > 0) {
      return (
        <HierarchyContainer>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            Resultados de búsqueda ({searchResults.length})
          </h3>
          {searchResults.map(item => renderHierarchyItem(item))}
        </HierarchyContainer>
      );
    }

    if (hierarchy.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>📁</EmptyIcon>
          <h3>No hay sectores creados</h3>
          <p>Crea tu primer sector para comenzar a organizar la información</p>
          <PrimaryButton onClick={handleCreateSector} style={{ marginTop: '1rem' }}>
            <Plus size={18} />
            Crear Primer Sector
          </PrimaryButton>
        </EmptyState>
      );
    }

    return (
      <HierarchyContainer>
        {hierarchy.map(sector => renderHierarchyItem(sector))}
      </HierarchyContainer>
    );
  };


  return (
    <Container>
      <Header>
        <Title>Gestión de Sectores</Title>
        <Description>
          Organiza la información en una estructura jerárquica de Sectores → Subsectores → Indiciados
        </Description>
        <Controls>
          <SearchContainer>
            <SearchIcon size={18} />
            <SearchInput
              type="text"
              placeholder="Buscar en sectores, subsectores e indiciados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <PrimaryButton onClick={handleCreateSector}>
            <Plus size={18} />
            Nuevo Sector
          </PrimaryButton>
        </Controls>
      </Header>

      <SectoresStats />

      <Content>
        {renderContent()}
      </Content>

      <ItemForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        item={editingItem}
        loading={modalLoading}
        type={modalType}
      />

      {showFullIndiciadoForm && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1001,
          overflow: 'auto'
        }}>
        <IndiciadoForm
            initialData={{
              subsectorId: parentItem?.id,
              ...((modalType === 'view-indiciado' || modalType === 'edit-indiciado') && editingItem ? transformBackendDataToFormData(editingItem) : {})
            }}
            readOnly={modalType === 'view-indiciado'}
            isEdit={modalType === 'edit-indiciado'}
            onSuccess={handleFullIndiciadoSuccess}
            onCancel={handleFullIndiciadoCancel}
          />
        </div>
      )}

    </Container>
  );
};

export default SectoresManager;
