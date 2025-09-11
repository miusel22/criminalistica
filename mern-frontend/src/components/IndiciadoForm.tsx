import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  User, 
  FileText, 
  Calendar, 
  Home, 
  Phone, 
  GraduationCap, 
  Briefcase,
  Eye,
  Shield,
  MapPin,
  MessageSquare,
  Camera,
  Save,
  X,
  Upload,
  Trash2,
  Building
} from 'lucide-react';
import { IndiciadoFormData, EstadoCivil, FotoIndiciado, SenalesFisicas } from '../types/indiciado';
import { IndiciadoService } from '../services/indiciadoService';
import { SectorService } from '../services/sectorService';
import { transformBackendDataToFormData } from '../utils/indiciadoTransforms';
import { DocumentosIndiciado } from './DocumentosIndiciado';
import { DocumentUploader, DocumentToUpload } from './DocumentUploader';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../theme/theme';
import '../styles/ComponentStyles.css'; // Para loading spinner y otros estilos

// Esquema de validación con Yup
const validationSchema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido').min(2, 'Mínimo 2 caracteres'),
  apellidos: yup.string().required('Los apellidos son requeridos').min(2, 'Mínimo 2 caracteres'),
  sectorQueOpera: yup.string(),
  alias: yup.string(),
  // Documento
  documentoIdentidad: yup.object().shape({
    tipo: yup.string(),
    numero: yup.string(),
    expedidoEn: yup.string(),
  }).optional(),
  // Fecha nacimiento
  fechaNacimiento: yup.string(),
  lugarNacimiento: yup.string(),
  edad: yup.string(),
  // Personal
  hijoDe: yup.string(),
  genero: yup.string(),
  estadoCivil: yup.string(),
  nacionalidad: yup.string(),
  residencia: yup.string(),
  direccion: yup.string(),
  telefono: yup.string(),
  email: yup.string().email('Email inválido'),
  // Académica/Laboral
  estudiosRealizados: yup.string(),
  profesion: yup.string(),
  oficio: yup.string(),
  // Señales físicas básicas
  senalesFisicas: yup.object().shape({
    estatura: yup.string(),
    peso: yup.string(),
    contexturaFisica: yup.string(),
    colorPiel: yup.string(),
    colorOjos: yup.string(),
    colorCabello: yup.string(),
    marcasEspeciales: yup.string(),
  }).optional(),
  // Señales físicas detalladas
  senalesFisicasDetalladas: yup.object().shape({
    complexion: yup.string(),
    formaCara: yup.string(),
    tipoCabello: yup.string(),
    largoCabello: yup.string(),
    formaOjos: yup.string(),
    formaNariz: yup.string(),
    formaBoca: yup.string(),
    formaLabios: yup.string(),
  }).optional(),
  // Información delictiva
  bandaDelincuencial: yup.string(),
  delitosAtribuidos: yup.string(),
  situacionJuridica: yup.string(),
  antecedentes: yup.string(),
  // Adicionales
  observaciones: yup.string(),
  googleEarthUrl: yup.string(),
  subsectorId: yup.string(),
});

interface IndiciadoFormProps {
  initialData?: Partial<IndiciadoFormData> & { 
    id?: string;
    _id?: string;
    foto?: FotoIndiciado; 
    fotoUrl?: string; 
  };
  isEditing?: boolean;
  readOnly?: boolean;
  isEdit?: boolean;
  onSuccess?: (indiciado: any) => void;
  onCancel?: () => void;
}

// Interface for styled components theme props
interface StyledThemeProps {
  $theme?: string;
}

interface ProgressBarProps extends StyledThemeProps {
  progress: number;
}

interface PhotoPreviewProps extends StyledThemeProps {
  hasImage?: boolean;
}

interface FormInputProps extends StyledThemeProps {
  hasError?: boolean;
}


// Styled Components
const FormContainer = styled.div<StyledThemeProps>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundCard;
  }};
  border-radius: 12px;
  box-shadow: ${props => {
    const theme = getTheme(props.$theme);
    return theme.shadows.md;
  }};
`;

const FormHeader = styled.div<StyledThemeProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
`;

const FormTitle = styled.h1<StyledThemeProps>`
  font-size: 28px;
  font-weight: bold;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primary;
    }};
  }
`;

