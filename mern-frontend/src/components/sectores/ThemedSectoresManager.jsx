import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme/theme';
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
  X,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

// Services
import sectoresService from '../../services/sectoresService';
import { IndiciadoService } from '../../services/indiciadoService';
import { VehiculoService } from '../../services/vehiculoService';

// Styled Components with Theme Support
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
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 0.9rem;
  flex: 1;
  min-width: 200px;
`;

const BreadcrumbItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return props.clickable ? theme.colors.primary : theme.colors.textSecondary;
  }};
  transition: color 0.2s;
  
  &:hover {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return props.clickable ? theme.colors.primaryHover : theme.colors.textSecondary;
    }};
  }
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
  border: 2px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBorder;
  }};
  border-radius: 25px;
  font-size: 0.9rem;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus;
    }};
    box-shadow: 0 0 0 3px ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.shadowFocus;
    }};
  }

  &::placeholder {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputPlaceholder;
    }};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textTertiary;
  }};
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
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  color: white;
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primaryHover;
    }};
    transform: translateY(-1px);
    box-shadow: ${props => {
      const theme = getTheme(props.$theme);
      return theme.shadows.md;
    }};
  }
`;

const SecondaryButton = styled(ToolbarButton)`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  border: 2px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
  }
  
  &.active {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.focus;
    }};
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
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
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.md;
  }};
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 0.9rem;
  font-weight: 500;
`;

const HierarchyArea = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 16px;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.md;
  }};
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const HierarchyHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};

  h3 {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
    margin: 0;
  }
`;

const HierarchyContent = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
`;

const TreeItem = styled.div`
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  
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
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
  }
`;

const TreeItemName = styled.div`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const TreeItemMeta = styled.div`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 0.85rem;
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
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.hoverColor || props.theme?.colors?.primary || '#007bff'};
    color: white;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  
  h3 {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
  }
  
  p {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textSecondary;
    }};
  }
`;

// Sidebar Components
const Sidebar = styled.div`
  width: 320px;
  min-width: 320px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 16px;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.md;
  }};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 140px);
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  
  @media (max-width: 768px) {
    position: fixed;
    top: 120px;
    right: ${props => props.isOpen ? '2rem' : '-340px'};
    z-index: 1000;
    width: 300px;
    min-width: 300px;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};

  h3 {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
    margin: 0;
    font-size: 1.1rem;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FilterLabel = styled.label`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBorder;
  }};
  border-radius: 8px;
  font-size: 0.9rem;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus;
    }};
    box-shadow: 0 0 0 3px ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.shadowFocus;
    }};
  }

  &::placeholder {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputPlaceholder;
    }};
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBorder;
  }};
  border-radius: 8px;
  font-size: 0.9rem;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  transition: all 0.2s;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus;
    }};
    box-shadow: 0 0 0 3px ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.shadowFocus;
    }};
  }
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
  font-weight: 500;
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
    transform: translateY(-1px);
  }
`;

const ExpandableTreeItem = styled.div`
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ExpandableHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
    
    .actions {
      opacity: 1;
    }
  }
`;

const ExpandableContent = styled.div`
  padding-left: 3rem;
  border-top: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  display: ${props => props.isExpanded ? 'block' : 'none'};
`;

const ChildItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  transition: all 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
    
    .child-actions {
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.error;
    }};
    color: white;
  }
`;

const FilterBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
`;

