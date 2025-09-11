import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import { 
  Upload, 
  File, 
  Download, 
  Eye,
  Plus,
  X,
  Edit3,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { IndiciadoDocumentosService, DocumentoIndiciado } from '../services/indiciadoDocumentosService';
import { useCustomConfirmation } from '../hooks/useCustomConfirmation';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../theme/theme';
import '../styles/DocumentosIndiciado.css';

// Tipos para props de tema
interface ThemeProps {
  $theme: 'light' | 'dark';
}

interface StyleProps {
  $theme: 'light' | 'dark';
  $variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline';
  $size?: 'small' | 'medium' | 'large';
  $disabled?: boolean;
}

// Styled Components
const DocumentsSection = styled.div<ThemeProps>`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 8px;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3<ThemeProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
`;

const NoDocuments = styled.div<ThemeProps>`
  text-align: center;
  padding: 2rem;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const DocumentCard = styled.div<ThemeProps>`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const DocumentIcon = styled.div`
  flex-shrink: 0;
`;

const DocumentInfo = styled.div`
  flex-grow: 1;
  min-width: 0;
`;

const DocumentName = styled.h4<ThemeProps>`
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
`;

const DocumentDetails = styled.p<ThemeProps>`
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
`;

const DocumentDescription = styled.p<ThemeProps>`
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-style: italic;
  opacity: 0.8;
`;

const DocumentDate = styled.p<ThemeProps>`
  margin: 0;
  font-size: 0.7rem;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  opacity: 0.7;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
`;

// Botones estilizados
const BtnIcon = styled.button<StyleProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  
  &:hover {
    background: ${({ $theme }) => getTheme($theme).colors.hover};
  }
  
  ${({ $variant, $theme }) => {
    if ($variant === 'danger') {
      return `
        color: ${getTheme($theme).colors.danger};
        border-color: ${getTheme($theme).colors.danger};
        
        &:hover {
          background: ${getTheme($theme).colors.dangerHover};
        }
      `;
    }
    if ($variant === 'warning') {
      return `
        color: ${getTheme($theme).colors.warning};
        border-color: ${getTheme($theme).colors.warning};
        
        &:hover {
          background: ${getTheme($theme).colors.warning};
        }
      `;
    }
    return '';
  }}
`;

const BtnPrimary = styled.button<StyleProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ $theme }) => getTheme($theme).colors.primary};
  color: ${({ $theme }) => getTheme($theme).colors.textInverse};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ $theme }) => getTheme($theme).colors.primaryHover};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ $size }) => {
    if ($size === 'small') {
      return `
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
      `;
    }
    return '';
  }}
`;

const BtnSecondary = styled.button<StyleProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ $theme }) => getTheme($theme).colors.hover};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BtnOutline = styled.button<StyleProps>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.primary};
  background: transparent;
  color: ${({ $theme }) => getTheme($theme).colors.primary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ $theme }) => getTheme($theme).colors.primary};
    color: ${({ $theme }) => getTheme($theme).colors.textInverse};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BtnClose = styled.button<ThemeProps>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $theme }) => getTheme($theme).colors.hover};
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  }
`;

// Modales
const ModalOverlay = styled.div`
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

const ModalContent = styled.div<ThemeProps & { $large?: boolean }>`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border-radius: 8px;
  width: 90%;
  max-width: ${({ $large }) => $large ? '700px' : '500px'};
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div<ThemeProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  background: ${({ $theme }) => getTheme($theme).colors.backgroundSecondary};
`;

const ModalTitle = styled.h3<ThemeProps>`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
`;

const ModalBody = styled.div<ThemeProps>`
  padding: 1rem;
  overflow-y: auto;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
`;

const ModalFooter = styled.div<ThemeProps>`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  background: ${({ $theme }) => getTheme($theme).colors.backgroundSecondary};
`;

// Componentes de carga
const LoadingContainer = styled.div<ThemeProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
`;

const LoadingSpinner = styled.div<ThemeProps>`
  width: 32px;
  height: 32px;
  border: 3px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-top: 3px solid ${({ $theme }) => getTheme($theme).colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SelectedFile = styled.div<ThemeProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundSecondary};
  border-radius: 4px;
  margin-bottom: 0.5rem;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
