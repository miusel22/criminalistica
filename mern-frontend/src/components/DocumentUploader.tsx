import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { Upload, File, X, Edit3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getTheme } from '../theme/theme';

// Tipos para props de tema
interface ThemeProps {
  $theme: 'light' | 'dark';
}

export interface DocumentToUpload {
  file: File;
  tipo: string;
  descripcion: string;
}

interface DocumentUploaderProps {
  onDocumentsChange: (documents: DocumentToUpload[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  theme?: 'light' | 'dark';
}

// Styled Components
const UploaderContainer = styled.div<ThemeProps>`
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 8px;
  padding: 1rem;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
`;

const UploaderHeader = styled.div<ThemeProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h4 {
    margin: 0;
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const UploadButton = styled.button<ThemeProps>`
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
`;

const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DocumentItem = styled.div<ThemeProps>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundSecondary};
  border-radius: 6px;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $theme }) => getTheme($theme).colors.hover};
  }
`;

const DocumentIcon = styled.div<ThemeProps>`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $theme }) => getTheme($theme).colors.primary};
  color: ${({ $theme }) => getTheme($theme).colors.textInverse};
  border-radius: 4px;
`;

const DocumentInfo = styled.div`
  flex-grow: 1;
  min-width: 0;
`;

const DocumentName = styled.div<ThemeProps>`
  font-weight: 600;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DocumentSize = styled.div<ThemeProps>`
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
`;

const DocumentControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FormGroup = styled.div<ThemeProps>`
  margin-bottom: 0.5rem;
  
  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
    font-size: 0.75rem;
  }
`;

const FormSelect = styled.select<ThemeProps>`
  width: 100%;
  padding: 0.375rem;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 4px;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 0.75rem;
  
  &:focus {
    outline: none;
    border-color: ${({ $theme }) => getTheme($theme).colors.primary};
  }
`;

const FormTextarea = styled.textarea<ThemeProps>`
  width: 100%;
  padding: 0.375rem;
  border: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
  border-radius: 4px;
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 0.75rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  
  &:focus {
    outline: none;
    border-color: ${({ $theme }) => getTheme($theme).colors.primary};
  }
  
  &::placeholder {
    color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  }
`;