// Component with full functionality
export default function ThemedSectoresManager() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    nameFilter: '',
    typeFilter: 'todos',
    sortBy: 'nombre'
  });
  
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
  
  const toggleExpanded = (id) => {
    console.log('🚀 Click en sector ID:', id);
    console.log('📋 Estado actual expandedItems:', Array.from(expandedItems));
    
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
      console.log('📦 Colapsando sector:', id);
    } else {
      newExpanded.add(id);
      console.log('📂 Expandiendo sector:', id);
    }
    
    console.log('✅ Nuevo estado expandedItems:', Array.from(newExpanded));
    setExpandedItems(newExpanded);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const filteredHierarchy = useMemo(() => {
    let filtered = hierarchy;
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.alias && item.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.placa && item.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.documentoIdentidad && item.documentoIdentidad.numero && item.documentoIdentidad.numero.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtro por nombre en sidebar
    if (filters.nameFilter) {
      filtered = filtered.filter(item => 
        item.nombre.toLowerCase().includes(filters.nameFilter.toLowerCase()) ||
        (item.alias && item.alias.toLowerCase().includes(filters.nameFilter.toLowerCase())) ||
        (item.placa && item.placa.toLowerCase().includes(filters.nameFilter.toLowerCase())) ||
        (item.documentoIdentidad && item.documentoIdentidad.numero && item.documentoIdentidad.numero.toLowerCase().includes(filters.nameFilter.toLowerCase()))
      );
    }
    
    // Filtro por tipo
    if (filters.typeFilter !== 'todos') {
      filtered = filtered.filter(item => item.tipo === filters.typeFilter);
    }
    
    // Ordenamiento
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'elementos':
          return b.elementos - a.elementos;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [hierarchy, searchTerm, filters]);
  
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
        <BreadcrumbContainer $theme={theme}>
          <BreadcrumbItem $theme={theme} clickable onClick={() => navigate('/dashboard')}>
            <Home size={16} />
            Inicio
          </BreadcrumbItem>
          <ChevronRight size={14} />
          <BreadcrumbItem $theme={theme}>
            <Folder size={16} />
            Gestión de Sectores
          </BreadcrumbItem>
        </BreadcrumbContainer>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <SearchContainer>
            <SearchIcon $theme={theme} size={18} />
            <SearchInput
              $theme={theme}
              type="text"
              placeholder="Buscar sectores, subsectores, indiciados, vehículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          <div style={{ position: 'relative' }}>
            <SecondaryButton 
              $theme={theme} 
              className={sidebarOpen ? 'active' : ''}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Filter size={18} />
              Filtros
              {(filters.nameFilter || filters.typeFilter !== 'todos') && (
                <FilterBadge $theme={theme}>!</FilterBadge>
              )}
            </SecondaryButton>
          </div>
          
          <PrimaryButton $theme={theme}>
            <Plus size={18} />
            Nuevo Sector
          </PrimaryButton>
        </div>
      </TopBar>

      <MainContent>
        <ContentArea>
          <StatsContainer>
            <StatCard $theme={theme}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Folder size={24} />
                </div>
                <div>
                  <StatValue $theme={theme}>{stats.sectores}</StatValue>
                  <StatLabel $theme={theme}>Sectores</StatLabel>
                </div>
              </div>
            </StatCard>

            <StatCard $theme={theme}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: '#28a745',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FolderOpen size={24} />
                </div>
                <div>
                  <StatValue $theme={theme}>{stats.subsectores}</StatValue>
                  <StatLabel $theme={theme}>Subsectores</StatLabel>
                </div>
              </div>
            </StatCard>

            <StatCard $theme={theme}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: '#ffc107',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={24} />
                </div>
                <div>
                  <StatValue $theme={theme}>{stats.indiciados}</StatValue>
                  <StatLabel $theme={theme}>Indiciados</StatLabel>
                </div>
              </div>
            </StatCard>

            <StatCard $theme={theme}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: '#17a2b8',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Car size={24} />
                </div>
                <div>
                  <StatValue $theme={theme}>{stats.vehiculos}</StatValue>
                  <StatLabel $theme={theme}>Vehículos</StatLabel>
                </div>
              </div>
            </StatCard>
          </StatsContainer>

          <HierarchyArea $theme={theme}>
            <HierarchyHeader $theme={theme}>
              <h3>Estructura Jerárquica</h3>
            </HierarchyHeader>

            <HierarchyContent>
              {filteredHierarchy.length === 0 ? (
                <EmptyState $theme={theme}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>🗂️</div>
                  <h3>No se encontraron elementos</h3>
                  <p>{searchTerm || filters.nameFilter || filters.typeFilter !== 'todos' 
                    ? 'No hay elementos que coincidan con los filtros aplicados' 
                    : 'Crea tu primer sector para comenzar'}
                  </p>
                  {!searchTerm && !filters.nameFilter && filters.typeFilter === 'todos' && (
                    <PrimaryButton $theme={theme} style={{ marginTop: '1rem' }}>
                      <Plus size={18} />
                      Crear Primer Sector
                    </PrimaryButton>
                  )}
                </EmptyState>
              ) : (
                <div>
                  {filteredHierarchy.map(sector => (
                    <ExpandableTreeItem key={sector.id} $theme={theme}>
                      <ExpandableHeader 
                        $theme={theme}
                        onClick={() => toggleExpanded(sector.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                          {expandedItems.has(sector.id) ? (
                            <ChevronDown size={16} style={{ color: getTheme(theme).colors.textSecondary }} />
                          ) : (
                            <ChevronRight size={16} style={{ color: getTheme(theme).colors.textSecondary }} />
                          )}
                        </div>
                        <div style={{ 
                          width: '32px', 
                          height: '32px',
                          background: '#007bff',
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
                          <TreeItemName $theme={theme}>{sector.nombre}</TreeItemName>
                          <TreeItemMeta $theme={theme}>
                            sector • {sector.subsectores?.length || 0} subsectores • {sector.elementos} elementos
                          </TreeItemMeta>
                        </div>
                        <div 
                          style={{ display: 'flex', gap: '0.5rem', opacity: 0 }} 
                          className="actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ActionIcon $theme={theme} hoverColor="#28a745" title="Crear Subsector">
                            <Plus size={14} />
                          </ActionIcon>
                          <ActionIcon $theme={theme} title="Editar">
                            <Edit size={14} />
                          </ActionIcon>
                          <ActionIcon $theme={theme} title="Ver detalles">
                            <Eye size={14} />
                          </ActionIcon>
                          <ActionIcon $theme={theme} hoverColor="#dc3545" title="Eliminar">
                            <Trash2 size={14} />
                          </ActionIcon>
                        </div>
                      </ExpandableHeader>
                      
                      {sector.subsectores && sector.subsectores.length > 0 && (
                        <ExpandableContent $theme={theme} isExpanded={expandedItems.has(sector.id)}>
                          {sector.subsectores.map(subsector => (
                            <ChildItem key={subsector.id} $theme={theme}>
                              <div style={{ 
                                width: '24px', 
                                height: '24px',
                                background: '#28a745',
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
                                  color: getTheme(theme).colors.textPrimary,
                                  fontWeight: 600,
                                  fontSize: '0.9rem',
                                  marginBottom: '0.25rem'
                                }}>
                                  {subsector.nombre}
                                </div>
                                <div style={{ 
                                  color: getTheme(theme).colors.textSecondary,
                                  fontSize: '0.8rem'
                                }}>
                                  subsector • {(subsector.indiciados?.length || 0) + (subsector.vehiculos?.length || 0)} elementos
                                </div>
                              </div>
                              <div 
                                style={{ display: 'flex', gap: '0.25rem', opacity: 0 }} 
                                className="child-actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ActionIcon $theme={theme} hoverColor="#ffc107" title="Agregar Indiciado">
                                  <User size={12} />
                                </ActionIcon>
                                <ActionIcon $theme={theme} hoverColor="#17a2b8" title="Agregar Vehículo">
                                  <Car size={12} />
                                </ActionIcon>
                                <ActionIcon $theme={theme} title="Editar">
                                  <Edit size={12} />
                                </ActionIcon>
                                <ActionIcon $theme={theme} hoverColor="#dc3545" title="Eliminar">
                                  <Trash2 size={12} />
                                </ActionIcon>
                              </div>
                            </ChildItem>
                          ))}
                        </ExpandableContent>
                      )}
                    </ExpandableTreeItem>
                  ))}
                </div>
              )}
            </HierarchyContent>
          </HierarchyArea>
        </ContentArea>
        
        {/* Sidebar de Filtros */}
        <Sidebar $theme={theme} isOpen={sidebarOpen}>
          <SidebarHeader $theme={theme}>
            <h3>Filtros y Acciones</h3>
          </SidebarHeader>
          
          <SidebarContent>
            {/* Sección de Filtros */}
            <FilterSection>
              <h4 style={{ 
                color: getTheme(theme).colors.textPrimary,
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600
              }}>
                FILTROS
              </h4>
              
              <div>
                <FilterLabel $theme={theme}>Buscar por nombre, alias, cédula o placa</FilterLabel>
                <FilterInput
                  $theme={theme}
                  type="text"
                  placeholder="Filtrar por nombre, alias, cédula o placa..."
                  value={filters.nameFilter}
                  onChange={(e) => handleFilterChange('nameFilter', e.target.value)}
                />
              </div>
              
              <div>
                <FilterLabel $theme={theme}>Tipo de elemento</FilterLabel>
                <FilterSelect
                  $theme={theme}
                  value={filters.typeFilter}
                  onChange={(e) => handleFilterChange('typeFilter', e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="sector">Sectores</option>
                  <option value="subsector">Subsectores</option>
                  <option value="indiciado">Indiciados</option>
                  <option value="vehiculo">Vehículos</option>
                </FilterSelect>
              </div>
              
              <div>
                <FilterLabel $theme={theme}>Ordenar por</FilterLabel>
                <FilterSelect
                  $theme={theme}
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="nombre">Nombre</option>
                  <option value="elementos">Número de elementos</option>
                </FilterSelect>
              </div>
            </FilterSection>
            
            {/* Sección de Acciones Rápidas */}
            <FilterSection>
              <h4 style={{ 
                color: getTheme(theme).colors.textPrimary,
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600
              }}>
                ACCIONES RÁPIDAS
              </h4>
              
              <QuickAction $theme={theme}>
                <Folder size={18} />
                Nuevo Sector
              </QuickAction>
              
              <QuickAction $theme={theme}>
                <FolderOpen size={18} />
                Nuevo Subsector
              </QuickAction>
              
              <QuickAction $theme={theme}>
                <User size={18} />
                Nuevo Indiciado
              </QuickAction>
              
              <QuickAction $theme={theme}>
                <Car size={18} />
                Nuevo Vehículo
              </QuickAction>
              
              <QuickAction $theme={theme}>
                <Settings size={18} />
                Configuración
              </QuickAction>
            </FilterSection>
            
            {/* Estadísticas del Sidebar */}
            <FilterSection>
              <h4 style={{ 
                color: getTheme(theme).colors.textPrimary,
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600
              }}>
                ESTADÍSTICAS
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: getTheme(theme).colors.backgroundSecondary,
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#007bff',
                    marginBottom: '0.25rem'
                  }}>
                    {stats.sectores}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: getTheme(theme).colors.textSecondary
                  }}>
                    Sectores
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: getTheme(theme).colors.backgroundSecondary,
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#28a745',
                    marginBottom: '0.25rem'
                  }}>
                    {stats.subsectores}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: getTheme(theme).colors.textSecondary
                  }}>
                    Subsectores
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: getTheme(theme).colors.backgroundSecondary,
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#ffc107',
                    marginBottom: '0.25rem'
                  }}>
                    {stats.indiciados}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: getTheme(theme).colors.textSecondary
                  }}>
                    Indiciados
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: getTheme(theme).colors.backgroundSecondary,
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#17a2b8',
                    marginBottom: '0.25rem'
                  }}>
                    {stats.vehiculos}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: getTheme(theme).colors.textSecondary
                  }}>
                    Vehículos
                  </div>
                </div>
              </div>
            </FilterSection>
          </SidebarContent>
        </Sidebar>
      </MainContent>
    </Container>
  );
}
