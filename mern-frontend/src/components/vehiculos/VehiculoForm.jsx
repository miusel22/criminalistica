import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  X, 
  Save, 
  Upload, 
  Camera, 
  Trash2, 
  Car, 
  User, 
  FileText,
  MapPin,
  Calendar,
  AlertCircle,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { VehiculoService } from '../../services/vehiculoService';
import { 
  TIPOS_VEHICULO, 
  TIPOS_COMBUSTIBLE, 
  ESTADOS_VEHICULO, 
  TIPOS_DOCUMENTO_PROPIETARIO 
} from '../../types/vehiculo';
import { DocumentosVehiculo } from '../DocumentosVehiculo';

// Styled Components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px 16px 0 0;
  position: relative;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
`;

const HeaderIcon = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem;
  border-radius: 12px;
  margin-right: 1rem;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Form = styled.form`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2.5rem;
  
  &:last-child {
    margin-bottom: 1rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e9ecef;
`;

const SectionIcon = styled.div`
  color: #17a2b8;
  margin-right: 0.75rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  &.required::after {
    content: ' *';
    color: #dc3545;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #17a2b8;
    box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.1);
  }
  
  &:invalid {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #17a2b8;
    box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #17a2b8;
    box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.1);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed #17a2b8;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    border-color: #138496;
  }
  
  &.dragover {
    background: rgba(23, 162, 184, 0.1);
    border-color: #138496;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadText = styled.p`
  margin: 1rem 0 0 0;
  color: #6c757d;
  font-size: 0.9rem;
`;

const PhotosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PhotoCard = styled.div`
  position: relative;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoActions = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
`;

const PhotoButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  padding: 0.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
  
  &.delete:hover {
    background: #dc3545;
  }
`;

const PhotoDescription = styled.input`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.5rem;
  font-size: 0.75rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
    background: rgba(0, 0, 0, 0.9);
  }
`;

const ValidityIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  
  &.valid {
    background: #d4edda;
    color: #155724;
  }
  
  &.invalid {
    background: #f8d7da;
    color: #721c24;
  }
  
  &.warning {
    background: #fff3cd;
    color: #856404;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: #17a2b8;
  color: white;
  
  &:hover:not(:disabled) {
    background: #138496;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  color: white;
  
  &:hover:not(:disabled) {
    background: #545b62;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const VehiculoForm = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData = null, 
  subsectorId = null,
  readOnly = false 
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    sectorQueOpera: '',
    tipoVehiculo: 'Automóvil',
    marca: '',
    linea: '',
    modelo: '',
    placa: '',
    numeroChasis: '',
    numeroMotor: '',
    color: '',
    cilindraje: '',
    combustible: 'Gasolina',
    // Propietario
    propietarioNombre: '',
    propietarioDocumentoTipo: 'CC',
    propietarioDocumentoNumero: '',
    propietarioTelefono: '',
    propietarioDireccion: '',
    // SOAT
    soatNumeroPoliza: '',
    soatVigencia: '',
    soatAseguradora: '',
    // Tecnomecánica
    tecnomecanicaNumero: '',
    tecnomecanicaVigencia: '',
    tecnomecanicaCda: '',
    // Estado e incidente
    estado: 'Activo',
    fechaIncidente: '',
    lugarIncidente: '',
    tipoIncidente: '',
    // Observaciones
    observaciones: '',
    caracteristicasParticulares: '',
    googleEarthUrl: '',
    // Subsector
    subsectorId: subsectorId
  });

  const [loading, setLoading] = useState(false);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      // Transformar datos del backend al formato del formulario
      const transformedData = {
        sectorQueOpera: initialData.sectorQueOpera || '',
        tipoVehiculo: initialData.tipoVehiculo || 'Automóvil',
        marca: initialData.marca || '',
        linea: initialData.linea || '',
        modelo: initialData.modelo || '',
        placa: initialData.placa || '',
        numeroChasis: initialData.numeroChasis || '',
        numeroMotor: initialData.numeroMotor || '',
        color: initialData.color || '',
        cilindraje: initialData.cilindraje || '',
        combustible: initialData.combustible || 'Gasolina',
        // Propietario
        propietarioNombre: initialData.propietario?.nombre || '',
        propietarioDocumentoTipo: initialData.propietario?.documento?.tipo || 'CC',
        propietarioDocumentoNumero: initialData.propietario?.documento?.numero || '',
        propietarioTelefono: initialData.propietario?.telefono || '',
        propietarioDireccion: initialData.propietario?.direccion || '',
        // SOAT
        soatNumeroPoliza: initialData.soat?.numeroPoliza || '',
        soatVigencia: initialData.soat?.vigencia || '',
        soatAseguradora: initialData.soat?.aseguradora || '',
        // Tecnomecánica
        tecnomecanicaNumero: initialData.tecnomecanica?.numero || '',
        tecnomecanicaVigencia: initialData.tecnomecanica?.vigencia || '',
        tecnomecanicaCda: initialData.tecnomecanica?.cda || '',
        // Estado e incidente
        estado: initialData.estado || 'Activo',
        fechaIncidente: initialData.fechaIncidente || '',
        lugarIncidente: initialData.lugarIncidente || '',
        tipoIncidente: initialData.tipoIncidente || '',
        // Observaciones
        observaciones: initialData.observaciones || '',
        caracteristicasParticulares: initialData.caracteristicasParticulares || '',
        googleEarthUrl: initialData.googleEarthUrl || '',
        subsectorId: initialData.subsectorId || subsectorId
      };
      
      setFormData(transformedData);
    } else {
      // Resetear para nuevo vehículo
      setFormData(prev => ({
        ...prev,
        subsectorId: subsectorId
      }));
    }
  }, [initialData, subsectorId]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Validación de vigencias
  const getVigenciaStatus = (fecha) => {
    if (!fecha) return null;
    
    const today = new Date();
    const vigencia = new Date(fecha);
    const diffDays = Math.ceil((vigencia - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { type: 'invalid', message: 'Vencido' };
    if (diffDays <= 30) return { type: 'warning', message: `Vence en ${diffDays} días` };
    return { type: 'valid', message: 'Vigente' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    
    setLoading(true);
    
    try {
      // Transformar datos del formulario al formato del backend
      const vehiculoData = {
        sectorQueOpera: formData.sectorQueOpera,
        tipoVehiculo: formData.tipoVehiculo,
        marca: formData.marca,
        linea: formData.linea,
        modelo: formData.modelo,
        placa: formData.placa,
        numeroChasis: formData.numeroChasis,
        numeroMotor: formData.numeroMotor,
        color: formData.color,
        cilindraje: formData.cilindraje,
        combustible: formData.combustible,
        propietario: {
          nombre: formData.propietarioNombre,
          documento: {
            tipo: formData.propietarioDocumentoTipo,
            numero: formData.propietarioDocumentoNumero
          },
          telefono: formData.propietarioTelefono,
          direccion: formData.propietarioDireccion
        },
        soat: {
          numeroPoliza: formData.soatNumeroPoliza,
          vigencia: formData.soatVigencia,
          aseguradora: formData.soatAseguradora
        },
        tecnomecanica: {
          numero: formData.tecnomecanicaNumero,
          vigencia: formData.tecnomecanicaVigencia,
          cda: formData.tecnomecanicaCda
        },
        estado: formData.estado,
        fechaIncidente: formData.fechaIncidente,
        lugarIncidente: formData.lugarIncidente,
        tipoIncidente: formData.tipoIncidente,
        observaciones: formData.observaciones,
        caracteristicasParticulares: formData.caracteristicasParticulares,
        googleEarthUrl: formData.googleEarthUrl,
        subsectorId: formData.subsectorId
      };

      let result;
      if (initialData && initialData.id) {
        // Actualizar
        result = await VehiculoService.actualizar(initialData.id, vehiculoData);
        toast.success('Vehículo actualizado exitosamente');
      } else {
        // Crear
        result = await VehiculoService.crear(vehiculoData);
        toast.success('Vehículo creado exitosamente');
      }

      onSuccess(result.vehiculo);
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      toast.error(error.response?.data?.msg || 'Error al guardar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const soatStatus = getVigenciaStatus(formData.soatVigencia);
  const tecnomecanicaStatus = getVigenciaStatus(formData.tecnomecanicaVigencia);

  return (
    <Modal onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <Header>
          <HeaderContent>
            <HeaderIcon>
              <Car size={24} />
            </HeaderIcon>
            <HeaderText>
              <Title>
                {readOnly ? 'Ver Vehículo' : initialData ? 'Editar Vehículo' : 'Nuevo Vehículo'}
              </Title>
              <Subtitle>
                {readOnly ? 'Información detallada del vehículo' : 
                 initialData ? 'Modifica la información del vehículo' : 
                 'Complete la información del vehículo'}
              </Subtitle>
            </HeaderText>
          </HeaderContent>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Información Básica */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <Car size={20} />
              </SectionIcon>
              <SectionTitle>Información del Vehículo</SectionTitle>
            </SectionHeader>
            
            <FieldGrid>
              <FieldGroup>
                <Label className="required">Sector que Opera</Label>
                <Input
                  name="sectorQueOpera"
                  value={formData.sectorQueOpera}
                  onChange={handleInputChange}
                  placeholder="Ej: Ajizal"
                  readOnly={readOnly}
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <Label className="required">Tipo de Vehículo</Label>
                <Select
                  name="tipoVehiculo"
                  value={formData.tipoVehiculo}
                  onChange={handleInputChange}
                  disabled={readOnly}
                  required
                >
                  {TIPOS_VEHICULO.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </Select>
              </FieldGroup>

              <FieldGroup>
                <Label>Marca</Label>
                <Input
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  placeholder="Ej: Toyota"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Línea</Label>
                <Input
                  name="linea"
                  value={formData.linea}
                  onChange={handleInputChange}
                  placeholder="Ej: Corolla"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Modelo</Label>
                <Input
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleInputChange}
                  placeholder="Ej: 2020"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Placa</Label>
                <Input
                  name="placa"
                  value={formData.placa}
                  onChange={handleInputChange}
                  placeholder="Ej: STZ 484"
                  readOnly={readOnly}
                  style={{ textTransform: 'uppercase' }}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Número de Chasis</Label>
                <Input
                  name="numeroChasis"
                  value={formData.numeroChasis}
                  onChange={handleInputChange}
                  placeholder="Número de chasis"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Número de Motor</Label>
                <Input
                  name="numeroMotor"
                  value={formData.numeroMotor}
                  onChange={handleInputChange}
                  placeholder="Número de motor"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Color</Label>
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Ej: Amarillo"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Cilindraje</Label>
                <Input
                  name="cilindraje"
                  value={formData.cilindraje}
                  onChange={handleInputChange}
                  placeholder="Ej: 1600cc"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Combustible</Label>
                <Select
                  name="combustible"
                  value={formData.combustible}
                  onChange={handleInputChange}
                  disabled={readOnly}
                >
                  <option value="">Seleccionar</option>
                  {TIPOS_COMBUSTIBLE.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </Select>
              </FieldGroup>

              <FieldGroup>
                <Label>Estado</Label>
                <Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  disabled={readOnly}
                >
                  {ESTADOS_VEHICULO.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </Select>
              </FieldGroup>
            </FieldGrid>
          </Section>

          {/* Información del Propietario */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <User size={20} />
              </SectionIcon>
              <SectionTitle>Información del Propietario</SectionTitle>
            </SectionHeader>
            
            <FieldGrid>
              <FieldGroup>
                <Label>Nombre del Propietario</Label>
                <Input
                  name="propietarioNombre"
                  value={formData.propietarioNombre}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Tipo de Documento</Label>
                <Select
                  name="propietarioDocumentoTipo"
                  value={formData.propietarioDocumentoTipo}
                  onChange={handleInputChange}
                  disabled={readOnly}
                >
                  {TIPOS_DOCUMENTO_PROPIETARIO.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </Select>
              </FieldGroup>

              <FieldGroup>
                <Label>Número de Documento</Label>
                <Input
                  name="propietarioDocumentoNumero"
                  value={formData.propietarioDocumentoNumero}
                  onChange={handleInputChange}
                  placeholder="Número de documento"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Teléfono</Label>
                <Input
                  name="propietarioTelefono"
                  value={formData.propietarioTelefono}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup style={{ gridColumn: '1 / -1' }}>
                <Label>Dirección</Label>
                <Input
                  name="propietarioDireccion"
                  value={formData.propietarioDireccion}
                  onChange={handleInputChange}
                  placeholder="Dirección completa"
                  readOnly={readOnly}
                />
              </FieldGroup>
            </FieldGrid>
          </Section>

          {/* Documentos Legales */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FileText size={20} />
              </SectionIcon>
              <SectionTitle>Documentos Legales</SectionTitle>
            </SectionHeader>
            
            <FieldGrid>
              <FieldGroup>
                <Label>SOAT - Número de Póliza</Label>
                <Input
                  name="soatNumeroPoliza"
                  value={formData.soatNumeroPoliza}
                  onChange={handleInputChange}
                  placeholder="Número de póliza SOAT"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>SOAT - Vigencia</Label>
                <Input
                  type="date"
                  name="soatVigencia"
                  value={formData.soatVigencia}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
                {soatStatus && (
                  <ValidityIndicator className={soatStatus.type}>
                    {soatStatus.type === 'valid' && <Check size={16} />}
                    {soatStatus.type !== 'valid' && <AlertCircle size={16} />}
                    <span style={{ marginLeft: '0.5rem' }}>{soatStatus.message}</span>
                  </ValidityIndicator>
                )}
              </FieldGroup>

              <FieldGroup>
                <Label>SOAT - Aseguradora</Label>
                <Input
                  name="soatAseguradora"
                  value={formData.soatAseguradora}
                  onChange={handleInputChange}
                  placeholder="Nombre de la aseguradora"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Tecnomecánica - Número</Label>
                <Input
                  name="tecnomecanicaNumero"
                  value={formData.tecnomecanicaNumero}
                  onChange={handleInputChange}
                  placeholder="Número de tecnomecánica"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Tecnomecánica - Vigencia</Label>
                <Input
                  type="date"
                  name="tecnomecanicaVigencia"
                  value={formData.tecnomecanicaVigencia}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
                {tecnomecanicaStatus && (
                  <ValidityIndicator className={tecnomecanicaStatus.type}>
                    {tecnomecanicaStatus.type === 'valid' && <Check size={16} />}
                    {tecnomecanicaStatus.type !== 'valid' && <AlertCircle size={16} />}
                    <span style={{ marginLeft: '0.5rem' }}>{tecnomecanicaStatus.message}</span>
                  </ValidityIndicator>
                )}
              </FieldGroup>

              <FieldGroup>
                <Label>CDA</Label>
                <Input
                  name="tecnomecanicaCda"
                  value={formData.tecnomecanicaCda}
                  onChange={handleInputChange}
                  placeholder="Centro de Diagnóstico Automotor"
                  readOnly={readOnly}
                />
              </FieldGroup>
            </FieldGrid>
          </Section>

          {/* Información del Incidente */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <MapPin size={20} />
              </SectionIcon>
              <SectionTitle>Información del Incidente</SectionTitle>
            </SectionHeader>
            
            <FieldGrid>
              <FieldGroup>
                <Label>Fecha del Incidente</Label>
                <Input
                  type="date"
                  name="fechaIncidente"
                  value={formData.fechaIncidente}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Tipo de Incidente</Label>
                <Input
                  name="tipoIncidente"
                  value={formData.tipoIncidente}
                  onChange={handleInputChange}
                  placeholder="Ej: Accidente, Robo, etc."
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup style={{ gridColumn: '1 / -1' }}>
                <Label>Lugar del Incidente</Label>
                <Input
                  name="lugarIncidente"
                  value={formData.lugarIncidente}
                  onChange={handleInputChange}
                  placeholder="Ubicación específica del incidente"
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup style={{ gridColumn: '1 / -1' }}>
                <Label>URL de Google Earth</Label>
                <Input
                  name="googleEarthUrl"
                  value={formData.googleEarthUrl}
                  onChange={handleInputChange}
                  placeholder="URL de ubicación en Google Earth"
                  readOnly={readOnly}
                />
              </FieldGroup>
            </FieldGrid>
          </Section>

          {/* Observaciones */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FileText size={20} />
              </SectionIcon>
              <SectionTitle>Observaciones</SectionTitle>
            </SectionHeader>
            
            <FieldGrid>
              <FieldGroup style={{ gridColumn: '1 / -1' }}>
                <Label>Características Particulares</Label>
                <TextArea
                  name="caracteristicasParticulares"
                  value={formData.caracteristicasParticulares}
                  onChange={handleInputChange}
                  placeholder="Describa características especiales, daños visibles, modificaciones, etc."
                  readOnly={readOnly}
                />
              </FieldGroup>

              <FieldGroup style={{ gridColumn: '1 / -1' }}>
                <Label>Observaciones Generales</Label>
                <TextArea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Observaciones adicionales sobre el vehículo o el caso"
                  readOnly={readOnly}
                />
              </FieldGroup>
            </FieldGrid>
          </Section>

          {/* Documentos del Vehículo */}
          <Section>
            <DocumentosVehiculo 
              vehiculoId={initialData?.id || null}
              readOnly={readOnly}
              isNewVehiculo={!initialData || !initialData.id}
              onDocumentosChange={(documentos) => {
                console.log('📄 Documentos del vehículo actualizados:', documentos);
              }}
            />
          </Section>

        </Form>

        {/* Buttons */}
        <ButtonGroup>
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          {!readOnly && (
            <PrimaryButton type="submit" disabled={loading} onClick={handleSubmit}>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')} Vehículo
            </PrimaryButton>
          )}
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default VehiculoForm;