const IconButton = styled.button<ThemeProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $theme }) => getTheme($theme).colors.hover};
    color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  }
  
  &.danger {
    color: ${({ $theme }) => getTheme($theme).colors.danger};
    
    &:hover {
      background: ${({ $theme }) => getTheme($theme).colors.danger};
      color: white;
    }
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const EmptyState = styled.div<ThemeProps>`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  font-size: 0.875rem;
`;

// Componentes del Modal
const ModalOverlay = styled.div<ThemeProps>`
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
  padding: 1rem;
`;

const ModalContent = styled.div<ThemeProps>`
  background: ${({ $theme }) => getTheme($theme).colors.backgroundCard};
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div<ThemeProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
`;

const ModalTitle = styled.h3<ThemeProps>`
  margin: 0;
  color: ${({ $theme }) => getTheme($theme).colors.textPrimary};
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button<ThemeProps>`
  background: none;
  border: none;
  color: ${({ $theme }) => getTheme($theme).colors.textSecondary};
  cursor: pointer;
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

const ModalActions = styled.div<ThemeProps>`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ $theme }) => getTheme($theme).colors.border};
`;

const ModalButton = styled.button<ThemeProps & { $variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  ${({ $variant, $theme }) => {
    const theme = getTheme($theme);
    if ($variant === 'primary') {
      return `
        background: ${theme.colors.primary};
        color: ${theme.colors.textInverse};
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${theme.colors.primaryHover};
        }
      `;
    }
    return `
      background: ${theme.colors.backgroundSecondary};
      color: ${theme.colors.textPrimary};
      border: 1px solid ${theme.colors.border};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.hover};
      }
    `;
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentsChange,
  maxFiles = 10,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  theme: propTheme
}) => {
  const [documents, setDocuments] = useState<DocumentToUpload[]>([]);
  const [editingDocument, setEditingDocument] = useState<{ index: number; document: DocumentToUpload } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newDocumentsQueue, setNewDocumentsQueue] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (documents.length + files.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} documentos`, {
        duration: 4000,
        id: 'max-files-exceeded'
      });
      return;
    }

    const newDocuments: DocumentToUpload[] = files.map(file => ({
      file,
      tipo: 'General',
      descripcion: ''
    }));

    const updatedDocuments = [...documents, ...newDocuments];
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);

    // Crear cola de documentos nuevos para configurar
    if (newDocuments.length > 0) {
      const newIndices = newDocuments.map((_, index) => documents.length + index);
      setNewDocumentsQueue(newIndices);
      
      // Abrir modal para el primer documento
      setTimeout(() => {
        setEditingDocument({ 
          index: newIndices[0],
          document: newDocuments[0] 
        });
        setShowModal(true);
      }, 100);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
  };

  const openEditModal = (index: number) => {
    setEditingDocument({ index, document: { ...documents[index] } });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingDocument(null);
    setShowModal(false);
    setNewDocumentsQueue([]);
  };

  const saveDocumentChanges = () => {
    if (editingDocument) {
      const updatedDocuments = documents.map((doc, i) => 
        i === editingDocument.index ? editingDocument.document : doc
      );
      setDocuments(updatedDocuments);
      onDocumentsChange(updatedDocuments);
      
      // Procesar siguiente documento en la cola si existe
      const remainingQueue = newDocumentsQueue.filter(idx => idx !== editingDocument.index);
      setNewDocumentsQueue(remainingQueue);
      
      if (remainingQueue.length > 0) {
        const nextIndex = remainingQueue[0];
        setEditingDocument({ 
          index: nextIndex,
          document: updatedDocuments[nextIndex] 
        });
      } else {
        closeModal();
      }
    }
  };

  const handleModalFieldChange = (field: 'tipo' | 'descripcion', value: string) => {
    if (editingDocument) {
      setEditingDocument({
        ...editingDocument,
        document: { ...editingDocument.document, [field]: value }
      });
    }
  };

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showModal]);

  return (
    <UploaderContainer $theme={theme}>
      <UploaderHeader $theme={theme}>
        <h4>
          <File size={18} />
          Documentos ({documents.length}/{maxFiles})
        </h4>
        <UploadButton 
          $theme={theme} 
          type="button" 
          onClick={handleFileSelect}
          disabled={documents.length >= maxFiles}
        >
          <Upload size={16} />
          Seleccionar archivos
        </UploadButton>
      </UploaderHeader>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileChange}
      />

      {documents.length === 0 ? (
        <EmptyState $theme={theme}>
          No hay documentos seleccionados
          <br />
          Haz clic en "Seleccionar archivos" para agregar documentos
        </EmptyState>
      ) : (
        <DocumentsList>
          {documents.map((document, index) => (
            <DocumentItem key={index} $theme={theme}>
              <DocumentIcon $theme={theme}>
                <File size={16} />
              </DocumentIcon>
              
              <DocumentInfo>
                <DocumentName $theme={theme}>
                  {document.file.name}
                </DocumentName>
                <DocumentSize $theme={theme}>
                  {formatFileSize(document.file.size)} • {document.tipo}
                </DocumentSize>
                {document.descripcion && (
                  <DocumentSize $theme={theme} style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>
                    {document.descripcion}
                  </DocumentSize>
                )}
              </DocumentInfo>
              
              <DocumentControls>
                <IconButton
                  $theme={theme}
                  type="button"
                  onClick={() => openEditModal(index)}
                  title="Editar documento"
                >
                  <Edit3 size={14} />
                </IconButton>
                <IconButton
                  $theme={theme}
                  type="button"
                  className="danger"
                  onClick={() => removeDocument(index)}
                  title="Eliminar documento"
                >
                  <X size={14} />
                </IconButton>
              </DocumentControls>
            </DocumentItem>
          ))}
        </DocumentsList>
      )}
      
      {/* Modal de Edición */}
      {showModal && editingDocument && (
        <ModalOverlay $theme={theme} onClick={closeModal}>
          <ModalContent $theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader $theme={theme}>
              <ModalTitle $theme={theme}>
                <Edit3 size={18} />
                {newDocumentsQueue.length > 0 ? 
                  `Configurar Documento (${newDocumentsQueue.length - newDocumentsQueue.filter(idx => idx !== editingDocument?.index).length}/${newDocumentsQueue.length})` : 
                  'Editar Documento'
                }
              </ModalTitle>
              <CloseButton $theme={theme} onClick={closeModal}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>
            
            <div>
              <DocumentName $theme={theme} style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                {editingDocument.document.file.name}
              </DocumentName>
              <DocumentSize $theme={theme} style={{ marginBottom: '1.5rem' }}>
                {formatFileSize(editingDocument.document.file.size)}
              </DocumentSize>
              
              <FormGroup $theme={theme}>
                <label>Tipo de Documento:</label>
                <FormSelect
                  $theme={theme}
                  value={editingDocument.document.tipo}
                  onChange={(e) => handleModalFieldChange('tipo', e.target.value)}
                >
                  {tiposDocumento.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </FormSelect>
              </FormGroup>
              
              <FormGroup $theme={theme}>
                <label>Descripción:</label>
                <FormTextarea
                  $theme={theme}
                  value={editingDocument.document.descripcion}
                  onChange={(e) => handleModalFieldChange('descripcion', e.target.value)}
                  placeholder="Descripción del documento (opcional)"
                  rows={3}
                />
              </FormGroup>
            </div>
            
            <ModalActions $theme={theme}>
              <ModalButton $theme={theme} onClick={closeModal}>
                {newDocumentsQueue.length > 1 ? 'Cancelar Todos' : 'Cancelar'}
              </ModalButton>
              <ModalButton $theme={theme} $variant="primary" onClick={saveDocumentChanges}>
                {newDocumentsQueue.filter(idx => idx !== editingDocument?.index).length > 0 ? 'Siguiente' : 'Guardar'}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </UploaderContainer>
  );
};

export default DocumentUploader;