const ProgressContainer = styled.div<StyledThemeProps>`
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  height: 4px;
  border-radius: 2px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressBar = styled.div<ProgressBarProps>`
  height: 100%;
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const FormLayout = styled.form`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FormSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormSection = styled.section<StyledThemeProps>`
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 8px;
  padding: 20px;
`;

const SectionHeader = styled.div<StyledThemeProps>`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
`;

const SectionTitle = styled.h2<StyledThemeProps>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  margin: 0 0 0 10px;
`;

const SectionIcon = styled.div<StyledThemeProps>`
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  flex-shrink: 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGridFull = styled.div`
  grid-column: 1 / -1;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label<StyledThemeProps>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  display: flex;
  align-items: center;
  gap: 4px;
  
  .required {
    color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.danger;
    }};
  }
`;

const FormInput = styled.input<FormInputProps>`
  padding: 10px 12px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return props.hasError ? theme.colors.danger : theme.colors.inputBorder;
  }};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormSelect = styled.select<FormInputProps>`
  padding: 10px 12px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return props.hasError ? theme.colors.danger : theme.colors.inputBorder;
  }};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormTextarea = styled.textarea<FormInputProps>`
  padding: 10px 12px;
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return props.hasError ? theme.colors.danger : theme.colors.inputBorder;
  }};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputText;
  }};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormError = styled.span<StyledThemeProps>`
  font-size: 12px;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.danger;
  }};
  margin-top: 4px;
`;

// Photo Upload Components
const PhotoUploadSection = styled.div<StyledThemeProps>`
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.backgroundSecondary;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  border-radius: 8px;
  padding: 20px;
  position: sticky;
  top: 20px;
  height: fit-content;
  
  @media (max-width: 768px) {
    position: static;
    order: -1;
  }
`;

const PhotoPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const PhotoPreview = styled.div<PhotoPreviewProps>`
  width: 250px;
  height: 300px;
  border: 2px ${props => props.hasImage ? 'solid' : 'dashed'} ${props => {
    const theme = getTheme(props.$theme);
    return props.hasImage ? theme.colors.primary : theme.colors.border;
  }};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 200px;
    height: 240px;
  }
`;

const PhotoPreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoPlaceholder = styled.div<StyledThemeProps>`
  text-align: center;
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textSecondary;
  }};
  
  svg {
    margin-bottom: 8px;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label<StyledThemeProps>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primaryHover;
    }};
  }
`;

const RemovePhotoButton = styled.button<StyledThemeProps>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.danger;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

// Form Action Components
const FormActions = styled.div<StyledThemeProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)<StyledThemeProps>`
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.primary;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  
  &:hover:not(:disabled) {
    background-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.primaryHover;
    }};
  }
`;

const SecondaryButton = styled(Button)<StyledThemeProps>`
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.inputBg;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textPrimary;
  }};
  border: 1px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.border;
  }};
  
  &:hover:not(:disabled) {
    background-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.backgroundSecondary;
    }};
  }
`;

const DangerButton = styled(Button)<StyledThemeProps>`
  background-color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.danger;
  }};
  color: ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  
  &:hover:not(:disabled) {
    background-color: ${props => {
      const theme = getTheme(props.$theme);
      return theme.colors.dangerHover;
    }};
  }
`;

