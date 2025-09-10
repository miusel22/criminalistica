import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme/theme';
import { 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Car,
  User,
  Folder,
  FolderOpen,
  FileText,
  Home,
  ChevronRight,
  ChevronDown,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  Info,
  ArrowLeft,
  Menu,
  X,
  MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import SectoresService from '../../services/sectoresService';
import { IndiciadoService } from '../../services/indiciadoService';
import { VehiculoService } from '../../services/vehiculoService';

// Debug utilities
import '../../utils/debugSectorError.js';

// Custom confirmation modals
import { 
  useDeleteSectorConfirmation, 
  useDeleteSubsectorConfirmation, 
  useDeleteIndiciadoConfirmation, 
  useDeleteVehiculoConfirmation 
} from '../../hooks/useCustomConfirmation';

// Components
import { IndiciadoForm } from '../IndiciadoForm';
import VehiculoForm from '../vehiculos/VehiculoForm';
import ItemForm from './ItemForm';
import SectoresStats from './SectoresStats';
import { transformBackendDataToFormData } from '../../utils/indiciadoTransforms';

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.name === 'dark' 
      ? `linear-gradient(135deg, ${theme.colors.background} 0%, #0f1419 100%)`
      : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
  }};
  display: flex;
  flex-direction: column;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const TopBar = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.headerBg;
  }};
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.sm;
  }};
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  z-index: 100;
  position: sticky;
  top: 0;
  transition: ${props => {
    const theme = getTheme(props.$theme);
    return theme.transitions.normal;
  }};
`;

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  flex: 1;
  min-width: 200px;
`;

const BreadcrumbItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  color: ${props => props.clickable ? '#007bff' : '#666'};
  transition: color 0.2s;
  
  &:hover {
    color: ${props => props.clickable ? '#0056b3' : '#666'};
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
`;

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  min-width: 300px;
  flex: 1;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 0.9rem;
  background: #f8f9fa;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
`;

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
`;

const PrimaryButton = styled(ToolbarButton)`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
`;

const SecondaryButton = styled(ToolbarButton)`
  background: white;
  color: #666;
  border: 2px solid #e9ecef;
  
  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
  }
  
  &.active {
    background: #e3f2fd;
    border-color: #007bff;
    color: #007bff;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  gap: 2rem;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: ${props => props.color || '#007bff'};
  color: white;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ViewToggle = styled.div`
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ViewButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  
  &:hover {
    background: ${props => props.active ? '#007bff' : '#f8f9fa'};
  }
`;

const HierarchyArea = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const HierarchyHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
`;

const HierarchyContent = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
`;

const GridView = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
`;

const ListView = styled.div`
  padding: 0;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  padding: 1.5rem;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || '#007bff'};
  color: white;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const ActionIcon = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #666;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.hoverColor || '#007bff'};
    color: white;
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CardDescription = styled.p`
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const CardStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CardStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.85rem;
`;

const TreeItem = styled.div`
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TreeItemHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const TreeItemContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 1rem;
`;

const TreeItemInfo = styled.div`
  flex: 1;
`;

const TreeItemName = styled.div`
  color: #333;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const TreeItemMeta = styled.div`
  color: #666;
  font-size: 0.85rem;
`;

const TreeItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${TreeItem}:hover & {
    opacity: 1;
  }
`;

const ChildrenArea = styled.div`
  background: #f8f9fa;
  padding-left: 3rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const Sidebar = styled.div`
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    display: ${props => props.show ? 'flex' : 'none'};
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 1000;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

const SidebarSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SidebarTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;
`;

const FilterLabel = styled.label`
  display: block;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  color: #333;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const QuickActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    background: #e9ecef;
    color: #333;
  }
