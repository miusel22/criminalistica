import axios from 'axios';

// Nota: axios ya está configurado en AuthContext.js con baseURL e interceptores

export interface DocumentoIndiciado {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  fechaSubida: string;
  descripcion: string;
  tipo: string;
  url?: string;
}

export class IndiciadoDocumentosService {
  
  // Subir documentos para un indiciado
  static async subirDocumentos(
    indiciadoId: string, 
    archivos: File[], 
    descripcion?: string,
    tipo?: string
  ): Promise<{ msg: string; documentos: DocumentoIndiciado[] }> {
    const formData = new FormData();
    
    // Agregar archivos
    archivos.forEach(archivo => {
      formData.append('documentos', archivo);
    });
    
    // Agregar metadatos opcionales
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }
    
    if (tipo) {
      formData.append('tipo', tipo);
    }
    
    console.log('📎 Subiendo documentos para indiciado:', indiciadoId);
    console.log('📁 Cantidad de archivos:', archivos.length);
    
    const response = await axios.post(`/indiciados/${indiciadoId}/documentos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    
    return response.data;
  }

  // Obtener documentos de un indiciado
  static async obtenerDocumentos(indiciadoId: string): Promise<DocumentoIndiciado[]> {
    const response = await axios.get(`/indiciados/${indiciadoId}/documentos`);
    return response.data.documentos || [];
  }

  // Eliminar un documento específico
  static async eliminarDocumento(
    indiciadoId: string, 
    documentoId: string
  ): Promise<{ msg: string }> {
    const response = await axios.delete(`/indiciados/${indiciadoId}/documentos/${documentoId}`);
    return response.data;
  }

  // Actualizar un documento existente
  static async actualizarDocumento(
    indiciadoId: string, 
    documentoId: string,
    datos: {
      descripcion?: string;
      tipo?: string;
      archivo?: File;
    }
  ): Promise<{ msg: string; documento: DocumentoIndiciado }> {
    const formData = new FormData();
    
    // Agregar metadatos
    if (datos.descripcion !== undefined) {
      formData.append('descripcion', datos.descripcion);
    }
    
    if (datos.tipo !== undefined) {
      formData.append('tipo', datos.tipo);
    }
    
    // Agregar archivo si se proporciona uno nuevo
    if (datos.archivo) {
      formData.append('documento', datos.archivo);
    }
    
    console.log('📝 Actualizando documento:', documentoId, 'para indiciado:', indiciadoId);
    console.log('📋 Datos de actualización:', {
      descripcion: datos.descripcion,
      tipo: datos.tipo,
      tieneNuevoArchivo: !!datos.archivo
    });
    
    const response = await axios.put(`/indiciados/${indiciadoId}/documentos/${documentoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    
    return response.data;
  }

  // Descargar un documento específico
  static async descargarDocumento(
    indiciadoId: string, 
    documentoId: string
  ): Promise<Blob> {
    const response = await axios.get(`/indiciados/${indiciadoId}/documentos/${documentoId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Descargar archivo directamente por filename (incluye token automáticamente)
  static async descargarArchivoDirecto(filename: string): Promise<Blob> {
    console.log('📥 Descargando archivo directo con token:', filename);
    const response = await axios.get(`/indiciados/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Obtener múltiples URLs posibles para un documento
  static obtenerUrlsPosiblesDocumento(filename: string): string[] {
    const apiUrl = process.env.REACT_APP_POSTGRES_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
    const baseUrl = apiUrl.replace('/api', '');
    
    // Basándose en las herramientas de desarrollador, el patrón parece ser:
    // http://localhost:5004/api/indiciados/[filename]
    const rutasPosibles = [
      `${apiUrl}/indiciados/${filename}`,  // Patrón observado en DevTools
      `${baseUrl}/uploads/indiciados/documentos/${filename}`,
      `${baseUrl}/uploads/documentos/${filename}`,
      `${baseUrl}/uploads/${filename}`,
      `${baseUrl}/files/indiciados/documentos/${filename}`,
      `${baseUrl}/files/documentos/${filename}`,
      `${baseUrl}/files/${filename}`
    ];
    
    console.log('🔗 URLs posibles para archivo:', filename, '->', rutasPosibles);
    return rutasPosibles;
  }

  // Obtener URL para descargar/ver documento (método principal)
  static obtenerUrlDocumento(documento: DocumentoIndiciado | string): string {
    // Si recibe un objeto documento completo
    if (typeof documento === 'object' && documento.path) {
      // Verificar si ya es una URL completa de Cloudinary
      if (documento.path.includes('cloudinary.com') || documento.path.startsWith('http')) {
        console.log('📎 Usando URL completa de Cloudinary:', documento.path);
        return documento.path;
      }
    }
    
    // Si es un string, asumimos que es filename
    const filename = typeof documento === 'string' ? documento : documento.filename;
    
    // Fallback a URLs locales (para documentos legacy)
    const urls = this.obtenerUrlsPosiblesDocumento(filename);
    return urls[0];
  }

  // Validar archivo antes de subir
  static validarArchivo(archivo: File): { valido: boolean; error?: string } {
    // Validar tamaño (10MB máximo)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (archivo.size > MAX_SIZE) {
      return {
        valido: false,
        error: 'El archivo no puede ser mayor a 10MB'
      };
    }

    // Validar tipos permitidos
    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      return {
        valido: false,
        error: 'Tipo de archivo no permitido. Se aceptan: PDF, imágenes, Word, Excel, texto plano'
      };
    }

    return { valido: true };
  }

  // Obtener icono según tipo de archivo
  static obtenerIconoTipoArchivo(mimeType: string): string {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('text')) return '📃';
    return '📎';
  }

  // Formatear tamaño de archivo
  static formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const decimales = 2;
    const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimales)) + ' ' + tamaños[i];
  }

  // Obtener nombre de archivo sin extensión
  static obtenerNombreSinExtension(nombreArchivo: string): string {
    return nombreArchivo.substring(0, nombreArchivo.lastIndexOf('.')) || nombreArchivo;
  }

  // Obtener extensión de archivo
  static obtenerExtension(nombreArchivo: string): string {
    return nombreArchivo.substring(nombreArchivo.lastIndexOf('.') + 1).toLowerCase();
  }
}
