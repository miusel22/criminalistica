import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
import '../styles/DocumentosIndiciado.css';

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
      alert('Error cargando documentos: ' + (error.response?.data?.message || error.message));
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
      alert('Algunos archivos no son válidos:\n' + errores.join('\n'));
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
      
      alert('Documentos subidos exitosamente');
    } catch (error: any) {
      console.error('Error subiendo documentos:', error);
      alert('Error subiendo documentos: ' + (error.response?.data?.message || error.message));
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
      alert('Documento eliminado exitosamente');
    } catch (error: any) {
      console.error('❌ Error eliminando documento:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      alert('Error eliminando documento: ' + (error.response?.data?.message || error.message));
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
    
    alert(
      'Error: No se pudo descargar el documento "' + documento.originalName + '".\n\n' +
      'Posibles causas:\n' +
      '1. El archivo no existe en el servidor\n' +
      '2. Problemas de conexión\n' +
      '3. Bloqueador de popups del navegador\n\n' +
      'Filename: ' + documento.filename
    );
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
        alert(`Archivo no válido: ${validacion.error}`);
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
      
      alert('Documento actualizado exitosamente');
    } catch (error: any) {
      console.error('Error actualizando documento:', error);
      alert('Error actualizando documento: ' + (error.response?.data?.message || error.message));
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
      <div className="documents-section">
        <div className="section-header">
          <File className="section-icon" size={20} />
          <h3>Documentos Relacionados</h3>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-section">
      <div className="section-header">
        <File className="section-icon" size={20} />
        <h3>Documentos Relacionados</h3>
        {!readOnly && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary btn-sm"
            disabled={isUploading}
          >
            <Plus size={16} />
            Agregar Documentos
          </button>
        )}
      </div>

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
        <div className="no-documents">
          <File size={48} color="#ccc" />
          <p>No hay documentos adjuntos</p>
          {!readOnly && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
            >
              <Upload size={16} />
              Subir primer documento
            </button>
          )}
        </div>
      ) : (
        <div className="documents-grid">
          {documentos.map((documento) => (
            <div key={documento.id} className="document-card">
              <div className="document-icon">
                <span style={{ fontSize: '24px' }}>
                  {IndiciadoDocumentosService.obtenerIconoTipoArchivo(documento.mimeType)}
                </span>
              </div>
              
              <div className="document-info">
                <h4 className="document-name" title={documento.originalName}>
                  {documento.originalName}
                </h4>
                <p className="document-details">
                  {IndiciadoDocumentosService.formatearTamano(documento.size)} • {documento.tipo}
                </p>
                {documento.descripcion && (
                  <p className="document-description">{documento.descripcion}</p>
                )}
                <p className="document-date">
                  Subido: {new Date(documento.fechaSubida).toLocaleDateString()}
                </p>
              </div>

              <div className="document-actions">
                <button
                  onClick={() => verDocumento(documento)}
                  className="btn-icon"
                  title="Ver detalles"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => descargarDocumento(documento)}
                  className="btn-icon"
                  title="Descargar"
                >
                  <Download size={16} />
                </button>
                {!readOnly && (
                  <>
                    <button
                      onClick={() => iniciarActualizacionDocumento(documento)}
                      className="btn-icon btn-warning"
                      title="Actualizar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => eliminarDocumento(documento.id, documento.originalName)}
                      className="btn-icon btn-danger"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Subir Documentos</h3>
              <button onClick={cancelarSubida} className="btn-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="selected-files">
                <h4>Archivos seleccionados:</h4>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="selected-file">
                    <span className="file-icon">
                      {IndiciadoDocumentosService.obtenerIconoTipoArchivo(file.type)}
                    </span>
                    <span className="file-info">
                      {file.name} ({IndiciadoDocumentosService.formatearTamano(file.size)})
                    </span>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Tipo de Documento:</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="form-select"
                >
                  {tiposDocumento.map(tipoDoc => (
                    <option key={tipoDoc} value={tipoDoc}>{tipoDoc}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Descripción (opcional):</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del documento..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={cancelarSubida}
                className="btn btn-secondary"
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button
                onClick={subirDocumentos}
                className="btn btn-primary"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Subir {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista de documento */}
      {showViewModal && documentoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>Detalles del Documento</h3>
              <button onClick={cerrarModalVista} className="btn-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="document-preview">
                <div className="document-info-detailed">
                  <div className="info-row">
                    <strong>Nombre:</strong>
                    <span>{documentoSeleccionado.originalName}</span>
                  </div>
                  <div className="info-row">
                    <strong>Tipo:</strong>
                    <span>{documentoSeleccionado.tipo}</span>
                  </div>
                  <div className="info-row">
                    <strong>Tamaño:</strong>
                    <span>{IndiciadoDocumentosService.formatearTamano(documentoSeleccionado.size)}</span>
                  </div>
                  <div className="info-row">
                    <strong>Tipo MIME:</strong>
                    <span>{documentoSeleccionado.mimeType}</span>
                  </div>
                  <div className="info-row">
                    <strong>Fecha de subida:</strong>
                    <span>{new Date(documentoSeleccionado.fechaSubida).toLocaleString()}</span>
                  </div>
                  {documentoSeleccionado.descripcion && (
                    <div className="info-row">
                      <strong>Descripción:</strong>
                      <span>{documentoSeleccionado.descripcion}</span>
                    </div>
                  )}
                </div>
                
                {/* Vista previa si es imagen */}
                {documentoSeleccionado.mimeType.startsWith('image/') && (
                  <div className="image-preview">
                    <img 
                      src={documentoSeleccionado.url} 
                      alt={documentoSeleccionado.originalName}
                      style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => descargarDocumento(documentoSeleccionado)}
                className="btn btn-primary"
              >
                <Download size={16} />
                Descargar
              </button>
              <button
                onClick={cerrarModalVista}
                className="btn btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de actualización de documento */}
      {showUpdateModal && documentoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Actualizar Documento</h3>
              <button onClick={cancelarActualizacion} className="btn-close">
                <X size={20} />
              </button>
            </div>

            {/* Input oculto para actualización de archivo */}
            <input
              ref={updateFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
              onChange={handleUpdateFileSelect}
              style={{ display: 'none' }}
            />

            <div className="modal-body">
              <div className="document-info-section">
                <h4>Documento actual:</h4>
                <div className="current-document">
                  <span className="file-icon">
                    {IndiciadoDocumentosService.obtenerIconoTipoArchivo(documentoSeleccionado.mimeType)}
                  </span>
                  <span className="file-info">
                    {documentoSeleccionado.originalName} 
                    ({IndiciadoDocumentosService.formatearTamano(documentoSeleccionado.size)})
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de Documento:</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="form-select"
                >
                  {tiposDocumento.map(tipoDoc => (
                    <option key={tipoDoc} value={tipoDoc}>{tipoDoc}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del documento..."
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Reemplazar archivo (opcional):</label>
                <button
                  type="button"
                  onClick={() => updateFileInputRef.current?.click()}
                  className="btn btn-outline"
                >
                  <Upload size={16} />
                  {archivoActualizacion ? 'Cambiar archivo' : 'Seleccionar nuevo archivo'}
                </button>
                {archivoActualizacion && (
                  <div className="selected-file" style={{ marginTop: '0.5rem' }}>
                    <span className="file-icon">
                      {IndiciadoDocumentosService.obtenerIconoTipoArchivo(archivoActualizacion.type)}
                    </span>
                    <span className="file-info">
                      {archivoActualizacion.name} 
                      ({IndiciadoDocumentosService.formatearTamano(archivoActualizacion.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setArchivoActualizacion(null);
                        if (updateFileInputRef.current) {
                          updateFileInputRef.current.value = '';
                        }
                      }}
                      className="btn-remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={cancelarActualizacion}
                className="btn btn-secondary"
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                onClick={actualizarDocumento}
                className="btn btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Actualizar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Confirmation Modal */}
      <ConfirmationComponent />
    </div>
  );
};
