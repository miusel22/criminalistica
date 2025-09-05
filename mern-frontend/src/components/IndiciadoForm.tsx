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
import '../styles/IndiciadoForm.css';
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


export const IndiciadoForm: React.FC<IndiciadoFormProps> = ({
  initialData,
  isEditing = false,
  readOnly = false,
  isEdit = false,
  onSuccess,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [subsectorOptions, setSubsectorOptions] = useState<Array<{ value: string; label: string; level: number }>>([]);
  const [loadingSubsectors, setLoadingSubsectors] = useState(false);
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
        alert('La imagen no puede ser mayor a 5MB');
        return;
      }

      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('Solo se permiten archivos de imagen (JPEG, PNG, GIF)');
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
      console.log('\n🔄 ==================== RESETEO DE FORMULARIO ====================');
      console.log('🔄 Resetting form with initialData:', {
        hasInitialData: !!initialData,
        keysCount: Object.keys(initialData).length,
        isEdit,
        readOnly
      });
      
      // Transform backend data to form format if needed
      const transformedData = isEdit || readOnly ? transformBackendDataToFormData(initialData) : initialData;
      console.log('📏 Transformed data for form (keys):', Object.keys(transformedData));
      console.log('📄 documentoIdentidad específico que se pasa al reset:', transformedData.documentoIdentidad);
      console.log('🏃 Señales físicas que se pasan al reset:');
      console.log('  - senalesFisicas object:', transformedData.senalesFisicas);
      if (transformedData.senalesFisicas) {
        console.log('    - estatura:', transformedData.senalesFisicas.estatura);
        console.log('    - peso:', transformedData.senalesFisicas.peso);
        console.log('    - contexturaFisica:', transformedData.senalesFisicas.contexturaFisica);
        console.log('    - colorPiel:', transformedData.senalesFisicas.colorPiel);
        console.log('    - colorOjos:', transformedData.senalesFisicas.colorOjos);
        console.log('    - colorCabello:', transformedData.senalesFisicas.colorCabello);
        console.log('    - marcasEspeciales:', transformedData.senalesFisicas.marcasEspeciales);
        console.log("y entonces",transformedData.senalesFisicasDetalladas);
      }
      // Reset form with only the transformed data (without empty defaults)
      reset(transformedData);
      console.log('✅ Formulario reseteado con éxito');
      console.log('🔄 ============================================================\n');
    }
  }, [initialData, isEdit, readOnly, reset]);
  

  // Cargar imagen existente si hay datos iniciales
  useEffect(() => {
    if (initialData?.foto?.filename || initialData?.fotoUrl) {
      const imageUrl = initialData.fotoUrl || 
        (initialData.foto?.filename ? IndiciadoService.obtenerUrlFoto(initialData.foto.filename) : null);
      if (imageUrl) {
        setPhotoPreview(imageUrl);
        console.log('📸 Cargando imagen existente:', imageUrl);
      }
    }
  }, [initialData]);

  // Enviar formulario
  const onSubmit = async (data: IndiciadoFormData) => {
    console.log('\n🚀 ============= INICIO SUBMIT FORMULARIO =============');
    console.log('📤 Enviando formulario...');
    console.log('🔍 Debug props completo:', {
      isEdit,
      isEditing, 
      readOnly,
      hasInitialData: !!initialData,
      hasId: !!initialData?.id,
      hasIdUnderscore: !!initialData?._id,
      initialDataId: initialData?.id,
      initialDataIdUnderscore: initialData?._id,
      initialDataKeys: initialData ? Object.keys(initialData) : [],
      completeInitialData: initialData
    });
    console.log('📋 Form data recibida completa:', data);
    console.log('🔍 Documento de identidad en form data:', data.documentoIdentidad);
    console.log('🆔 SubsectorId:', data.subsectorId);
    console.log('📷 ===== INFORMACIÓN DE FOTO =====');
    console.log('  - selectedPhoto (File object):', selectedPhoto);
    console.log('  - selectedPhoto name:', selectedPhoto?.name);
    console.log('  - selectedPhoto size:', selectedPhoto?.size);
    console.log('  - selectedPhoto type:', selectedPhoto?.type);
    console.log('  - photoPreview URL:', photoPreview);
    console.log('🔗 Props del componente:', { isEdit, isEditing, readOnly });
    console.log('🎯 Campos críticos del formulario:');
    console.log('  - alias:', data.alias);
    console.log('  - nombre:', data.nombre);
    console.log('  - apellidos:', data.apellidos);
    console.log('  - documentoIdentidad.tipo:', data.documentoIdentidad?.tipo);
    console.log('  - documentoIdentidad.numero:', data.documentoIdentidad?.numero);
    console.log('  - documentoIdentidad.expedidoEn:', data.documentoIdentidad?.expedidoEn);
    setIsLoading(true);
    
    try {
      const formDataWithPhoto = {
        ...data,
        foto: selectedPhoto || undefined
      };

      let result;
      // Verificar si estamos en modo edición usando múltiples condiciones
      const isEditMode = (isEdit || isEditing) && (initialData?.id || initialData?._id);
      const indiciadoId = initialData?.id || initialData?._id;
      
      console.log('🔍 Modo edición detectado:', isEditMode, 'con ID:', indiciadoId);
      
      if (isEditMode && indiciadoId) {
        console.log('🔄 Actualizando indiciado con ID:', indiciadoId);
        result = await IndiciadoService.actualizar(indiciadoId, formDataWithPhoto);
      } else {
        console.log('➕ Creando nuevo indiciado');
        result = await IndiciadoService.crear(formDataWithPhoto);
      }

      console.log('✅ Indiciado guardado exitosamente:', result);
      
      // Si es una creación, verificar que realmente se guardó
      if (!isEditMode) {
        const indiciadoId = result.indiciado?._id || result.indiciado?.id;
        if (indiciadoId) {
          console.log('🔍 Verificando que el indiciado se guardó realmente...');
          try {
            const existe = await IndiciadoService.verificarExistencia(indiciadoId);
            if (existe) {
              console.log('✅ Confirmado: El indiciado existe en la base de datos');
            } else {
              console.log('❌ PROBLEMA: El indiciado NO se encontró en la base de datos');
              alert('ADVERTENCIA: El indiciado parece haberse creado pero no se encuentra en la base de datos. Revisa los logs del backend.');
            }
          } catch (error) {
            console.log('❌ Error verificando existencia:', error);
          }
        }
      }
      
      if (onSuccess) {
        onSuccess(result.indiciado);
      } else {
        alert(result.msg);
        if (!isEditMode) {
          reset();
          removePhoto();
        }
      }
    } catch (error: any) {
      console.error('❌ Error al guardar indiciado:', error);
      console.error('❌ Error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.msg || error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="indiciado-form-container">
      <div className="indiciado-form-header">
        <h1 className="indiciado-form-title">
          <User size={32} />
          {readOnly ? 'Ver Indiciado' : (isEdit || isEditing ? 'Editar Indiciado' : 'Nuevo Indiciado')}
        </h1>
      </div>

      <div className="form-progress">
        <div 
          className="form-progress-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <form 
        id="indiciado-form" 
        onSubmit={(e) => {
          console.log('🎯 FORM SUBMIT EVENT TRIGGERED!');
          console.log('📝 Event:', e);
          console.log('📋 Form validity:', e.currentTarget.checkValidity());
          console.log('🔍 Form state before submit:', { errors, isValid, isSubmitting });
          
          // Llamar a handleSubmit de react-hook-form
          handleSubmit(onSubmit)(e);
        }}
        className="indiciado-form"
      >
        <div className="form-sections">
          {/* Información Básica */}
          <section className="form-section">
            <div className="section-header">
              <User className="section-icon" size={20} />
              <h2 className="section-title">Información Básica</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Sector que Opera
                </label>
                <input
                  {...register('sectorQueOpera')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: La Unión"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  {...register('nombre')}
                  type="text"
                  className={`form-input ${errors.nombre ? 'error' : ''}`}
                  placeholder="Nombre completo"
                  disabled={readOnly}
                />
                {errors.nombre && <span className="form-error">{errors.nombre.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Apellidos <span className="required">*</span>
                </label>
                <input
                  {...register('apellidos')}
                  type="text"
                  className={`form-input ${errors.apellidos ? 'error' : ''}`}
                  placeholder="Apellidos completos"
                  disabled={readOnly}
                />
                {errors.apellidos && <span className="form-error">{errors.apellidos.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Alias
                </label>
                <input
                  {...register('alias')}
                  type="text"
                  className="form-input"
                  placeholder="Alias conocidos"
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          {/* Documento de Identidad */}
          <section className="form-section">
            <div className="section-header">
              <FileText className="section-icon" size={20} />
              <h2 className="section-title">Documento de Identidad</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Tipo de Documento
                </label>
                <select
                  {...register("documentoIdentidad.tipo")}
                  className="form-select"
                  disabled={readOnly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Número de Documento
                </label>
                <input
                  {...register("documentoIdentidad.numero")}
                  type="text"
                  className={`form-input ${errors.documentoIdentidad?.numero ? 'error' : ''}`}
                  placeholder="Ej: 71.278.435"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Expedido en
                </label>
                <input
                  {...register("documentoIdentidad.expedidoEn")}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Itagüí (Antioquia)"
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          {/* Fecha de Nacimiento y Edad */}
          <section className="form-section">
            <div className="section-header">
              <Calendar className="section-icon" size={20} />
              <h2 className="section-title">Fecha de Nacimiento</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Fecha de Nacimiento
                </label>
                <input
                  {...register('fechaNacimiento')}
                  type="date"
                  className="form-input"
                  onChange={handleBirthDateChange}
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Lugar de Nacimiento
                </label>
                <input
                  {...register('lugarNacimiento')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Itagüí (Antioquia)"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Edad
                </label>
                <input
                  {...register('edad')}
                  type="number"
                  className={`form-input ${errors.edad ? 'error' : ''}`}
                  placeholder="Años"
                  min="0"
                  max="120"
                  disabled={readOnly}
                />
                {errors.edad && <span className="form-error">{errors.edad.message}</span>}
              </div>
            </div>
          </section>

          {/* Información Familiar y Personal */}
          <section className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h2 className="section-title">Información Personal</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Hijo de
                </label>
                <input
                  {...register('hijoDe')}
                  type="text"
                  className="form-input"
                  placeholder="Nombres de los padres"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Género
                </label>
                <select
                  {...register('genero')}
                  className="form-select"
                  disabled={readOnly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Estado Civil
                </label>
                <select
                  {...register('estadoCivil')}
                  className="form-select"
                  disabled={readOnly}
                >
                  <option value="">Seleccionar...</option>
                  {Object.values(EstadoCivil).map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nacionalidad
                </label>
                <input
                  {...register('nacionalidad')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Colombiana"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group form-grid-full">
                <label className="form-label">
                  Residencia
                </label>
                <input
                  {...register('residencia')}
                  type="text"
                  className="form-input"
                  placeholder="Ciudad o municipio de residencia"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group form-grid-full">
                <label className="form-label">
                  Dirección
                </label>
                <input
                  {...register('direccion')}
                  type="text"
                  className="form-input"
                  placeholder="Dirección completa"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Teléfono
                </label>
                <input
                  {...register('telefono')}
                  type="tel"
                  className="form-input"
                  placeholder="Número de teléfono"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Correo electrónico"
                  disabled={readOnly}
                />
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>
            </div>
          </section>

          {/* Información Académica y Laboral */}
          <section className="form-section">
            <div className="section-header">
              <GraduationCap className="section-icon" size={20} />
              <h2 className="section-title">Información Académica y Laboral</h2>
            </div>
            <div className="form-grid">
              <div className="form-group form-grid-full">
                <label className="form-label">
                  Estudios Realizados
                </label>
                <textarea
                  {...register('estudiosRealizados')}
                  className="form-textarea"
                  placeholder="Descripción de estudios realizados"
                  rows={3}
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Profesión
                </label>
                <input
                  {...register('profesion')}
                  type="text"
                  className="form-input"
                  placeholder="Profesión"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Oficio
                </label>
                <input
                  {...register('oficio')}
                  type="text"
                  className="form-input"
                  placeholder="Oficio actual"
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          {/* Señales Físicas */}
          <section className="form-section">
            <div className="section-header">
              <Eye className="section-icon" size={20} />
              <h2 className="section-title">Señales Físicas</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Estatura
                </label>
                <input
                  {...register('senalesFisicas.estatura')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: 1,69 m"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Peso
                </label>
                <input
                  {...register('senalesFisicas.peso')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: 70 kg"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contextura Física
                </label>
                <input
                  {...register('senalesFisicas.contexturaFisica')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Delgada, Media, Robusta"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Color de Piel
                </label>
                <input
                  {...register('senalesFisicas.colorPiel')}
                  type="text"
                  className="form-input"
                  placeholder="Color de piel"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Color de Ojos
                </label>
                <input
                  {...register('senalesFisicas.colorOjos')}
                  type="text"
                  className="form-input"
                  placeholder="Color de ojos"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Color de Cabello
                </label>
                <input
                  {...register('senalesFisicas.colorCabello')}
                  type="text"
                  className="form-input"
                  placeholder="Color de cabello"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group form-grid-full">
                <label className="form-label">
                  Marcas Especiales
                </label>
                <textarea
                  {...register('senalesFisicas.marcasEspeciales')}
                  className="form-textarea"
                  placeholder="Tatuajes, cicatrices, marcas distintivas..."
                  rows={3}
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          {/* Información Delictiva */}
          <section className="form-section">
            <div className="section-header">
              <Shield className="section-icon" size={20} />
              <h2 className="section-title">Información Delictiva</h2>
            </div>
            <div className="form-grid">
              <div className="form-group form-grid-full">
                <label className="form-label">
                  Banda Delincuencial
                </label>
                <input
                  {...register('bandaDelincuencial')}
                  type="text"
                  className="form-input"
                  placeholder="Nombre de la banda o grupo"
                  disabled={readOnly}
                />
              </div>

              <div className="form-group form-grid-full">
                <label className="form-label">
                  Delitos Atribuidos
                </label>
                <textarea
                  {...register('delitosAtribuidos')}
                  className="form-textarea"
                  placeholder="Descripción de delitos atribuidos..."
                  rows={4}
                  disabled={readOnly}
                />
              </div>

              <div className="form-group form-grid-full">
                <label className="form-label">
                  Situación Jurídica
                </label>
                <textarea
                  {...register('situacionJuridica')}
                  className="form-textarea"
                  placeholder="Situación legal actual..."
                  rows={3}
                  disabled={readOnly}
                />
              </div>
              
              <div className="form-group form-grid-full">
                <label className="form-label">
                  Antecedentes
                </label>
                <textarea
                  {...register('antecedentes')}
                  className="form-textarea"
                  placeholder="Antecedentes penales y judiciales..."
                  rows={3}
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          {/* Señales Físicas Detalladas */}
          <section className="form-section">
            <div className="section-header">
              <Eye className="section-icon" size={20} />
              <h2 className="section-title">Señales Físicas Detalladas</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Complexión
                </label>
                <input
                  {...register('senalesFisicasDetalladas.complexion')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Atlética, Débil, Fuerte"
                  disabled={readOnly}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Forma de Cara
                </label>
                <input
                  {...register('senalesFisicasDetalladas.formaCara')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Ovalada, Redonda, Cuadrada"
                  disabled={readOnly}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Tipo de Cabello
                </label>
                <input
                  {...register('senalesFisicasDetalladas.tipoCabello')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Liso, Rizado, Ondulado"
                  disabled={readOnly}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Largo de Cabello
                </label>
                <input
                  {...register('senalesFisicasDetalladas.largoCabello')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Corto, Medio, Largo"
                  disabled={readOnly}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Forma de Ojos
                </label>
                <input
                  {...register('senalesFisicasDetalladas.formaOjos')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Redondos, Alargados, Pequeños"
                  disabled={readOnly}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Forma de Nariz
                </label>
                <input
                  {...register('senalesFisicasDetalladas.formaNariz')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Recta, Aguileña, Chata"
                  disabled={readOnly}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Forma de Boca
                </label>
                <input
                  {...register('senalesFisicasDetalladas.formaBoca')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Grande, Mediana, Pequeña"
                  disabled={readOnly}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Forma de Labios
                </label>
                <input
                  {...register('senalesFisicasDetalladas.formaLabios')}
                  type="text"
                  className="form-input"
                  placeholder="Ej: Gruesos, Delgados, Normales"
                  disabled={readOnly}
                />
              </div>
            </div>
          </section>

          {/* Observaciones y Enlaces */}
          <section className="form-section">
            <div className="section-header">
              <MessageSquare className="section-icon" size={20} />
              <h2 className="section-title">Observaciones Adicionales</h2>
            </div>
            <div className="form-grid">
              <div className="form-group form-grid-full">
                <label className="form-label">
                  Observaciones
                </label>
                <textarea
                  {...register('observaciones')}
                  className="form-textarea"
                  placeholder="Observaciones generales, información adicional..."
                  rows={4}
                  disabled={readOnly}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  URL de Google Earth
                </label>
                <input
                  {...register('googleEarthUrl')}
                  type="url"
                  className="form-input"
                  placeholder="https://earth.google.com/..."
                  disabled={readOnly}
                />
              </div>

              {/* Campo subsectorId oculto - se asigna automáticamente desde el contexto */}
              <input
                {...register('subsectorId')}
                type="hidden"
              />
            </div>
          </section>
        </div>

        {/* Sección de Foto */}
        <div className="photo-upload-section">
          <div className="section-header">
            <Camera className="section-icon" size={20} />
            <h2 className="section-title">Fotografía</h2>
          </div>
          
          <div className="photo-preview-container">
            <div className={`photo-preview ${photoPreview ? 'has-image' : ''}`}>
              {photoPreview ? (
                <>
                  <img 
                    src={photoPreview} 
                    alt="Vista previa" 
                    className="photo-preview-image"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="remove-photo-btn"
                    title="Eliminar foto"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="photo-placeholder">
                  <Camera size={48} />
                  <p>Sin fotografía</p>
                </div>
              )}
            </div>

            {!readOnly && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="file-input"
                  id="photo-input"
                />
                
                <label htmlFor="photo-input" className="file-input-label">
                  <Upload size={16} />
                  {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                </label>
              </>
            )}

            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              Máximo 5MB<br />
              JPG, PNG, GIF
            </p>
          </div>
        </div>
      </form>

      {/* Sección de Documentos - Solo mostrar si ya existe el indiciado */}
      {(initialData?.id || initialData?._id) && (
        <DocumentosIndiciado
          indiciadoId={initialData.id || initialData._id!}
          readOnly={readOnly}
        />
      )}

      {/* Acciones del formulario */}
      <div className="form-actions">
        <div>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Progreso: {progress}% completado
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <X size={16} />
              Cancelar
            </button>
          )}
          
          {!readOnly && (
            <button
              type="submit"
              form="indiciado-form"
              disabled={isLoading}
              className="btn btn-primary"
              onClick={(e) => {
                console.log('🎯 BOTÓN CLICKED!');
                console.log('🔍 Form state:', { errors, isValid, isSubmitting });
                console.log('🔍 Button props:', { readOnly, isLoading });
                // No prevent default - permitir que el form se submita normalmente
              }}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <Save size={16} />
              )}
              {isLoading ? 'Guardando...' : (isEdit || isEditing ? 'Actualizar' : 'Crear')} Indiciado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