`;

const FileInfo = styled.span<ThemeProps>`
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 0.875rem;
`;

// Componentes de formulario
const FormGroup = styled.div<ThemeProps>`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
    font-size: 0.875rem;
  }
`;

const FormSelect = styled.select<ThemeProps>`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 4px;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${({ $theme }) => getTheme($theme).colors.primary};
  }
  
  option {
    background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  }
`;

const FormTextarea = styled.textarea<ThemeProps>`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 4px;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ $theme }) => getTheme($theme).colors.primary};
  }
  
  &::placeholder {
    color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  }
`;

const SelectedFiles = styled.div<ThemeProps>`
  margin-bottom: 1rem;
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  }
`;

// Componentes de información detallada
const DocumentPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DocumentInfoDetailed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InfoRow = styled.div<ThemeProps>`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  
  strong {
    min-width: 120px;
    font-weight: 600;
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  }
  
  span {
    flex: 1;
    word-break: break-word;
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  }
`;

const ImagePreview = styled.div<ThemeProps>`
  text-align: center;
  padding: 1rem;
  border: 2px dashed ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 8px;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundSecondary};
  
  img {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
  }
`;

const DocumentInfoSection = styled.div<ThemeProps>`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  }
`;

const CurrentDocument = styled.div<ThemeProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundSecondary};
  border-radius: 6px;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
`;

const BtnRemove = styled.button<ThemeProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: ${({ $theme }) => getTheme($theme).colors.danger};
  color: white;
  border-radius: 50%;
  cursor: pointer;
  margin-left: auto;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ $theme }) => getTheme($theme).colors.dangerHover};
  }
