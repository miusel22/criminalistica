import axios from 'axios';

// Nota: axios ya está configurado en AuthContext.js con baseURL e interceptores

export interface DocumentoVehiculo {
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

export class VehiculoDocumentosService {
  
  // Subir documentos para un vehículo
  static async subirDocumentos(
    vehiculoId: string, 
    archivos: File[], 
    descripcion?: string,
    tipo?: string
  ): Promise<{ msg: string; documentos: DocumentoVehiculo[] }> {
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
    
    
    const response = await axios.post(`/vehiculos/${vehiculoId}/documentos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    
    return response.data;
  }

  // Obtener documentos de un vehículo
  static async obtenerDocumentos(vehiculoId: string): Promise<DocumentoVehiculo[]> {
    const response = await axios.get(`/vehiculos/${vehiculoId}/documentos`);
    return response.data.documentos || [];
  }

  // Eliminar un documento específico
  static async eliminarDocumento(
    vehiculoId: string, 
    documentoId: string
  ): Promise<{ msg: string }> {
    const response = await axios.delete(`/vehiculos/${vehiculoId}/documentos/${documentoId}`);
    return response.data;
  }

  // Actualizar un documento existente
  static async actualizarDocumento(
    vehiculoId: string, 
    documentoId: string,
    datos: {
      descripcion?: string;
      tipo?: string;
      archivo?: File;
    }
  ): Promise<{ msg: string; documento: DocumentoVehiculo }> {
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
    
    const response = await axios.put(`/vehiculos/${vehiculoId}/documentos/${documentoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    
    return response.data;
  }

  // Descargar un documento específico
  static async descargarDocumento(
    vehiculoId: string, 
    documentoId: string
  ): Promise<Blob> {
    const response = await axios.get(`/vehiculos/${vehiculoId}/documentos/${documentoId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Descargar archivo directamente por filename (incluye token automáticamente)
  static async descargarArchivoDirecto(filename: string): Promise<Blob> {
    const response = await axios.get(`/vehiculos/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Obtener múltiples URLs posibles para un documento
  static obtenerUrlsPosiblesDocumento(filename: string): string[] {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';
    const baseUrl = apiUrl.replace('/api', '');
    
    const rutasPosibles = [
      `${apiUrl}/vehiculos/${filename}`,
      `${baseUrl}/uploads/vehiculos/documentos/${filename}`,
      `${baseUrl}/uploads/vehiculos/${filename}`,
      `${baseUrl}/uploads/documentos/${filename}`,
      `${baseUrl}/uploads/${filename}`,
      `${baseUrl}/files/vehiculos/documentos/${filename}`,
      `${baseUrl}/files/documentos/${filename}`,
      `${baseUrl}/files/${filename}`
    ];
    
    return rutasPosibles;
  }

  // Obtener URL para descargar/ver documento (método principal)
  static obtenerUrlDocumento(filename: string): string {
    // Obtener la primera URL posible (la más probable)
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
