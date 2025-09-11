import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, MapPin, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../theme/theme';
import colombiaService from '../../services/colombiaService';
import toast from 'react-hot-toast';

// Type definitions for styled components with theme prop
interface ThemeProps {
  $theme?: string;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.lg;
  }};
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-size: 1.25rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.hover;
    }};
  }
`;

const Body = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBorder;
  }};
  border-radius: 6px;
  font-size: 16px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus;
    }};
    box-shadow: 0 0 0 2px ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.shadowFocus;
    }};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Footer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
`;

const PrimaryButton = styled(Button)`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  
  &:hover:not(:disabled) {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primaryHover;
    }};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.textPrimary;
    }};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBorder;
  }};
  border-radius: 6px;
  font-size: 16px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.inputFocus;
    }};
    box-shadow: 0 0 0 2px ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.shadowFocus;
    }};
  }
  
  &:disabled {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.disabled;
    }};
    cursor: not-allowed;
  }
`;

const UbicacionSection = styled.div`
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
`;

const SectionTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CustomCityContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`;

const SmallButton = styled.button`
  padding: 8px;
  background: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.success;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 12px;
  
  &:hover {
    background: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.success;
    }};
    opacity: 0.9;
  }
`;

const ItemForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  item = null, 
  loading = false,
  type = 'sector' // sector, subsector, indiciado
}) => {
  // Get current theme from context
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    nombre: item?.nombre || '',
    // Ubicación solo para sectores
    departamentoId: item?.ubicacion?.departamento?.id || '',
    ciudadId: item?.ubicacion?.ciudad?.id || '',
    ciudadPersonalizada: item?.ubicacion?.ciudadPersonalizada || ''
  });
  
  // Reset form when modal opens with different type or when switching between create/edit
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: item?.nombre || '',
        departamentoId: item?.ubicacion?.departamento?.id || '',
        ciudadId: item?.ubicacion?.ciudad?.id || '',
        ciudadPersonalizada: item?.ubicacion?.ciudadPersonalizada || ''
      });
      setIsEditMode(!!item);
      setShowCustomCity(!!item?.ubicacion?.ciudadPersonalizada);
    }
  }, [isOpen, item, type]);
  
  const [isEditMode, setIsEditMode] = useState(!!item);
  
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [showCustomCity, setShowCustomCity] = useState(false);
  const [loadingUbicacion, setLoadingUbicacion] = useState(false);

  // Cargar departamentos al abrir el modal (solo para sectores)
  useEffect(() => {
    if (isOpen && type === 'sector') {
      loadDepartamentos();
    }
  }, [isOpen, type]);

  // Cargar ciudades cuando cambia el departamento
  useEffect(() => {
    if (formData.departamentoId && type === 'sector') {
      loadCiudades(formData.departamentoId);
    } else {
      setCiudades([]);
    }
  }, [formData.departamentoId, type]);

  const loadDepartamentos = async () => {
    try {
      setLoadingUbicacion(true);
      const response = await colombiaService.getDepartamentos();
      if (response.exito) {
        setDepartamentos(response.departamentos);
      }
    } catch (error) {
      console.error('Error loading departamentos:', error);
      toast.error('Error al cargar los departamentos');
    } finally {
      setLoadingUbicacion(false);
    }
  };

  const loadCiudades = async (departamentoId) => {
    try {
      setLoadingUbicacion(true);
      const response = await colombiaService.getCiudadesByDepartamento(departamentoId);
      if (response.exito) {
        setCiudades(response.ciudades);
      }
    } catch (error) {
      console.error('Error loading ciudades:', error);
      toast.error('Error al cargar las ciudades');
      setCiudades([]);
    } finally {
      setLoadingUbicacion(false);
    }
  };

  // Generate sector name automatically when department and city are selected
  useEffect(() => {
    if (type === 'sector' && !isEditMode) {
      const departamento = departamentos.find(d => d.id === formData.departamentoId);
      
      let ciudadNombre = '';
      if (formData.ciudadPersonalizada) {
        ciudadNombre = formData.ciudadPersonalizada;
      } else if (formData.ciudadId) {
        const ciudad = ciudades.find(c => c.id === formData.ciudadId);
        ciudadNombre = ciudad?.nombre || '';
      }
      
      if (departamento && ciudadNombre) {
        const sectorName = `Sector ${departamento.nombre} - ${ciudadNombre}`;
        setFormData(prev => ({ ...prev, nombre: sectorName }));
      }
    }
  }, [formData.departamentoId, formData.ciudadId, formData.ciudadPersonalizada, departamentos, ciudades, type, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nombre.trim()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  const typeLabels = {
    sector: 'Sector',
    subsector: 'Subsector',
    indiciado: 'Indiciado',
    vehiculo: 'Vehículo',
    'edit-indiciado': 'Indiciado',
    'edit-vehiculo': 'Vehículo',
    'view-indiciado': 'Indiciado',
    'view-vehiculo': 'Vehículo'
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()} $theme={theme}>
        <Header $theme={theme}>
          <Title $theme={theme}>{title || `${item ? 'Editar' : 'Crear'} ${typeLabels[type] || 'Elemento'}`}</Title>
          <CloseButton onClick={onClose} $theme={theme}>
            <X size={20} />
          </CloseButton>
        </Header>

        <form onSubmit={handleSubmit}>
          <Body>
            {/* Show location section first for sectors, then name field */}
            {type === 'sector' && (
              <UbicacionSection $theme={theme}>
                <SectionTitle $theme={theme}>
                  <MapPin size={16} />
                  Ubicación Geográfica
                </SectionTitle>
                
                <Row>
                  <FormGroup>
                    <Label htmlFor="departamentoId" $theme={theme}>Departamento *</Label>
                    <Select
                      id="departamentoId"
                      name="departamentoId"
                      value={formData.departamentoId}
                      onChange={handleChange}
                      disabled={loadingUbicacion}
                      required={type === 'sector'}
                      $theme={theme}
                    >
                      <option value="">{loadingUbicacion ? 'Cargando...' : 'Seleccionar departamento'}</option>
                      {departamentos.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.nombre}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="ciudadId" $theme={theme}>Ciudad/Municipio *</Label>
                    <Select
                      id="ciudadId"
                      name="ciudadId"
                      value={formData.ciudadId}
                      onChange={handleChange}
                      disabled={!formData.departamentoId || loadingUbicacion || showCustomCity}
                      required={type === 'sector' && !showCustomCity}
                      $theme={theme}
                    >
                      <option value="">{loadingUbicacion ? 'Cargando...' : 'Seleccionar ciudad'}</option>
                      {ciudades.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.nombre}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                </Row>
                
                <FormGroup>
                  <CustomCityContainer>
                    <div style={{ flex: 1 }}>
                      <Label $theme={theme}>¿No encuentras tu ciudad?</Label>
                      {showCustomCity ? (
                        <Input
                          name="ciudadPersonalizada"
                          type="text"
                          value={formData.ciudadPersonalizada}
                          onChange={handleChange}
                          placeholder="Escribir nombre de la ciudad"
                          required={showCustomCity}
                          $theme={theme}
                        />
                      ) : (
                        <SmallButton 
                          type="button"
                          onClick={() => {
                            setShowCustomCity(true);
                            setFormData(prev => ({ ...prev, ciudadId: '' }));
                          }}
                          $theme={theme}
                        >
                          <Plus size={14} style={{ marginRight: '4px' }} />
                          Agregar ciudad manualmente
                        </SmallButton>
                      )}
                    </div>
                    {showCustomCity && (
                      <SmallButton
                        type="button"
                        onClick={() => {
                          setShowCustomCity(false);
                          setFormData(prev => ({ ...prev, ciudadPersonalizada: '' }));
                        }}
                        style={{ background: '#dc3545', marginTop: '24px' }}
                        $theme={theme}
                      >
                        Cancelar
                      </SmallButton>
                    )}
                  </CustomCityContainer>
                </FormGroup>
              </UbicacionSection>
            )}

            <FormGroup>
              <Label htmlFor="nombre" $theme={theme}>Nombre *</Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder={
                  type === 'sector' && !isEditMode 
                    ? 'Se generará automáticamente al seleccionar ubicación' 
                    : type === 'subsector'
                      ? 'Ejemplo: Subsector Centro, Subsector Norte, etc.'
                      : `Nombre del ${typeLabels[type] ? typeLabels[type].toLowerCase() : 'elemento'}`
                }
                required
                maxLength={100}
                readOnly={type === 'sector' && !isEditMode && !formData.nombre}
                $theme={theme}
                style={{
                  cursor: type === 'sector' && !isEditMode && !formData.nombre ? 'not-allowed' : 'text'
                }}
              />
            </FormGroup>
          </Body>

          <Footer $theme={theme}>
            <SecondaryButton type="button" onClick={onClose} $theme={theme}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={loading || !formData.nombre.trim()} $theme={theme}>
              {loading ? 'Guardando...' : (item ? 'Actualizar' : 'Crear')}
            </PrimaryButton>
          </Footer>
        </form>
      </Modal>
    </Overlay>
  );
};

export default ItemForm;