`;

interface DocumentosIndiciadoProps {
  indiciadoId: string;
  readOnly?: boolean;
  onDocumentosChange?: (documentos: DocumentoIndiciado[]) => void;
}

export const DocumentosIndiciado: React.FC<DocumentosIndiciadoProps> = ({
  indiciadoId,
  readOnly = false,
  onDocumentosChange
}) => {
  const [documentos, setDocumentos] = useState<DocumentoIndiciado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('General');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoIndiciado | null>(null);
  const [archivoActualizacion, setArchivoActualizacion] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  // Theme hook
  const { theme } = useTheme();

  // Custom confirmation hook
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  // Tipos de documentos disponibles
  const tiposDocumento = [
    'General',
    'Orden de Captura',
    'Cedula de Identidad',
    'Antecedentes',
    'Informes Policiales',
    'Testimonios',
    'Fotografías',
    'Pruebas',
    'Otros'
  ];

  // Cargar documentos al montar el componente
  useEffect(() => {
    if (indiciadoId) {
      cargarDocumentos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiciadoId]);

  const cargarDocumentos = async () => {
    setIsLoading(true);
    try {
      const docs = await IndiciadoDocumentosService.obtenerDocumentos(indiciadoId);
      console.log('📄 Documentos cargados desde el backend:', docs);
      
      // Agregar URLs a los documentos si no las tienen
      const docsConUrl = docs.map(doc => ({
        ...doc,
        url: doc.url || IndiciadoDocumentosService.obtenerUrlDocumento(doc.filename)
      }));
      
      console.log('🔗 Documentos con URLs procesadas:', docsConUrl);
      setDocumentos(docsConUrl);
      
      if (onDocumentosChange) {
        onDocumentosChange(docsConUrl);
      }
    } catch (error: any) {
      console.error('Error cargando documentos:', error);
      toast.error('Error cargando documentos: ' + (error.response?.data?.message || error.message), {
        duration: 6000,
        id: 'documents-load-error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validar cada archivo
    const archivosValidos: File[] = [];
    const errores: string[] = [];

    files.forEach(file => {
      const validacion = IndiciadoDocumentosService.validarArchivo(file);
      if (validacion.valido) {
        archivosValidos.push(file);
      } else {
        errores.push(`${file.name}: ${validacion.error}`);
      }
    });

    if (errores.length > 0) {
      toast.error('Archivos inválidos: ' + errores.join(', '), {
        duration: 6000,
        id: 'invalid-files-error'
      });
    }

    if (archivosValidos.length > 0) {
      setSelectedFiles(archivosValidos);
      setShowUploadModal(true);
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const subirDocumentos = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await IndiciadoDocumentosService.subirDocumentos(
        indiciadoId,
        selectedFiles,
        descripcion,
        tipo
      );

      // Recargar documentos
      await cargarDocumentos();
      
      // Limpiar estado
      setSelectedFiles([]);
      setDescripcion('');
      setTipo('General');
      setShowUploadModal(false);
      
      toast.success('Documentos cargados correctamente', {
        duration: 4000,
        id: 'documents-uploaded-success'
      });
    } catch (error: any) {
      console.error('Error subiendo documentos:', error);
      toast.error('Error subiendo documentos: ' + (error.response?.data?.message || error.message), {
        duration: 6000,
        id: 'documents-upload-error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const eliminarDocumento = async (documentoId: string, nombreArchivo: string) => {
    console.log('🗑️ === INICIANDO ELIMINACIÓN ===');
    console.log('🗑️ DocumentoId:', documentoId);
    console.log('🗑️ Nombre del archivo:', nombreArchivo);
    console.log('🗑️ IndiciadoId:', indiciadoId);
    
    const confirmed = await showConfirmation({
      title: 'Eliminar Documento',
      message: '¿Estás completamente seguro de que deseas eliminar este documento?',
      confirmText: 'Eliminar Documento',
      cancelText: 'Cancelar',
      variant: 'delete',
      isDestructive: true,
      userInfo: {
        name: nombreArchivo,
        email: 'Documento de indiciado',
        role: 'documento'
      },
      warningMessage: 'Esta acción no se puede deshacer. El documento se eliminará permanentemente del sistema.'
    });
    
    if (!confirmed) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }

    try {
      console.log('🔄 Enviando solicitud de eliminación...');
      await IndiciadoDocumentosService.eliminarDocumento(indiciadoId, documentoId);
      
      console.log('✅ Documento eliminado del backend, recargando lista...');
      await cargarDocumentos();
      
      console.log('✅ Lista de documentos actualizada');
      toast.success('Documento eliminado exitosamente', {
        duration: 4000,
        id: 'document-deleted-success'
      });
    } catch (error: any) {
      console.error('❌ Error eliminando documento:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      toast.error('Error eliminando documento: ' + (error.response?.data?.message || error.message), {
        duration: 6000,
        id: 'document-delete-error'
      });
    }
  };

  // Helper para descargar blob
  const descargarBlob = (blob: Blob, filename: string) => {
    try {
      console.log('📦 Creando descarga de blob:', { size: blob.size, type: blob.type, filename });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL object después de un delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      return true;
    } catch (error) {
      console.error('❌ Error creando descarga:', error);
      return false;
    }
  };

  const descargarDocumento = async (documento: DocumentoIndiciado) => {
    console.log('📥 === INICIANDO DESCARGA ===');
    console.log('📥 Documento a descargar:', documento);
    console.log('📥 IndiciadoId:', indiciadoId);
    
    // Método 1: Descarga directa desde la ruta de archivos estáticos del servidor
    // (sin usar axios para evitar el prefijo /api/)
    const staticUrl = `http://localhost:5004/uploads/documentos/${documento.filename}`;
    
    // Función helper para intentar descarga con retry
    const intentarDescargaConRetry = async (maxIntentos = 3, delay = 1000) => {
      for (let intento = 1; intento <= maxIntentos; intento++) {
        try {
          console.log(`🔄 Método 1 - Intento ${intento}/${maxIntentos}: Descarga directa desde servidor...`);
          console.log('🔄 URL estática:', staticUrl);
          
          const response = await fetch(staticUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            console.log('📦 Blob recibido:', { size: blob.size, type: blob.type });
            
            if (blob.size > 0) {
              const filename = documento.originalName || documento.filename || 'documento';
              if (descargarBlob(blob, filename)) {
                console.log('✅ ¡Descarga exitosa desde servidor de archivos!');
                return true;
              }
            }
          } else if (response.status === 429) {
            console.log(`⚠️ Rate limit (429) en intento ${intento}/${maxIntentos}`);
            
            if (intento < maxIntentos) {
              console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
              continue;
            } else {
              console.log('❌ Máximo de intentos alcanzado debido a rate limiting');
            }
          } else if (response.status === 404) {
            console.log('❌ Archivo no encontrado en el servidor (404)');
            // Para error 404, no reintentar, pasar directamente a métodos alternativos
            break;
          } else {
            console.log('⚠️ Respuesta no exitosa:', response.status, response.statusText);
            break; // No reintentar para otros errores HTTP
          }
        } catch (error) {
          console.error(`⚠️ Error en intento ${intento}:`, error);
          if (intento < maxIntentos) {
            console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }
      return false;
    };
    
    // Intentar descarga con retry
    const descargaExitosa = await intentarDescargaConRetry();
    if (descargaExitosa) {
      return;
    }
    
    // Método 2: Como fallback, usar window.open (aunque no es ideal para descarga)
    try {
      console.log('🔄 Método 2: Fallback con window.open...');
      
      const staticUrl = `http://localhost:5004/uploads/${documento.filename}`;
      console.log('🔄 URL estática para window.open:', staticUrl);
      
      // Intentar abrir en nueva ventana
      const newWindow = window.open(staticUrl, '_blank');
      
      if (newWindow) {
        console.log('✅ Archivo abierto en nueva ventana');
        // Agregar un pequeño delay y cerrar la ventana si es posible
        setTimeout(() => {
          try {
            newWindow.close();
            console.log('🔄 Ventana cerrada automáticamente');
          } catch (e) {
            console.log('ℹ️ No se pudo cerrar la ventana automáticamente');
          }
        }, 1000);
        return;
      } else {
        console.log('⚠️ No se pudo abrir nueva ventana (popup blocker?)');
      }
    } catch (error) {
      console.error('⚠️ Método 2 falló:', error);
    }
    
    // Método 3: Crear enlace de descarga directo (último recurso)
    try {
      console.log('🔄 Método 3: Enlace de descarga directo...');
      
      const staticUrl = `http://localhost:5004/uploads/${documento.filename}`;
      const filename = documento.originalName || documento.filename || 'documento';
      
      // Crear enlace temporal
      const link = document.createElement('a');
      link.href = staticUrl;
      link.download = filename;
      link.target = '_blank';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Enlace de descarga ejecutado');
      return;
    } catch (error) {
      console.error('⚠️ Método 3 falló:', error);
    }
    
    // Si todos los métodos fallan
    console.error('❌ === DESCARGA FALLIDA ===');
    console.error('❌ Todos los métodos de descarga fallaron para:', documento);
    
    toast.error('No se pudo descargar el documento "' + documento.originalName + '"', {
      duration: 8000,
      id: 'document-download-error'
    });
  };

  const cancelarSubida = () => {
    setSelectedFiles([]);
    setDescripcion('');
    setTipo('General');
    setShowUploadModal(false);
  };

  // Función para ver documento
  const verDocumento = (documento: DocumentoIndiciado) => {
    setDocumentoSeleccionado(documento);
    setShowViewModal(true);
  };

  // Función para iniciar actualización de documento
  const iniciarActualizacionDocumento = (documento: DocumentoIndiciado) => {
    setDocumentoSeleccionado(documento);
    setDescripcion(documento.descripcion || '');
    setTipo(documento.tipo || 'General');
    setShowUpdateModal(true);
  };

  // Manejar selección de archivo para actualización
  const handleUpdateFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validacion = IndiciadoDocumentosService.validarArchivo(file);
      if (validacion.valido) {
        setArchivoActualizacion(file);
      } else {
        toast.error(`Archivo no válido: ${validacion.error}`, {
          duration: 4000,
          id: 'update-file-invalid'
        });
        if (updateFileInputRef.current) {
          updateFileInputRef.current.value = '';
        }
      }
    }
  };

  // Actualizar documento
  const actualizarDocumento = async () => {
    if (!documentoSeleccionado) return;

    setIsUpdating(true);
    try {
      await IndiciadoDocumentosService.actualizarDocumento(
        indiciadoId,
        documentoSeleccionado.id,
        {
          descripcion,
          tipo,
          archivo: archivoActualizacion || undefined
        }
      );

      // Recargar documentos
      await cargarDocumentos();
      
      // Limpiar estado
      cancelarActualizacion();
      
      toast.success('Documento actualizado exitosamente', {
        duration: 4000,
        id: 'document-updated-success'
      });
    } catch (error: any) {
      console.error('Error actualizando documento:', error);
      toast.error('Error actualizando documento: ' + (error.response?.data?.message || error.message), {
        duration: 6000,
        id: 'document-update-error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar actualización
  const cancelarActualizacion = () => {
    setDocumentoSeleccionado(null);
    setArchivoActualizacion(null);
    setDescripcion('');
    setTipo('General');
    setShowUpdateModal(false);
    if (updateFileInputRef.current) {
      updateFileInputRef.current.value = '';
    }
  };

  // Cerrar modal de vista
  const cerrarModalVista = () => {
    setDocumentoSeleccionado(null);
    setShowViewModal(false);
  };

  if (isLoading) {
    return (
      <DocumentsSection $theme={theme}>
        <SectionHeader>
          <SectionTitle $theme={theme}>
            <File size={20} />
            Documentos Relacionados
          </SectionTitle>
        </SectionHeader>
        <LoadingContainer $theme={theme}>
          <LoadingSpinner $theme={theme} />
          <p>Cargando documentos...</p>
        </LoadingContainer>
      </DocumentsSection>
    );
  }

  return (
    <DocumentsSection $theme={theme}>
      <SectionHeader>
        <SectionTitle $theme={theme}>
          <File size={20} />
          Documentos Relacionados
        </SectionTitle>
        {!readOnly && (
          <BtnPrimary
            onClick={() => fileInputRef.current?.click()}
            $theme={theme}
            $size="small"
            disabled={isUploading}
          >
            <Plus size={16} />
            Agregar Documentos
          </BtnPrimary>
        )}
      </SectionHeader>

      {/* Input de archivos oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <NoDocuments $theme={theme}>
          <File size={48} style={{ color: theme === 'dark' ? '#666' : '#ccc' }} />
          <p>No hay documentos adjuntos</p>
          {!readOnly && (
            <BtnSecondary
              onClick={() => fileInputRef.current?.click()}
              $theme={theme}
            >
              <Upload size={16} />
              Subir primer documento
            </BtnSecondary>
          )}
        </NoDocuments>
      ) : (
        <DocumentsGrid>
          {documentos.map((documento) => (
            <DocumentCard key={documento.id} $theme={theme}>
              <DocumentIcon>
                <span style={{ fontSize: '24px' }}>
                  {IndiciadoDocumentosService.obtenerIconoTipoArchivo(documento.mimeType)}
                </span>
              </DocumentIcon>
              
              <DocumentInfo>
                <DocumentName $theme={theme} title={documento.originalName}>
                  {documento.originalName}
                </DocumentName>
                <DocumentDetails $theme={theme}>
                  {IndiciadoDocumentosService.formatearTamano(documento.size)} • {documento.tipo}
                </DocumentDetails>
                {documento.descripcion && (
                  <DocumentDescription $theme={theme}>{documento.descripcion}</DocumentDescription>
                )}
                <DocumentDate $theme={theme}>
                  Subido: {new Date(documento.fechaSubida).toLocaleDateString()}
                </DocumentDate>
              </DocumentInfo>

              <DocumentActions>
                <BtnIcon
                  onClick={() => verDocumento(documento)}
                  $theme={theme}
                  title="Ver detalles"
                >
                  <Eye size={16} />
                </BtnIcon>
                <BtnIcon
                  onClick={() => descargarDocumento(documento)}
                  $theme={theme}
                  title="Descargar"
                >
                  <Download size={16} />
                </BtnIcon>
                {!readOnly && (
                  <>
                    <BtnIcon
                      onClick={() => iniciarActualizacionDocumento(documento)}
                      $theme={theme}
                      $variant="warning"
                      title="Actualizar"
                    >
                      <Edit3 size={16} />
                    </BtnIcon>
                    <BtnIcon
                      onClick={() => eliminarDocumento(documento.id, documento.originalName)}
                      $theme={theme}
                      $variant="danger"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </BtnIcon>
                  </>
                )}
              </DocumentActions>
            </DocumentCard>
          ))}
        </DocumentsGrid>
      )}

      {/* Modal de subida */}
      {showUploadModal && (
        <ModalOverlay>
          <ModalContent $theme={theme}>
            <ModalHeader $theme={theme}>
              <ModalTitle $theme={theme}>Subir Documentos</ModalTitle>
              <BtnClose onClick={cancelarSubida} $theme={theme}>
                <X size={20} />
              </BtnClose>
            </ModalHeader>

            <ModalBody $theme={theme}>
              <SelectedFiles $theme={theme}>
                <h4>Archivos seleccionados:</h4>
                {selectedFiles.map((file, index) => (
                  <SelectedFile key={index} $theme={theme}>
                    <span>
                      {IndiciadoDocumentosService.obtenerIconoTipoArchivo(file.type)}
                    </span>
                    <FileInfo $theme={theme}>
                      {file.name} ({IndiciadoDocumentosService.formatearTamano(file.size)})
                    </FileInfo>
                  </SelectedFile>
                ))}
              </SelectedFiles>

              <FormGroup $theme={theme}>
                <label>Tipo de Documento:</label>
                <FormSelect
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  $theme={theme}
                >
                  {tiposDocumento.map(tipoDoc => (
                    <option key={tipoDoc} value={tipoDoc}>{tipoDoc}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup $theme={theme}>
                <label>Descripción (opcional):</label>
                <FormTextarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del documento..."
                  $theme={theme}
                  rows={3}
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter $theme={theme}>
              <BtnSecondary
                onClick={cancelarSubida}
                $theme={theme}
                $disabled={isUploading}
              >
                Cancelar
              </BtnSecondary>
              <BtnPrimary
                onClick={subirDocumentos}
                $theme={theme}
                $disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner $theme={theme} style={{ width: 16, height: 16 }} />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Subir {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </BtnPrimary>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal de vista de documento */}
      {showViewModal && documentoSeleccionado && (
        <ModalOverlay>
          <ModalContent $theme={theme} $large>
            <ModalHeader $theme={theme}>
              <ModalTitle $theme={theme}>Detalles del Documento</ModalTitle>
              <BtnClose onClick={cerrarModalVista} $theme={theme}>
                <X size={20} />
              </BtnClose>
            </ModalHeader>

            <ModalBody $theme={theme}>
              <DocumentPreview>
                <DocumentInfoDetailed>
                  <InfoRow $theme={theme}>
                    <strong>Nombre:</strong>
                    <span>{documentoSeleccionado.originalName}</span>
                  </InfoRow>
                  <InfoRow $theme={theme}>
                    <strong>Tipo:</strong>
                    <span>{documentoSeleccionado.tipo}</span>
                  </InfoRow>
                  <InfoRow $theme={theme}>
                    <strong>Tamaño:</strong>
                    <span>{IndiciadoDocumentosService.formatearTamano(documentoSeleccionado.size)}</span>
                  </InfoRow>
                  <InfoRow $theme={theme}>
                    <strong>Tipo MIME:</strong>
                    <span>{documentoSeleccionado.mimeType}</span>
                  </InfoRow>
                  <InfoRow $theme={theme}>
                    <strong>Fecha de subida:</strong>
                    <span>{new Date(documentoSeleccionado.fechaSubida).toLocaleString()}</span>
                  </InfoRow>
                  {documentoSeleccionado.descripcion && (
                    <InfoRow $theme={theme}>
                      <strong>Descripción:</strong>
                      <span>{documentoSeleccionado.descripcion}</span>
                    </InfoRow>
                  )}
                </DocumentInfoDetailed>
                
                {/* Vista previa si es imagen */}
                {documentoSeleccionado.mimeType.startsWith('image/') && (
                  <ImagePreview $theme={theme}>
                    <img 
                      src={documentoSeleccionado.url} 
                      alt={documentoSeleccionado.originalName}
                    />
                  </ImagePreview>
                )}
              </DocumentPreview>
            </ModalBody>

            <ModalFooter $theme={theme}>
              <BtnPrimary
                onClick={() => descargarDocumento(documentoSeleccionado)}
                $theme={theme}
              >
                <Download size={16} />
                Descargar
              </BtnPrimary>
              <BtnSecondary
                onClick={cerrarModalVista}
                $theme={theme}
              >
                Cerrar
              </BtnSecondary>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal de actualización de documento */}
      {showUpdateModal && documentoSeleccionado && (
        <ModalOverlay>
          <ModalContent $theme={theme}>
            <ModalHeader $theme={theme}>
              <ModalTitle $theme={theme}>Actualizar Documento</ModalTitle>
              <BtnClose onClick={cancelarActualizacion} $theme={theme}>
                <X size={20} />
              </BtnClose>
            </ModalHeader>

            {/* Input oculto para actualización de archivo */}
            <input
              ref={updateFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
              onChange={handleUpdateFileSelect}
              style={{ display: 'none' }}
            />

            <ModalBody $theme={theme}>
              <DocumentInfoSection $theme={theme}>
                <h4>Documento actual:</h4>
                <CurrentDocument $theme={theme}>
                  <span>
                    {IndiciadoDocumentosService.obtenerIconoTipoArchivo(documentoSeleccionado.mimeType)}
                  </span>
                  <FileInfo $theme={theme}>
                    {documentoSeleccionado.originalName} 
                    ({IndiciadoDocumentosService.formatearTamano(documentoSeleccionado.size)})
                  </FileInfo>
                </CurrentDocument>
              </DocumentInfoSection>

              <FormGroup $theme={theme}>
                <label>Tipo de Documento:</label>
                <FormSelect
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  $theme={theme}
                >
                  {tiposDocumento.map(tipoDoc => (
                    <option key={tipoDoc} value={tipoDoc}>{tipoDoc}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup $theme={theme}>
                <label>Descripción:</label>
                <FormTextarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del documento..."
                  $theme={theme}
                  rows={3}
                />
              </FormGroup>

              <FormGroup $theme={theme}>
                <label>Reemplazar archivo (opcional):</label>
                <BtnOutline
                  type="button"
                  onClick={() => updateFileInputRef.current?.click()}
                  $theme={theme}
                >
                  <Upload size={16} />
                  {archivoActualizacion ? 'Cambiar archivo' : 'Seleccionar nuevo archivo'}
                </BtnOutline>
                {archivoActualizacion && (
                  <SelectedFile $theme={theme} style={{ marginTop: '0.5rem' }}>
                    <span>
                      {IndiciadoDocumentosService.obtenerIconoTipoArchivo(archivoActualizacion.type)}
                    </span>
                    <FileInfo $theme={theme}>
                      {archivoActualizacion.name} 
                      ({IndiciadoDocumentosService.formatearTamano(archivoActualizacion.size)})
                    </FileInfo>
                    <BtnRemove
                      type="button"
                      onClick={() => {
                        setArchivoActualizacion(null);
                        if (updateFileInputRef.current) {
                          updateFileInputRef.current.value = '';
                        }
                      }}
                      $theme={theme}
                    >
                      <X size={12} />
                    </BtnRemove>
                  </SelectedFile>
                )}
              </FormGroup>
            </ModalBody>

            <ModalFooter $theme={theme}>
              <BtnSecondary
                onClick={cancelarActualizacion}
                $theme={theme}
                $disabled={isUpdating}
              >
                Cancelar
              </BtnSecondary>
              <BtnPrimary
                onClick={actualizarDocumento}
                $theme={theme}
                $disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <LoadingSpinner $theme={theme} style={{ width: 16, height: 16 }} />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Actualizar
                  </>
                )}
              </BtnPrimary>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {/* Custom Confirmation Modal */}
      <ConfirmationComponent />
    </DocumentsSection>
  );
};