const LoadingSpinner = styled.div<StyledThemeProps>`
  width: 16px;
  height: 16px;
  border: 2px solid ${props => {
    const theme = getTheme(props.$theme);
    return theme.colors.textInverse;
  }};
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const IndiciadoForm: React.FC<IndiciadoFormProps> = ({
  initialData,
  isEditing = false,
  readOnly = false,
  isEdit = false,
  onSuccess,
  onCancel
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [subsectorOptions, setSubsectorOptions] = useState<Array<{ value: string; label: string; level: number }>>([]);
  const [loadingSubsectors, setLoadingSubsectors] = useState(false);
  const [documentsToUpload, setDocumentsToUpload] = useState<DocumentToUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<IndiciadoFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nombre: '',
      apellidos: '',
      sectorQueOpera: '',
      alias: '',
      documentoIdentidad:{
        tipo: '',
        numero: '',
        expedidoEn: ''
      },
      // Fecha nacimiento
      fechaNacimiento: '',
      lugarNacimiento: '',
      edad: '',
      // Personal
      hijoDe: '',
      genero: '',
      estadoCivil: '',
      nacionalidad: '',
      residencia: '',
      direccion: '',
      telefono: '',
      email: '',
      // Académica/Laboral
      estudiosRealizados: '',
      profesion: '',
      oficio: '',
      // Señales físicas básicas
      senalesFisicas: {
        estatura: '',
        peso: '',
        contexturaFisica: '',
        colorPiel: '',
        colorOjos: '',
        colorCabello: '',
        marcasEspeciales: '',
      },
      // Señales físicas detalladas
      senalesFisicasDetalladas: {
        complexion: '',
        formaCara: '',
        tipoCabello: '',
        largoCabello: '',
        formaOjos: '',
        formaNariz: '',
        formaBoca: '',
        formaLabios: '',
      },
      // Información delictiva
      bandaDelincuencial: '',
      delitosAtribuidos: '',
      situacionJuridica: '',
      antecedentes: '',
      // Adicionales
      observaciones: '',
      googleEarthUrl: '',
      subsectorId: '',
      ...initialData
    }
  });

  // Calcular progreso del formulario
  const watchedFields = watch();
  const totalFields = Object.keys(watchedFields).length;
  const filledFields = Object.values(watchedFields).filter(value => 
    value !== '' && value !== null && value !== undefined
  ).length;
  const progress = Math.round((filledFields / totalFields) * 100);

  // Manejar selección de foto
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('La imagen no puede ser mayor a 5MB', {
          duration: 4000,
          id: 'image-size-error'
        });
        return;
      }

      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Solo se permiten archivos de imagen (JPEG, PNG, GIF)', {
          duration: 4000,
          id: 'image-type-error'
        });
        return;
      }

      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover foto
  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manejar cambios en documentos
  const handleDocumentsChange = (documents: DocumentToUpload[]) => {
    setDocumentsToUpload(documents);
  };

  // Calcular edad automáticamente
  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? age.toString() : '';
  };

  // Manejar cambio de fecha de nacimiento
  const handleBirthDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return; // No hacer nada si es readOnly
    const value = event.target.value;
    
    // Registrar el cambio en react-hook-form primero
    setValue('fechaNacimiento', value);
    
    // Luego calcular y actualizar la edad
    const age = calculateAge(value);
    setValue('edad', age);
  };

  // Cargar subsectores y datos iniciales al montar el componente
  useEffect(() => {
    const loadSubsectors = async () => {
      setLoadingSubsectors(true);
      try {
        const opciones = await SectorService.obtenerOpcionesDropdown();
        setSubsectorOptions(opciones);
        
        // Si hay un subsectorId en initialData, asegurar que esté seleccionado
        if (initialData?.subsectorId) {
          setValue('subsectorId', initialData.subsectorId);
        }
      } catch (error) {
        console.error('Error cargando subsectores:', error);
        // Si falla, continúa sin subsectores
      } finally {
        setLoadingSubsectors(false);
      }
    };

    loadSubsectors();
  }, [initialData?.subsectorId, setValue]);

  // Reset form with transformed data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Transform backend data to form format if needed
      const transformedData = isEdit || readOnly ? transformBackendDataToFormData(initialData) : initialData;
      // Reset form with only the transformed data (without empty defaults)
      reset(transformedData);
    }
  }, [initialData, isEdit, readOnly, reset]);
  

  // Cargar imagen existente si hay datos iniciales
  useEffect(() => {
    if (initialData?.foto || initialData?.fotoUrl) {
      let imageUrl = null;
      
      // Priorizar fotoUrl si existe
      if (initialData.fotoUrl) {
        imageUrl = initialData.fotoUrl;
      }
      // Si foto es un objeto, priorizar path (Cloudinary) sobre filename
      else if (initialData.foto) {
        if (typeof initialData.foto === 'object') {
          // Priorizar path que viene de Cloudinary
          if (initialData.foto.path && initialData.foto.path.startsWith('https://')) {
            imageUrl = initialData.foto.path;
          }
          // Fallback a filename para compatibilidad con archivos antiguos
          else if (initialData.foto.filename) {
            imageUrl = IndiciadoService.obtenerUrlFoto(initialData.foto.filename);
          }
        }
        // Si foto es un string directo (filename)
        else if (typeof initialData.foto === 'string') {
          imageUrl = IndiciadoService.obtenerUrlFoto(initialData.foto);
        }
      }
      
      if (imageUrl) {
        setPhotoPreview(imageUrl);
      }
    }
  }, [initialData]);

  // Enviar formulario
  const onSubmit = async (data: IndiciadoFormData) => {
    setIsLoading(true);
    
    try {
      const formDataWithPhoto = {
        ...data,
        foto: selectedPhoto || undefined,
        documentos: documentsToUpload
      };

      let result;
      // Verificar si estamos en modo edición usando múltiples condiciones
      const isEditMode = (isEdit || isEditing) && (initialData?.id || initialData?._id);
      const indiciadoId = initialData?.id || initialData?._id;
      
      if (isEditMode && indiciadoId) {
        result = await IndiciadoService.actualizar(indiciadoId, formDataWithPhoto);
      } else {
        result = await IndiciadoService.crear(formDataWithPhoto);
      }
      
      // Si es una creación, verificar que realmente se guardó
      if (!isEditMode) {
        const indiciadoId = result.indiciado?._id || result.indiciado?.id;
        if (indiciadoId) {
          try {
            const existe = await IndiciadoService.verificarExistencia(indiciadoId);
            if (!existe) {
              toast.error('Problema al verificar creación', {
                duration: 8000,
                id: 'verification-error'
              });
            }
          } catch (error) {
            // Error silencioso en verificación
          }
        }
      }
      
      if (onSuccess) {
        onSuccess(result.indiciado);
      } else {
        // Mostrar toast de éxito personalizado
        if (isEditMode) {
          toast.success('¡Indiciado actualizado!', {
            duration: 4000,
            id: 'indiciado-updated'
          });
        } else {
          toast.success('¡Indiciado creado exitosamente!', {
            duration: 4000,
            id: 'indiciado-created'
          });
          
          // Si hay documentos, mostrar toast adicional
          if (documentsToUpload.length > 0) {
            setTimeout(() => {
              toast.success(`Documentos cargados correctamente (${documentsToUpload.length})`, {
                duration: 3000,
                id: 'documents-uploaded'
              });
            }, 500);
          }
          
          reset();
          removePhoto();
          setDocumentsToUpload([]);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || error.response?.data?.message || error.message || 'Error desconocido';
      toast.error(`Error al guardar: ${errorMessage}`, {
        duration: 8000,
        id: 'save-error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer $theme={theme}>
      <FormHeader $theme={theme}>
        <FormTitle $theme={theme}>
          <User size={32} />
          {readOnly ? 'Ver Indiciado' : (isEdit || isEditing ? 'Editar Indiciado' : 'Nuevo Indiciado')}
        </FormTitle>
      </FormHeader>

      <ProgressContainer $theme={theme}>
        <ProgressBar $theme={theme} progress={progress} />
      </ProgressContainer>

      <FormLayout 
        id="indiciado-form" 
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormSections>
          {/* Información Básica */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <User size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Información Básica</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGroup>
                <FormLabel $theme={theme}>
                  Sector que Opera
                </FormLabel>
                <FormInput
                  {...register('sectorQueOpera')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: La Unión"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Nombre <span className="required">*</span>
                </FormLabel>
                <FormInput
                  {...register('nombre')}
                  type="text"
                  $theme={theme}
                  hasError={!!errors.nombre}
                  placeholder="Nombre completo"
                  disabled={readOnly}
                />
                {errors.nombre && <FormError $theme={theme}>{errors.nombre.message}</FormError>}
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Apellidos <span className="required">*</span>
                </FormLabel>
                <FormInput
                  {...register('apellidos')}
                  type="text"
                  $theme={theme}
                  hasError={!!errors.apellidos}
                  placeholder="Apellidos completos"
                  disabled={readOnly}
                />
                {errors.apellidos && <FormError $theme={theme}>{errors.apellidos.message}</FormError>}
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Alias
                </FormLabel>
                <FormInput
                  {...register('alias')}
                  type="text"
                  $theme={theme}
                  placeholder="Alias conocidos"
                  disabled={readOnly}
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Documento de Identidad */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <FileText size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Documento de Identidad</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGroup>
                <FormLabel $theme={theme}>
                  Tipo de Documento
                </FormLabel>
                <FormSelect
                  {...register("documentoIdentidad.tipo")}
                  $theme={theme}
                  disabled={readOnly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Otro">Otro</option>
                </FormSelect>
              </FormGroup>
              
              <FormGroup>
                <FormLabel $theme={theme}>
                  Número de Documento
                </FormLabel>
                <FormInput
                  {...register("documentoIdentidad.numero")}
                  type="text"
                  $theme={theme}
                  hasError={!!errors.documentoIdentidad?.numero}
                  placeholder="Ej: 71.278.435"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Expedido en
                </FormLabel>
                <FormInput
                  {...register("documentoIdentidad.expedidoEn")}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Itagüí (Antioquia)"
                  disabled={readOnly}
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Fecha de Nacimiento y Edad */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <Calendar size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Fecha de Nacimiento</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGroup>
                <FormLabel $theme={theme}>
                  Fecha de Nacimiento
                </FormLabel>
                <FormInput
                  {...register('fechaNacimiento')}
                  type="date"
                  $theme={theme}
                  onChange={handleBirthDateChange}
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Lugar de Nacimiento
                </FormLabel>
                <FormInput
                  {...register('lugarNacimiento')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Itagüí (Antioquia)"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Edad
                </FormLabel>
                <FormInput
                  {...register('edad')}
                  type="number"
                  $theme={theme}
                  hasError={!!errors.edad}
                  placeholder="Años"
                  min="0"
                  max="120"
                  disabled={readOnly}
                />
                {errors.edad && <FormError $theme={theme}>{errors.edad.message}</FormError>}
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Información Familiar y Personal */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <Home size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Información Personal</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGroup>
                <FormLabel $theme={theme}>
                  Hijo de
                </FormLabel>
                <FormInput
                  {...register('hijoDe')}
                  type="text"
                  $theme={theme}
                  placeholder="Nombres de los padres"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Género
                </FormLabel>
                <FormSelect
                  {...register('genero')}
                  $theme={theme}
                  disabled={readOnly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Estado Civil
                </FormLabel>
                <FormSelect
                  {...register('estadoCivil')}
                  $theme={theme}
                  disabled={readOnly}
                >
                  <option value="">Seleccionar...</option>
                  {Object.values(EstadoCivil).map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Nacionalidad
                </FormLabel>
                <FormInput
                  {...register('nacionalidad')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Colombiana"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Residencia
                  </FormLabel>
                  <FormInput
                    {...register('residencia')}
                    type="text"
                    $theme={theme}
                    placeholder="Ciudad o municipio de residencia"
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>

              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Dirección
                  </FormLabel>
                  <FormInput
                    {...register('direccion')}
                    type="text"
                    $theme={theme}
                    placeholder="Dirección completa"
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Teléfono
                </FormLabel>
                <FormInput
                  {...register('telefono')}
                  type="tel"
                  $theme={theme}
                  placeholder="Número de teléfono"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Email
                </FormLabel>
                <FormInput
                  {...register('email')}
                  type="email"
                  $theme={theme}
                  hasError={!!errors.email}
                  placeholder="Correo electrónico"
                  disabled={readOnly}
                />
                {errors.email && <FormError $theme={theme}>{errors.email.message}</FormError>}
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Información Académica y Laboral */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <GraduationCap size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Información Académica y Laboral</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Estudios Realizados
                  </FormLabel>
                  <FormTextarea
                    {...register('estudiosRealizados')}
                    $theme={theme}
                    placeholder="Descripción de estudios realizados"
                    rows={3}
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Profesión
                </FormLabel>
                <FormInput
                  {...register('profesion')}
                  type="text"
                  $theme={theme}
                  placeholder="Profesión"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Oficio
                </FormLabel>
                <FormInput
                  {...register('oficio')}
                  type="text"
                  $theme={theme}
                  placeholder="Oficio actual"
                  disabled={readOnly}
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Señales Físicas */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <Eye size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Señales Físicas</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGroup>
                <FormLabel $theme={theme}>
                  Estatura
                </FormLabel>
                <FormInput
                  {...register('senalesFisicas.estatura')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: 1,69 m"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Peso
                </FormLabel>
                <FormInput
                  {...register('senalesFisicas.peso')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: 70 kg"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Contextura Física
                </FormLabel>
                <FormInput
                  {...register('senalesFisicas.contexturaFisica')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Delgada, Media, Robusta"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Color de Piel
                </FormLabel>
                <FormInput
                  {...register('senalesFisicas.colorPiel')}
                  type="text"
                  $theme={theme}
                  placeholder="Color de piel"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Color de Ojos
                </FormLabel>
                <FormInput
                  {...register('senalesFisicas.colorOjos')}
                  type="text"
                  $theme={theme}
                  placeholder="Color de ojos"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel $theme={theme}>
                  Color de Cabello
                </FormLabel>
                <FormInput
                  {...register('senalesFisicas.colorCabello')}
                  type="text"
                  $theme={theme}
                  placeholder="Color de cabello"
                  disabled={readOnly}
                />
              </FormGroup>

              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Marcas Especiales
                  </FormLabel>
                  <FormTextarea
                    {...register('senalesFisicas.marcasEspeciales')}
                    $theme={theme}
                    placeholder="Tatuajes, cicatrices, marcas distintivas..."
                    rows={3}
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>
            </FormGrid>
          </FormSection>

          {/* Información Delictiva */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <Shield size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Información Delictiva</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Banda Delincuencial
                  </FormLabel>
                  <FormInput
                    {...register('bandaDelincuencial')}
                    type="text"
                    $theme={theme}
                    placeholder="Nombre de la banda o grupo"
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>

              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Delitos Atribuidos
                  </FormLabel>
                  <FormTextarea
                    {...register('delitosAtribuidos')}
                    $theme={theme}
                    placeholder="Descripción de delitos atribuidos..."
                    rows={4}
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>

              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Situación Jurídica
                  </FormLabel>
                  <FormTextarea
                    {...register('situacionJuridica')}
                    $theme={theme}
                    placeholder="Situación legal actual..."
                    rows={3}
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>
              
              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Antecedentes
                  </FormLabel>
                  <FormTextarea
                    {...register('antecedentes')}
                    $theme={theme}
                    placeholder="Antecedentes penales y judiciales..."
                    rows={3}
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>
            </FormGrid>
          </FormSection>

          {/* Señales Físicas Detalladas */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <Eye size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Señales Físicas Detalladas</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGroup>
                <FormLabel $theme={theme}>
                  Complexión
                </FormLabel>
                <FormInput
                  {...register('senalesFisicasDetalladas.complexion')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Atlética, Débil, Fuerte"
                  disabled={readOnly}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel $theme={theme}>
                  Forma de Cara
                </FormLabel>
                <FormInput
                  {...register('senalesFisicasDetalladas.formaCara')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Ovalada, Redonda, Cuadrada"
                  disabled={readOnly}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel $theme={theme}>
                  Tipo de Cabello
                </FormLabel>
                <FormInput
                  {...register('senalesFisicasDetalladas.tipoCabello')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Liso, Rizado, Ondulado"
                  disabled={readOnly}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel $theme={theme}>
                  Largo de Cabello
                </FormLabel>
                <FormInput
                  {...register('senalesFisicasDetalladas.largoCabello')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Corto, Medio, Largo"
                  disabled={readOnly}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel $theme={theme}>
                  Forma de Ojos
                </FormLabel>
                <FormInput
                  {...register('senalesFisicasDetalladas.formaOjos')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Redondos, Alargados, Pequeños"
                  disabled={readOnly}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel $theme={theme}>
                  Forma de Nariz
                </FormLabel>
                <FormInput
                  {...register('senalesFisicasDetalladas.formaNariz')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Recta, Aguileña, Chata"
                  disabled={readOnly}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel $theme={theme}>
                  Forma de Boca
                </FormLabel>
                <FormInput
                  {...register('senalesFisicasDetalladas.formaBoca')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Grande, Mediana, Pequeña"
                  disabled={readOnly}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel $theme={theme}>
                  Forma de Labios
                </FormLabel>
                <FormInput
                  {...register('senalesFisicasDetalladas.formaLabios')}
                  type="text"
                  $theme={theme}
                  placeholder="Ej: Gruesos, Delgados, Normales"
                  disabled={readOnly}
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Observaciones y Enlaces */}
          <FormSection $theme={theme}>
            <SectionHeader $theme={theme}>
              <SectionIcon $theme={theme}>
                <MessageSquare size={20} />
              </SectionIcon>
              <SectionTitle $theme={theme}>Observaciones Adicionales</SectionTitle>
            </SectionHeader>
            <FormGrid>
              <FormGridFull>
                <FormGroup>
                  <FormLabel $theme={theme}>
                    Observaciones
                  </FormLabel>
                  <FormTextarea
                    {...register('observaciones')}
                    $theme={theme}
                    placeholder="Observaciones generales, información adicional..."
                    rows={4}
                    disabled={readOnly}
                  />
                </FormGroup>
              </FormGridFull>

              <FormGroup>
                <FormLabel $theme={theme}>
                  URL de Google Earth
                </FormLabel>
                <FormInput
                  {...register('googleEarthUrl')}
                  type="url"
                  $theme={theme}
                  placeholder="https://earth.google.com/..."
                  disabled={readOnly}
                />
              </FormGroup>

              {/* Campo subsectorId oculto - se asigna automáticamente desde el contexto */}
              <FormInput
                {...register('subsectorId')}
                type="hidden"
                $theme={theme}
              />
            </FormGrid>
          </FormSection>

          {/* Sección de Documentos */}
          {!readOnly && (
            <FormSection $theme={theme}>
              <SectionHeader $theme={theme}>
                <SectionIcon $theme={theme}>
                  <FileText size={20} />
                </SectionIcon>
                <SectionTitle $theme={theme}>Documentos Relacionados</SectionTitle>
              </SectionHeader>
              <div style={{ marginTop: '1rem' }}>
                <DocumentUploader
                  onDocumentsChange={handleDocumentsChange}
                  maxFiles={10}
                  acceptedFileTypes={['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                  theme={theme}
                />
              </div>
            </FormSection>
          )}
        </FormSections>

        {/* Sección de Foto */}
        <PhotoUploadSection $theme={theme}>
          <SectionHeader $theme={theme}>
            <SectionIcon $theme={theme}>
              <Camera size={20} />
            </SectionIcon>
            <SectionTitle $theme={theme}>Fotografía</SectionTitle>
          </SectionHeader>
          
          <PhotoPreviewContainer>
            <PhotoPreview $theme={theme} hasImage={!!photoPreview}>
              {photoPreview ? (
                <>
                  <PhotoPreviewImage 
                    src={photoPreview} 
                    alt="Vista previa" 
                  />
                  <RemovePhotoButton
                    type="button"
                    onClick={removePhoto}
                    $theme={theme}
                    title="Eliminar foto"
                  >
                    <X size={12} />
                  </RemovePhotoButton>
                </>
              ) : (
                <PhotoPlaceholder $theme={theme}>
                  <Camera size={48} />
                  <p>Sin fotografía</p>
                </PhotoPlaceholder>
              )}
            </PhotoPreview>

            {!readOnly && (
              <>
                <FileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  id="photo-input"
                />
                
                <FileInputLabel $theme={theme} htmlFor="photo-input">
                  <Upload size={16} />
                  {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                </FileInputLabel>
              </>
            )}

            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              Máximo 5MB<br />
              JPG, PNG, GIF
            </p>
          </PhotoPreviewContainer>
        </PhotoUploadSection>
      </FormLayout>

      {/* Sección de Documentos - Solo mostrar si ya existe el indiciado */}
      {(initialData?.id || initialData?._id) && (
        <DocumentosIndiciado
          indiciadoId={initialData.id || initialData._id!}
          readOnly={readOnly}
        />
      )}

      {/* Acciones del formulario */}
      <FormActions $theme={theme}>
        <div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Progreso: {progress}% completado
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {onCancel && (
            <SecondaryButton
              type="button"
              onClick={onCancel}
              $theme={theme}
              disabled={isLoading}
            >
              <X size={16} />
              Cancelar
            </SecondaryButton>
          )}
          
          {!readOnly && (
            <PrimaryButton
              type="submit"
              form="indiciado-form"
              disabled={isLoading}
              $theme={theme}
            >
              {isLoading ? (
                <LoadingSpinner $theme={theme} />
              ) : (
                <Save size={16} />
              )}
              {isLoading ? 'Guardando...' : (isEdit || isEditing ? 'Actualizar' : 'Crear')} Indiciado
            </PrimaryButton>
          )}
        </div>
      </FormActions>
    </FormContainer>
  );
};