`;

// Component
const EnhancedSectoresManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  // State
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [filterType, setFilterType] = useState('all'); // 'all', 'sector', 'subsector', 'indiciado', 'vehiculo'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'count'
  const [filterText, setFilterText] = useState(''); // Para filtrar por nombre o placa
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('sector');
  const [editingItem, setEditingItem] = useState(null);
  const [parentItem, setParentItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showIndiciadoForm, setShowIndiciadoForm] = useState(false);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  
  // Estado para notificación personalizada
  const [notification, setNotification] = useState(null);
  
  // Función para mostrar notificación personalizada
  const showCustomNotification = (message, type = 'error', duration = 6000) => {
    console.log('📢 Mostrando notificación personalizada:', { message, type });
    setNotification({ message, type });
    
    // Auto-ocultar después del tiempo especificado
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Custom confirmation hooks
  const { confirmDeleteSector, ConfirmationComponent: SectorDeleteConfirmation } = useDeleteSectorConfirmation();
  const { confirmDeleteSubsector, ConfirmationComponent: SubsectorDeleteConfirmation } = useDeleteSubsectorConfirmation();
  const { confirmDeleteIndiciado, ConfirmationComponent: IndiciadoDeleteConfirmation } = useDeleteIndiciadoConfirmation();
  const { confirmDeleteVehiculo, ConfirmationComponent: VehiculoDeleteConfirmation } = useDeleteVehiculoConfirmation();

  // Effects
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

  // API Functions
  const loadHierarchy = async () => {
    try {
      console.log('🔄 EnhancedSectoresManager - Cargando jerarquía completa...');
      setLoading(true);
      
      // Hacer peticiones directas para obtener todos los datos
      const [sectoresRes, subsectoresRes, indiciadosRes, vehiculosRes] = await Promise.all([
        axios.get('/sectores'),
        axios.get('/subsectores'),
        axios.get('/indiciados'),
        axios.get('/vehiculos')
      ]);
      
      const sectoresData = sectoresRes.data.sectores || sectoresRes.data || [];
      const subsectoresData = subsectoresRes.data.subsectores || subsectoresRes.data || [];
      const indiciadosData = indiciadosRes.data.indiciados || indiciadosRes.data || [];
      const vehiculosData = vehiculosRes.data.vehiculos || vehiculosRes.data || [];
      
      console.log('🔧 Datos de subsectores corregidos:', {
        'subsectoresRes.data': subsectoresRes.data,
        'subsectoresRes.data.subsectores': subsectoresRes.data.subsectores,
        'subsectoresData final': subsectoresData,
        'subsectoresData.length': subsectoresData.length
      });
      
      console.log('📊 Datos obtenidos directamente:', {
        sectores: sectoresData.length,
        subsectores: subsectoresData.length,
        indiciados: indiciadosData.length,
        vehiculos: vehiculosData.length
      });
      
      // Construir la jerarquía que espera el componente
      const hierarchy = sectoresData.map(sector => {
        const sectorSubsectores = subsectoresData.filter(sub => 
          sub.parentId === (sector.id || sector._id)
        );
        
        return {
          ...sector,
          type: 'sector',
          subsectores: sectorSubsectores.map(subsector => {
            // Buscar indiciados de este subsector
            const subsectorIndiciados = indiciadosData.filter(indiciado => 
              indiciado.subsectorId === (subsector.id || subsector._id)
            );
            
            // Buscar vehículos de este subsector
            const subsectorVehiculos = vehiculosData.filter(vehiculo => 
              vehiculo.subsectorId === (subsector.id || subsector._id)
            );
            
            return {
              ...subsector,
              type: 'subsector',
              indiciados: subsectorIndiciados.map(indiciado => ({
                ...indiciado,
                type: 'indiciado'
              })),
              vehiculos: subsectorVehiculos.map(vehiculo => ({
                ...vehiculo,
                type: 'vehiculo'
              }))
            };
          }),
          indiciados: [],
          vehiculos: []
        };
      });
      
      console.log('🌳 Jerarquía construida:', {
        sectores: hierarchy.length,
        subsectoresConIndiciados: hierarchy.reduce((acc, s) => acc + s.subsectores.filter(sub => sub.indiciados.length > 0).length, 0),
        subsectoresConVehiculos: hierarchy.reduce((acc, s) => acc + s.subsectores.filter(sub => sub.vehiculos.length > 0).length, 0)
      });
      setHierarchy(hierarchy);
      
    } catch (error) {
      console.error('❌ Error loading hierarchy:', error);
      toast.error('Error al cargar los sectores');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      // Por ahora, hacer búsqueda simple local hasta implementar búsqueda en backend
      const allItems = [];
      const collectItems = (items) => {
        items.forEach(item => {
          if (item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (item.alias && item.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (item.placa && item.placa.toLowerCase().includes(searchTerm.toLowerCase()))) {
            allItems.push(item);
          }
          if (item.subsectores) collectItems(item.subsectores);
          if (item.indiciados) collectItems(item.indiciados);
          if (item.vehiculos) collectItems(item.vehiculos);
        });
      };
      collectItems(hierarchy);
      setSearchResults(allItems);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  // Event Handlers
  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (item.type === 'indiciado') {
      handleViewIndiciado(item);
    }
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
    console.log('🆆 Creando indiciado en subsector:', subsector);
    setParentItem(subsector);
    setEditingItem(null);
    setModalType('create-indiciado');
    setShowIndiciadoForm(true);
  };

  const handleCreateVehiculo = (subsector) => {
    setParentItem(subsector);
    setEditingItem(null);
    setShowVehiculoForm(true);
  };

  const handleEdit = (item) => {
    if (item.type === 'indiciado') {
      handleEditIndiciado(item);
    } else if (item.type === 'vehiculo') {
      handleEditVehiculo(item);
    } else {
      setModalType(item.type);
      setEditingItem(item);
      setParentItem(null);
      setShowModal(true);
    }
  };

  const handleDelete = async (item) => {
    console.log('🗑️ === INICIANDO ELIMINACIÓN ===');
    console.log('🗑️ Item a eliminar:', item);
    
    let confirmed = false;
    
    try {
      switch (item.type) {
        case 'sector': {
          console.log('🏢 Eliminando sector:', item);
          
          // Contar elementos en el sector
          const subsectorsCount = item.subsectores?.length || 0;
          const indiciadosCount = item.subsectores?.reduce((acc, sub) => acc + (sub.indiciados?.length || 0), 0) || 0;
          const vehiculosCount = item.subsectores?.reduce((acc, sub) => acc + (sub.vehiculos?.length || 0), 0) || 0;
          
          console.log('📊 Conteos:', { subsectorsCount, indiciadosCount, vehiculosCount });
          console.log('🔄 Mostrando modal de confirmación...');
          
          confirmed = await confirmDeleteSector(item, subsectorsCount, indiciadosCount, vehiculosCount);
          console.log('✅ Confirmación recibida:', confirmed);
          
          if (confirmed) {
            // Verificar qué campo de ID usar (compatibilidad MongoDB/_id y PostgreSQL/id)
            const sectorId = item.id || item._id;
            console.log('🔄 Llamando a SectoresService.deleteSector con ID:', sectorId);
            console.log('🔍 Verificando item completo:', JSON.stringify(item, null, 2));
            
            if (!sectorId) {
              throw new Error('No se encontró ID válido para el sector');
            }
            
            await SectoresService.deleteSector(sectorId);
            console.log('✅ Sector eliminado exitosamente del backend');
          } else {
            console.log('❌ Eliminación cancelada por el usuario');
          }
          break;
        }
        case 'subsector': {
          console.log('🏢 Eliminando subsector:', item);
          
          // Contar elementos en el subsector
          const indiciadosCount = item.indiciados?.length || 0;
          const vehiculosCount = item.vehiculos?.length || 0;
          
          confirmed = await confirmDeleteSubsector(item, indiciadosCount, vehiculosCount);
          if (confirmed) {
            const subsectorId = item.id || item._id;
            console.log('🔄 Llamando a SectoresService.deleteSubsector con ID:', subsectorId);
            await SectoresService.deleteSubsector(subsectorId);
          }
          break;
        }
        case 'indiciado':
          console.log('👤 Eliminando indiciado:', item);
          confirmed = await confirmDeleteIndiciado(item);
          if (confirmed) {
            const indiciadoId = item.id || item._id;
            console.log('🔄 Llamando a IndiciadoService.eliminar con ID:', indiciadoId);
            await IndiciadoService.eliminar(indiciadoId);
          }
          break;
        case 'vehiculo':
          console.log('🚗 Eliminando vehículo:', item);
          confirmed = await confirmDeleteVehiculo(item);
          if (confirmed) {
            const vehiculoId = item.id || item._id;
            console.log('🔄 Llamando a VehiculoService.eliminar con ID:', vehiculoId);
            await VehiculoService.eliminar(vehiculoId);
          }
          break;
        default:
          console.warn('Tipo de elemento no reconocido:', item.type);
          return;
      }
      
      if (confirmed) {
        console.log('🚀 Mostrando mensaje de éxito y recargando jerarquía...');
        const elementType = item.type === 'sector' ? 'Sector' : 
                           item.type === 'subsector' ? 'Subsector' : 
                           item.type === 'indiciado' ? 'Indiciado' : 
                           item.type === 'vehiculo' ? 'Vehículo' : 'Elemento';
        
        const successMessage = `${elementType} eliminado exitosamente`;
        showCustomNotification(successMessage, 'success');
        toast.success(successMessage);
        
        console.log('🔄 Recargando jerarquía...');
        await loadHierarchy();
        console.log('✅ Jerarquía recargada');
      }
    } catch (error) {
      console.error('❌ ERROR ELIMINANDO ELEMENTO:', {
        error: error,
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      const errorMsg = error.response?.data?.msg || 
                      error.response?.data?.message || 
                      error.message || 
                      'Error desconocido';
      
      const fullErrorMessage = `Error al eliminar el elemento: ${errorMsg}`;
      showCustomNotification(fullErrorMessage, 'error');
      toast.error(fullErrorMessage);
    }
  };

  const handleViewIndiciado = (indiciado) => {
    try {
      const hierarchyInfo = findIndiciadoHierarchy(indiciado.id);
      let sectorId, subsectorId;
      
      if (hierarchyInfo) {
        sectorId = hierarchyInfo.sectorId;
        subsectorId = hierarchyInfo.subsectorId;
      } else {
        sectorId = indiciado.sectorId || 'unknown';
        subsectorId = indiciado.subsectorId || 'unknown';
      }
      
      const detailPath = `/dashboard/sectores/${sectorId}/subsectores/${subsectorId}/indiciados/${indiciado.id}`;
      navigate(detailPath);
    } catch (error) {
      console.error('Error navigating to indiciado:', error);
      toast.error('Error al abrir los detalles del indiciado');
    }
  };

  const handleEditIndiciado = async (indiciado) => {
    try {
      console.log('🔄 Cargando datos completos del indiciado:', indiciado.id);
      
      const fullIndiciadoData = await IndiciadoService.getIndiciado(indiciado.id);
      
      console.log('📊 Datos completos obtenidos:', fullIndiciadoData);
      
      // Usar los datos transformados
      const transformedData = transformBackendDataToFormData(fullIndiciadoData);
      
      console.log('✨ Datos transformados para formulario:', transformedData);
      
      setEditingItem(transformedData);
      setParentItem({ id: transformedData.subsectorId || indiciado.subsectorId });
      setModalType('edit-indiciado');
      setShowIndiciadoForm(true);
    } catch (error) {
      console.error('❌ Error loading indiciado for editing:', error);
      toast.error('Error al cargar los detalles del indiciado');
      
      // Como fallback, usar los datos básicos que tenemos
      console.log('🔄 Usando datos básicos como fallback:', indiciado);
      setEditingItem(transformBackendDataToFormData(indiciado));
      setParentItem({ id: indiciado.subsectorId });
      setModalType('edit-indiciado');
      setShowIndiciadoForm(true);
    }
  };

  const handleEditVehiculo = async (vehiculo) => {
    try {
      const fullVehiculoData = await VehiculoService.obtener(vehiculo.id);
      setEditingItem(fullVehiculoData);
      setParentItem({ id: fullVehiculoData.subsectorId || vehiculo.subsectorId });
      setModalType('edit-vehiculo');
      setShowVehiculoForm(true);
    } catch (error) {
      console.error('Error loading vehiculo for editing:', error);
      toast.error('Error al cargar los detalles del vehículo');
    }
  };

  const handleViewVehiculo = async (vehiculo) => {
    try {
      const fullVehiculoData = await VehiculoService.obtener(vehiculo.id);
      setEditingItem(fullVehiculoData);
      setParentItem({ id: fullVehiculoData.subsectorId || vehiculo.subsectorId });
      setModalType('view-vehiculo');
      setShowVehiculoForm(true);
    } catch (error) {
      console.error('Error loading vehiculo for viewing:', error);
      toast.error('Error al cargar los detalles del vehículo');
    }
  };

  // Helper Functions
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

  const getItemIcon = (item, size = 20) => {
    // Si es un indiciado con foto, mostrar la foto
    if (item.type === 'indiciado' && (item.foto?.filename || item.fotoUrl)) {
      const imageUrl = item.fotoUrl || (item.foto?.filename ? getPhotoUrl(item.foto.filename) : null);
      if (imageUrl) {
        return (
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <img 
              src={imageUrl} 
              alt={item.nombre}
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #ddd'
              }}
              onError={(e) => {
                // Si la imagen no carga, ocultar la imagen y mostrar el ícono por defecto
                const container = e.target.parentElement;
                if (container) {
                  e.target.style.display = 'none';
                  const fallbackIcon = container.querySelector('.fallback-icon');
                  if (fallbackIcon) {
                    fallbackIcon.style.display = 'inline';
                  }
                }
              }}
            />
            <span 
              className="fallback-icon" 
              style={{ display: 'none' }}
            >
              <User size={size - 4} />
            </span>
          </div>
        );
      }
    }
    
    // Íconos por defecto
    switch (item.type) {
      case 'sector':
        return <Folder size={size} />;
      case 'subsector':
        return <FolderOpen size={size - 2} />;
      case 'indiciado':
        return <User size={size - 4} />;
      case 'vehiculo':
        return <Car size={size - 4} />;
      default:
        return <FileText size={size - 4} />;
    }
  };

  // Helper function to get photo URL
  const getPhotoUrl = (filename) => {
    if (!filename) return null;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/uploads/${filename}`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sector': return '#007bff';
      case 'subsector': return '#28a745';
      case 'indiciado': return '#ffc107';
      case 'vehiculo': return '#17a2b8';
      default: return '#666';
    }
  };

  const getChildrenCount = (item) => {
    let count = 0;
    if (item.subsectores) count += item.subsectores.length;
    if (item.indiciados) count += item.indiciados.length;
    if (item.vehiculos) count += item.vehiculos.length;
    return count;
  };

  // Nueva función para filtrar la jerarquía localmente
  const getFilteredHierarchy = () => {
    if (searchTerm && searchResults.length > 0) {
      return searchResults;
    }
    
    if (!filterText && filterType === 'all') {
      return hierarchy;
    }
    
    const filterItem = (item) => {
      const matchesText = !filterText || 
        item.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
        (item.type === 'vehiculo' && item.placa?.toLowerCase().includes(filterText.toLowerCase())) ||
        (item.type === 'indiciado' && item.alias?.toLowerCase().includes(filterText.toLowerCase()));
      
      const matchesType = filterType === 'all' || item.type === filterType;
      
      let filteredItem = null;
      
      if (matchesText && matchesType) {
        filteredItem = { ...item };
      } else {
        filteredItem = { ...item };
        filteredItem.subsectores = [];
        filteredItem.indiciados = [];
        filteredItem.vehiculos = [];
      }
      
      // Filtrar hijos recursivamente
      if (item.subsectores) {
        const filteredSubsectores = item.subsectores
          .map(filterItem)
          .filter(subsector => 
            subsector && (
              (filterText && subsector.nombre?.toLowerCase().includes(filterText.toLowerCase())) ||
              (filterType !== 'all' && subsector.type === filterType) ||
              (subsector.subsectores && subsector.subsectores.length > 0) ||
              (subsector.indiciados && subsector.indiciados.length > 0) ||
              (subsector.vehiculos && subsector.vehiculos.length > 0) ||
              (!filterText && filterType === 'all')
            )
          );
        
        if (filteredSubsectores.length > 0 || (matchesText && matchesType)) {
          filteredItem.subsectores = filteredSubsectores;
        }
      }
      
      if (item.indiciados) {
        const filteredIndiciados = item.indiciados.filter(indiciado => {
          const matchesTextInd = !filterText || 
            indiciado.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
            indiciado.alias?.toLowerCase().includes(filterText.toLowerCase());
          const matchesTypeInd = filterType === 'all' || filterType === 'indiciado';
          return matchesTextInd && matchesTypeInd;
        });
        
        if (filteredIndiciados.length > 0 || (matchesText && matchesType)) {
          filteredItem.indiciados = filteredIndiciados;
        }
      }
      
      if (item.vehiculos) {
        const filteredVehiculos = item.vehiculos.filter(vehiculo => {
          const matchesTextVeh = !filterText || 
            vehiculo.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
            vehiculo.placa?.toLowerCase().includes(filterText.toLowerCase());
          const matchesTypeVeh = filterType === 'all' || filterType === 'vehiculo';
          return matchesTextVeh && matchesTypeVeh;
        });
        
        if (filteredVehiculos.length > 0 || (matchesText && matchesType)) {
          filteredItem.vehiculos = filteredVehiculos;
        }
      }
      
      // Retornar el item solo si tiene contenido relevante
      const hasRelevantContent = 
        (matchesText && matchesType) ||
        (filteredItem.subsectores && filteredItem.subsectores.length > 0) ||
        (filteredItem.indiciados && filteredItem.indiciados.length > 0) ||
        (filteredItem.vehiculos && filteredItem.vehiculos.length > 0);
      
      return hasRelevantContent ? filteredItem : null;
    };
    
    return hierarchy.map(filterItem).filter(Boolean);
  };

  // Stats calculation
  const calculateStats = () => {
    const stats = {
      sectores: 0,
      subsectores: 0,
      indiciados: 0,
      vehiculos: 0
    };
    
    const countItems = (items) => {
      items.forEach(item => {
        switch (item.type) {
          case 'sector':
            stats.sectores++;
            break;
          case 'subsector':
            stats.subsectores++;
            break;
          case 'indiciado':
            stats.indiciados++;
            break;
          case 'vehiculo':
            stats.vehiculos++;
            break;
        }
        
        if (item.subsectores) countItems(item.subsectores);
        if (item.indiciados) countItems(item.indiciados);
        if (item.vehiculos) countItems(item.vehiculos);
      });
    };
    
    countItems(hierarchy);
    stats.total = stats.sectores + stats.subsectores + stats.indiciados + stats.vehiculos;
    
    return stats;
  };

  const stats = calculateStats();

  // Render Functions
  const renderBreadcrumb = () => (
    <BreadcrumbContainer>
      <BreadcrumbItem clickable onClick={() => navigate('/dashboard')}>
        <Home size={16} />
        Inicio
      </BreadcrumbItem>
      <ChevronRight size={14} />
      <BreadcrumbItem>
        <Folder size={16} />
        Gestión de Sectores
      </BreadcrumbItem>
      {selectedItem && (
        <>
          <ChevronRight size={14} />
          <BreadcrumbItem>
            {getItemIcon(selectedItem, 16)}
            {selectedItem.nombre}
          </BreadcrumbItem>
        </>
      )}
    </BreadcrumbContainer>
  );


  const renderTreeView = () => {
    const renderTreeItem = (item, level = 0) => {
      const isExpanded = expandedItems.has(item.id);
      const hasChildren = getChildrenCount(item) > 0;
      
      return (
        <div key={`${item.type}-${item.id}`}>
          <TreeItem>
            <TreeItemHeader onClick={() => hasChildren && toggleExpanded(item.id)}>
              {hasChildren && (
                <div style={{ marginRight: '0.5rem', marginLeft: `${level * 1.5}rem` }}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              )}
              
              <TreeItemContent style={{ marginLeft: !hasChildren ? `${(level * 1.5) + 1.5}rem` : 0 }}>
                <CardIcon color={getTypeColor(item.type)} style={{ width: 32, height: 32 }}>
                  {getItemIcon(item, 32)}
                </CardIcon>
                
                <TreeItemInfo>
                  <TreeItemName>{item.nombre} {item.apellidos}</TreeItemName>
                  <TreeItemMeta>
                    {item.type}
                    {item.descripcion && ` • ${item.descripcion.substring(0, 50)}...`}
                    {item.alias && ` • Alias: ${item.alias}`}
                    {item.documentoIdentidad?.numero && ` • Doc: ${item.documentoIdentidad.numero}`}
                    {item.placa && ` • Placa: ${item.placa}`}
                  </TreeItemMeta>
                </TreeItemInfo>
                
                <TreeItemActions>
                  {item.type === 'sector' && (
                    <ActionIcon 
                      onClick={(e) => { e.stopPropagation(); handleCreateSubsector(item); }}
                      hoverColor="#28a745"
                      title="Crear Subsector"
                    >
                      <Plus size={14} />
                    </ActionIcon>
                  )}
                  
                  {item.type === 'subsector' && (
                    <>
                      <ActionIcon 
                        onClick={(e) => { e.stopPropagation(); handleCreateIndiciado(item); }}
                        hoverColor="#ffc107"
                        title="Crear Indiciado"
                      >
                        <User size={14} />
                      </ActionIcon>
                      <ActionIcon 
                        onClick={(e) => { e.stopPropagation(); handleCreateVehiculo(item); }}
                        hoverColor="#17a2b8"
                        title="Crear Vehículo"
                      >
                        <Car size={14} />
                      </ActionIcon>
                    </>
                  )}
                  
                  {(item.type === 'indiciado' || item.type === 'vehiculo') && (
                    <ActionIcon 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        item.type === 'indiciado' ? handleViewIndiciado(item) : handleViewVehiculo(item);
                      }}
                      hoverColor="#28a745"
                      title="Ver Detalles"
                    >
                      <Eye size={14} />
                    </ActionIcon>
                  )}
                  
                  <ActionIcon 
                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                    title="Editar"
                  >
                    <Edit size={14} />
                  </ActionIcon>
                  
                  <ActionIcon 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    hoverColor="#dc3545"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </TreeItemActions>
              </TreeItemContent>
            </TreeItemHeader>
          </TreeItem>
          
          {isExpanded && hasChildren && (
            <ChildrenArea>
              {item.subsectores?.map(subsector => renderTreeItem(subsector, level + 1))}
              {item.indiciados?.map(indiciado => renderTreeItem(indiciado, level + 1))}
              {item.vehiculos?.map(vehiculo => renderTreeItem(vehiculo, level + 1))}
            </ChildrenArea>
          )}
        </div>
      );
    };
    
    const filteredData = getFilteredHierarchy();
    
    return (
      <ListView>
        {filteredData.map(sector => renderTreeItem(sector))}
      </ListView>
    );
  };

  const renderSidebar = () => (
    <Sidebar show={showSidebar}>
      <SidebarHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Filtros y Acciones</h3>
          <SecondaryButton 
            onClick={() => setShowSidebar(false)}
            style={{ padding: '0.5rem', minWidth: 'auto' }}
          >
            <X size={16} />
          </SecondaryButton>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarSection>
          <SidebarTitle>Filtros</SidebarTitle>
          
          <FilterGroup>
            <FilterLabel>Buscar por nombre, alias o placa</FilterLabel>
            <SearchInput
              type="text"
              placeholder="Filtrar por nombre, alias o placa..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{
                padding: '0.5rem',
                fontSize: '0.85rem',
                borderRadius: '6px'
              }}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Tipo de elemento</FilterLabel>
            <FilterSelect 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="sector">Sectores</option>
              <option value="subsector">Subsectores</option>
              <option value="indiciado">Indiciados</option>
              <option value="vehiculo">Vehículos</option>
            </FilterSelect>
          </FilterGroup>
        </SidebarSection>
        
        <SidebarSection>
          <SidebarTitle>Acciones Rápidas</SidebarTitle>
          
          <QuickActions>
              <QuickAction onClick={handleCreateSector}>
                <Folder size={16} />
                Nuevo Sector
              </QuickAction>
            
           {/* <QuickAction onClick={() => navigate('/dashboard/reports')}>
              <BarChart3 size={16} />
              Ver Reportes
            </QuickAction>
            
            <QuickAction onClick={() => navigate('/dashboard/settings')}>
              <Settings size={16} />
              Configuración
            </QuickAction>*/}
          </QuickActions>
        </SidebarSection>
        
        {selectedItem && (
          <SidebarSection>
            <SidebarTitle>Elemento Seleccionado</SidebarTitle>
            
            <Card style={{ margin: 0, cursor: 'default' }}>
              <CardHeader>
                <CardIcon color={getTypeColor(selectedItem.type)}>
                  {getItemIcon(selectedItem.type)}
                </CardIcon>
              </CardHeader>
              <CardTitle>{selectedItem.nombre}</CardTitle>
              {selectedItem.descripcion && (
                <CardDescription>{selectedItem.descripcion}</CardDescription>
              )}
              
              <QuickActions style={{ marginTop: '1rem' }}>
                {(selectedItem.type === 'indiciado' || selectedItem.type === 'vehiculo') && (
                  <QuickAction onClick={() => {
                    selectedItem.type === 'indiciado' 
                      ? handleViewIndiciado(selectedItem) 
                      : handleViewVehiculo(selectedItem);
                  }}>
                    <Eye size={16} />
                    Ver Detalles
                  </QuickAction>
                )}
                
                <QuickAction onClick={() => handleEdit(selectedItem)}>
                  <Edit size={16} />
                  Editar
                </QuickAction>
                
                {selectedItem.type === 'sector' && (
                  <QuickAction onClick={() => handleCreateSubsector(selectedItem)}>
                    <Plus size={16} />
                    Agregar Subsector
                  </QuickAction>
                )}
                
                {selectedItem.type === 'subsector' && (
                  <>
                    <QuickAction onClick={() => handleCreateIndiciado(selectedItem)}>
                      <User size={16} />
                      Agregar Indiciado
                    </QuickAction>
                    <QuickAction onClick={() => handleCreateVehiculo(selectedItem)}>
                      <Car size={16} />
                      Agregar Vehículo
                    </QuickAction>
                  </>
                )}
              </QuickActions>
            </Card>
          </SidebarSection>
        )}
      </SidebarContent>
    </Sidebar>
  );

  if (loading) {
    return (
      <Container $theme={theme}>
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
      </Container>
    );
  }

  return (
    <Container $theme={theme}>
      <TopBar $theme={theme}>
        {renderBreadcrumb()}
      </TopBar>

      <MainContent>
        <ContentArea>
          {/* Stats */}
          <StatsContainer>
            <StatCard>
              <StatIcon color="#007bff">
                <Folder size={24} />
              </StatIcon>
              <StatValue>{stats.sectores}</StatValue>
              <StatLabel>Sectores</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon color="#28a745">
                <FolderOpen size={24} />
              </StatIcon>
              <StatValue>{stats.subsectores}</StatValue>
              <StatLabel>Subsectores</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon color="#ffc107">
                <User size={24} />
              </StatIcon>
              <StatValue>{stats.indiciados}</StatValue>
              <StatLabel>Indiciados</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon color="#17a2b8">
                <Car size={24} />
              </StatIcon>
              <StatValue>{stats.vehiculos}</StatValue>
              <StatLabel>Vehículos</StatLabel>
            </StatCard>
          </StatsContainer>

          {/* Content Area */}
          <HierarchyArea>
            <HierarchyHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#333' }}>
                  {searchTerm ? `Resultados: ${getFilteredHierarchy().length}` : 'Estructura Jerárquica'}
                </h3>
                
                {searchTerm && (
                  <SecondaryButton 
                    onClick={() => setSearchTerm('')}
                    style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                  >
                    Limpiar búsqueda
                  </SecondaryButton>
                )}
              </div>
            </HierarchyHeader>

            <HierarchyContent>
              {getFilteredHierarchy().length === 0 ? (
                <EmptyState>
                  <EmptyIcon>🗂️</EmptyIcon>
                  <h3>No se encontraron elementos</h3>
                  <p>
                    {(searchTerm || filterText || filterType !== 'all')
                      ? 'Prueba con otros términos de búsqueda o filtros' 
                      : 'Crea tu primer sector para comenzar'
                    }
                  </p>
                  {!searchTerm && !filterText && filterType === 'all' && (
                    <PrimaryButton onClick={handleCreateSector} style={{ marginTop: '1rem' }}>
                      <Plus size={18} />
                      Crear Primer Sector
                    </PrimaryButton>
                  )}
                </EmptyState>
              ) : (
                renderTreeView()
              )}
            </HierarchyContent>
          </HierarchyArea>
        </ContentArea>

        {renderSidebar()}
      </MainContent>

      {/* Modals */}
      <ItemForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={async (formData) => {
          try {
            setModalLoading(true);
            
            if (editingItem) {
              switch (editingItem.type) {
                case 'sector':
                  await SectoresService.updateSector(editingItem.id, formData);
                  break;
                case 'subsector':
                  await SectoresService.updateSubsector(editingItem.id, formData);
                  break;
              }
              const successMessage = `${editingItem.type === 'sector' ? 'Sector' : 'Subsector'} actualizado exitosamente`;
              showCustomNotification(successMessage, 'success');
              toast.success(successMessage);
            } else {
              switch (modalType) {
                case 'sector':
                  await SectoresService.createSector(formData);
                  showCustomNotification('Sector creado exitosamente', 'success');
                  toast.success('Sector creado exitosamente');
                  break;
                case 'subsector':
                  // Agregar parentId al crear subsector
                  const subsectorData = {
                    ...formData,
                    parentId: parentItem?.id
                  };
                  console.log('🔄 Creando subsector con datos:', subsectorData);
                  await SectoresService.createSubsector(subsectorData);
                  showCustomNotification('Subsector creado exitosamente', 'success');
                  toast.success('Subsector creado exitosamente');
                  break;
              }
            }
            
            setShowModal(false);
            loadHierarchy();
          } catch (error) {
            console.error('❌ Error al guardar el elemento:', error);
            console.log('🔍 Detalles completos del error:', {
              message: error.message,
              response: error.response,
              status: error.response?.status,
              data: error.response?.data,
              fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
            
            // Extraer mensaje específico del error
            let errorMessage = 'Error desconocido al guardar el elemento';
            
            if (error.response) {
              const { status, data } = error.response;
              console.log('📄 Procesando respuesta de error:', { status, data });
              
              switch (status) {
                case 409:
                  errorMessage = data.msg || data.message || 'Ya existe un elemento con ese nombre';
                  console.log('⚠️ Error 409 detectado, mensaje:', errorMessage);
                  break;
                case 400:
                  errorMessage = data.msg || data.message || 'Datos inválidos';
                  break;
                case 404:
                  errorMessage = 'Elemento no encontrado';
                  break;
                case 500:
                  errorMessage = 'Error interno del servidor';
                  break;
                default:
                  errorMessage = data.msg || data.message || `Error ${status}: ${data.error || 'Error desconocido'}`;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            console.log('🎆 Mostrando toast con mensaje:', errorMessage);
            
            // Mostrar notificación personalizada
            showCustomNotification(errorMessage, 'error');
            
            // También intentar mostrar toast como respaldo
            try {
              toast.error(errorMessage);
            } catch (toastError) {
              console.error('❌ Error mostrando toast:', toastError);
            }
          } finally {
            setModalLoading(false);
          }
        }}
        item={editingItem}
        loading={modalLoading}
        type={modalType}
      />

      {showIndiciadoForm && (
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
              ...((modalType === 'view-indiciado' || modalType === 'edit-indiciado') && editingItem 
                ? transformBackendDataToFormData(editingItem) 
                : {})
            }}
            readOnly={modalType === 'view-indiciado'}
            isEdit={modalType === 'edit-indiciado'}
            onSuccess={(indiciado) => {
              const message = modalType === 'edit-indiciado' 
                ? 'Indiciado actualizado exitosamente' 
                : 'Indiciado creado exitosamente';
              
              console.log('🎉 Éxito en actualización/creación:', {
                tipo: modalType,
                indiciado: indiciado,
                alias: indiciado?.alias,
                timestamp: new Date().toISOString()
              });
              
              showCustomNotification(message, 'success');
              toast.success(message);
              setShowIndiciadoForm(false);
              setParentItem(null);
              setEditingItem(null);
              
              // Forzar recarga de datos con un pequeño delay para asegurar que el backend se actualizó
              console.log('🔄 Recargando jerarquía después de actualización...');
              setTimeout(() => {
                loadHierarchy();
              }, 500);
            }}
            onCancel={() => {
              setShowIndiciadoForm(false);
              setParentItem(null);
              setEditingItem(null);
            }}
          />
        </div>
      )}

      {showVehiculoForm && (
        <VehiculoForm
          isOpen={showVehiculoForm}
          onClose={() => {
            setShowVehiculoForm(false);
            setParentItem(null);
            setEditingItem(null);
          }}
          onSuccess={(vehiculo) => {
            const message = modalType === 'edit-vehiculo' 
              ? 'Vehículo actualizado exitosamente' 
              : 'Vehículo creado exitosamente';
            showCustomNotification(message, 'success');
            toast.success(message);
            setShowVehiculoForm(false);
            setParentItem(null);
            setEditingItem(null);
            loadHierarchy();
          }}
          initialData={editingItem}
          subsectorId={parentItem?.id}
          readOnly={modalType === 'view-vehiculo'}
        />
      )}
      
      {/* Custom Confirmation Modals */}
      <SectorDeleteConfirmation />
      <SubsectorDeleteConfirmation />
      <IndiciadoDeleteConfirmation />
      <VehiculoDeleteConfirmation />
      
      {/* Notificación Personalizada */}
      {notification && (
        <CustomNotification
          type={notification.type}
          onClick={() => setNotification(null)}
        >
          {notification.type === 'error' ? '❌' : '✅'} {notification.message}
        </CustomNotification>
      )}
    </Container>
  );
};

// Componente de Notificación Personalizada
const CustomNotification = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.type === 'error' ? '#fee2e2' : '#ecfdf5'};
  color: ${props => props.type === 'error' ? '#991b1b' : '#166534'};
  border: 2px solid ${props => props.type === 'error' ? '#fca5a5' : '#86efac'};
  border-radius: 12px;
  padding: 16px 24px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 999999;
  max-width: 500px;
  width: 90%;
  text-align: center;
  animation: slideIn 0.3s ease-out;
  cursor: pointer;
  
  @keyframes slideIn {
    from {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  &:hover {
    transform: translateX(-50%) scale(1.02);
  }
`;

export default EnhancedSectoresManager;
