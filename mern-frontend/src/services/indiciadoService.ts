import axios from 'axios';
import { Indiciado, IndiciadosResponse, EstadisticasIndiciados, IndiciadoFormData } from '../types/indiciado';

export class IndiciadoService {
  // Obtener todos los indiciados
  static async obtenerTodos(page = 1, limit = 10, search?: string): Promise<IndiciadosResponse> {
    console.log('🐘 Using PostgreSQL with pagination - Page:', page, 'Limit:', limit);
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    try {
      const response = await axios.get(`/indiciados?${params.toString()}`);
      
      // Si el backend retorna paginación estructurada
      if (response.data && response.data.pagination) {
        return {
          indiciados: response.data.indiciados || [],
          total: response.data.pagination.total,
          page: response.data.pagination.current,
          pages: response.data.pagination.pages
        };
      }
      
      // Si el backend retorna array directo (fallback)
      const indiciados = Array.isArray(response.data) ? response.data : [];
      return {
        indiciados,
        total: indiciados.length,
        page,
        pages: Math.ceil(indiciados.length / limit)
      };
    } catch (error) {
      console.error('Error obteniendo indiciados:', error);
      throw error;
    }
  }

  // Obtener un indiciado por ID
  static async obtenerPorId(id: string): Promise<Indiciado> {
    const response = await axios.get(`/indiciados/${id}`);
    console.log('🌌 RAW BACKEND RESPONSE:', {
      documentoIdentidad: response.data.documentoIdentidad,
      alias: response.data.alias,
      nombre: response.data.nombre,
      apellidos: response.data.apellidos
    });
    return response.data;
  }

  // Crear nuevo indiciado
  static async crear(data: IndiciadoFormData): Promise<{ msg: string; indiciado: Indiciado }> {
    console.log('🆕 IndiciadoService.crear - Iniciando creación');
    console.log('📋 Datos a enviar:', data);
    
    try {
      let response;
      
      // Si hay foto, usar FormData, sino usar JSON
      if (data.foto) {
        console.log('📸 Enviando con FormData (incluye foto)');
        const formData = this.prepararFormData(data);
        
        response = await axios.post('/indiciados', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        console.log('📝 Enviando con JSON (sin foto)');
        const payload = this.prepararDatosPostgres(data);
        
        response = await axios.post('/indiciados', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      console.log('✅ Indiciado creado exitosamente:');
      console.log('📄 Respuesta completa del backend:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Error en creación:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  }

  // Actualizar indiciado
  static async actualizar(id: string, data: IndiciadoFormData): Promise<{ msg: string; indiciado: Indiciado }> {
    console.log('🔄 IndiciadoService.actualizar - Iniciando actualización:', id);
    console.log('📋 Datos a enviar:', data);
    
    try {
      let response;
      
      // Si hay foto, usar FormData, sino usar JSON
      if (data.foto) {
        console.log('📸 Actualizando con FormData (incluye foto)');
        const formData = this.prepararFormData(data);
        
        response = await axios.put(`/indiciados/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        console.log('📝 Actualizando con JSON (sin foto)');
        const payload = this.prepararDatosPostgres(data);
        
        response = await axios.put(`/indiciados/${id}`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      console.log('✅ Respuesta recibida:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Error en actualización:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  }

  // Eliminar indiciado (soft delete)
  static async eliminar(id: string): Promise<{ msg: string }> {
    const response = await axios.delete(`/indiciados/${id}`);
    return response.data;
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id: string): Promise<{ msg: string }> {
    const response = await axios.delete(`/indiciados/${id}/permanent`);
    return response.data;
  }

  // Buscar indiciados
  static async buscar(query: string): Promise<Indiciado[]> {
    const response = await axios.get(`/indiciados/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(): Promise<EstadisticasIndiciados> {
    const response = await axios.get('/indiciados/stats');
    return response.data;
  }

  // Preparar datos para PostgreSQL (JSON simple)
  private static prepararDatosPostgres(data: IndiciadoFormData): any {
    console.log('📋 Datos recibidos en prepararDatosPostgres:', data);
    
    const payload: any = {
      // Campos básicos requeridos
      nombre: data.nombre || '',
      apellidos: data.apellidos || '',
      
      // Información básica - enviar siempre, incluso si está vacío
      sectorQueOpera: data.sectorQueOpera || '',
      alias: data.alias || '',
      genero: data.genero || null,
      edad: data.edad ? parseInt(data.edad.toString()) : null,
      estadoCivil: data.estadoCivil || null,
      telefono: data.telefono || '',
      email: data.email || '',
      direccion: data.direccion || '',
      estado: data.estado || 'Activo',
      observaciones: data.observaciones || '',
      subsectorId: data.subsectorId || null,
      
      // Información personal - enviar siempre
      hijoDe: data.hijoDe || '',
      nacionalidad: data.nacionalidad || '',
      residencia: data.residencia || '',
      
      // Información académica/laboral - enviar siempre
      profesion: data.profesion || '',
      oficio: data.oficio || '',
      estudiosRealizados: data.estudiosRealizados || '',
      
      // URL de Google Earth
      googleEarthUrl: data.googleEarthUrl || '',
      
      // Información delictiva - CAMPOS INDIVIDUALES
      bandaDelincuencial: data.bandaDelincuencial || '',
      delitosAtribuidos: data.delitosAtribuidos || '',
      situacionJuridica: data.situacionJuridica || '',
      antecedentes: data.antecedentes || ''
    };
    
    // Preparar documento de identidad como objeto JSONB
    payload.documentoIdentidad = {
      tipo: data.documentoIdentidad?.tipo || '',
      numero: data.documentoIdentidad?.numero || '',
      expedidoEn: data.documentoIdentidad?.expedidoEn || ''
    };
    
    // Preparar fecha de nacimiento como objeto JSONB
    payload.fechaNacimiento = {
      fecha: data.fechaNacimiento || null,
      lugar: data.lugarNacimiento || ''
    };
    
    // DEBUG: Verificar datos de señales físicas antes de procesarlas
    console.log('🔍 DEBUG - Señales físicas recibidas del formulario:', {
      senalesFisicasObject: data.senalesFisicas,
      estatura: data.senalesFisicas?.estatura,
      peso: data.senalesFisicas?.peso,
      contexturaFisica: data.senalesFisicas?.contexturaFisica,
      colorPiel: data.senalesFisicas?.colorPiel,
      colorOjos: data.senalesFisicas?.colorOjos,
      colorCabello: data.senalesFisicas?.colorCabello,
      marcasEspeciales: data.senalesFisicas?.marcasEspeciales
    });
    
    // Preparar señales físicas como objeto JSONB - EXTRAER del objeto anidado
    payload.senalesFisicas = {
      estatura: data.senalesFisicas?.estatura || '',
      peso: data.senalesFisicas?.peso || '',
      contexturaFisica: data.senalesFisicas?.contexturaFisica || '',
      colorPiel: data.senalesFisicas?.colorPiel || '',
      colorOjos: data.senalesFisicas?.colorOjos || '',
      colorCabello: data.senalesFisicas?.colorCabello || '',
      marcasEspeciales: data.senalesFisicas?.marcasEspeciales || ''
    };
    
    console.log('✨ Señales físicas preparadas para el nuevo esquema:', payload.senalesFisicas);
    
    // DEBUG: Verificar datos de señales físicas detalladas antes de procesarlas
    console.log('🔍 DEBUG - Señales físicas detalladas recibidas del formulario:', {
      senalesFisicasDetalladasObject: data.senalesFisicasDetalladas,
      complexion: data.senalesFisicasDetalladas?.complexion,
      formaCara: data.senalesFisicasDetalladas?.formaCara,
      tipoCabello: data.senalesFisicasDetalladas?.tipoCabello,
      largoCabello: data.senalesFisicasDetalladas?.largoCabello,
      formaOjos: data.senalesFisicasDetalladas?.formaOjos,
      formaNariz: data.senalesFisicasDetalladas?.formaNariz,
      formaBoca: data.senalesFisicasDetalladas?.formaBoca,
      formaLabios: data.senalesFisicasDetalladas?.formaLabios
    });
    
    // Preparar señales físicas detalladas como objeto JSONB separado - EXTRAER del objeto anidado
    payload.senalesFisicasDetalladas = {
      complexion: data.senalesFisicasDetalladas?.complexion || '',
      formaCara: data.senalesFisicasDetalladas?.formaCara || '',
      tipoCabello: data.senalesFisicasDetalladas?.tipoCabello || '',
      largoCabello: data.senalesFisicasDetalladas?.largoCabello || '',
      formaOjos: data.senalesFisicasDetalladas?.formaOjos || '',
      formaNariz: data.senalesFisicasDetalladas?.formaNariz || '',
      formaBoca: data.senalesFisicasDetalladas?.formaBoca || '',
      formaLabios: data.senalesFisicasDetalladas?.formaLabios || ''
    };
    
    console.log('✨ Señales físicas detalladas preparadas para el nuevo esquema:', payload.senalesFisicasDetalladas);
    
    // Preparar información médica como objeto JSONB
    payload.informacionMedica = {
      enfermedades: '',
      medicamentos: '',
      alergias: '',
      discapacidades: '',
      adicciones: '',
      tratamientos: ''
    };
    
    // Preparar información del delito como objeto JSONB  
    payload.informacionDelito = {
      fechaDelito: null,
      lugarDelito: '',
      tipoDelito: '',
      modalidad: '',
      descripcionHechos: data.delitosAtribuidos || '',
      victimas: [],
      testigos: [],
      coautores: []
    };
    
    // Preparar información judicial como objeto JSONB
    payload.informacionJudicial = {
      numeroRadicado: '',
      fiscalAsignado: '',
      juzgado: '',
      estadoProceso: '',
      fechaCaptura: null,
      lugarCaptura: '',
      ordenesPendientes: [],
      antecedentes: data.antecedentes ? [data.antecedentes] : []
    };
    
    // Preparar información policial como objeto JSONB
    payload.informacionPolicial = {
      unidadCaptura: '',
      investigadorAsignado: '',
      numeroInvestigacion: '',
      clasificacionRiesgo: '',
      observacionesEspeciales: ''
    };
    
    console.log('📦 Payload final preparado para PostgreSQL:');
    console.log('  - Campos básicos:', {
      nombre: payload.nombre,
      apellidos: payload.apellidos,
      alias: payload.alias,
      sectorQueOpera: payload.sectorQueOpera
    });
    console.log('  - Documento identidad:', payload.documentoIdentidad);
    console.log('  - Fecha nacimiento:', payload.fechaNacimiento);
    console.log('  - Señales físicas:', payload.senalesFisicas);
    console.log('  - Señales físicas detalladas:', payload.senalesFisicasDetalladas);
    console.log('  - SubsectorId:', payload.subsectorId);
    console.log('  - Campos individuales:', {
      bandaDelincuencial: payload.bandaDelincuencial,
      delitosAtribuidos: payload.delitosAtribuidos,
      situacionJuridica: payload.situacionJuridica,
      antecedentes: payload.antecedentes
    });
    console.log('📦 ¿TIENE PAYLOAD SENALESFISICASDETALLADAS?', !!payload.senalesFisicasDetalladas);
    console.log('📦 CONTENIDO DE SENALESFISICASDETALLADAS:', JSON.stringify(payload.senalesFisicasDetalladas, null, 2));
    console.log('🗺️ Payload completo:', payload);
    
    return payload;
  }

  // Preparar FormData para envío
  private static prepararFormData(data: IndiciadoFormData): FormData {
    const formData = new FormData();

    // Campos básicos requeridos
    formData.append('nombre', data.nombre);
    formData.append('apellidos', data.apellidos);
    
    // Campos opcionales básicos
    if (data.sectorQueOpera) formData.append('sectorQueOpera', data.sectorQueOpera);
    if (data.alias) formData.append('alias', data.alias);
    
    // Personal
    if (data.hijoDe) formData.append('hijoDe', data.hijoDe);
    if (data.genero) formData.append('genero', data.genero);
    if (data.estadoCivil) formData.append('estadoCivil', data.estadoCivil);
    if (data.nacionalidad) formData.append('nacionalidad', data.nacionalidad);
    if (data.residencia) formData.append('residencia', data.residencia);
    if (data.direccion) formData.append('direccion', data.direccion);
    if (data.telefono) formData.append('telefono', data.telefono);
    if (data.email) formData.append('email', data.email);
    
    // Académica/Laboral
    if (data.estudiosRealizados) formData.append('estudiosRealizados', data.estudiosRealizados);
    if (data.profesion) formData.append('profesion', data.profesion);
    if (data.oficio) formData.append('oficio', data.oficio);
    
    // Información delictiva
    if (data.bandaDelincuencial) formData.append('bandaDelincuencial', data.bandaDelincuencial);
    if (data.delitosAtribuidos) formData.append('delitosAtribuidos', data.delitosAtribuidos);
    if (data.situacionJuridica) formData.append('situacionJuridica', data.situacionJuridica);
    if (data.antecedentes) formData.append('antecedentes', data.antecedentes);
    
    // Adicionales
    if (data.observaciones) formData.append('observaciones', data.observaciones);
    if (data.googleEarthUrl) formData.append('googleEarthUrl', data.googleEarthUrl);
    if (data.subsectorId) formData.append('subsectorId', data.subsectorId);
    
    // Edad
    if (data.edad && data.edad !== '' && data.edad !== '0') {
      formData.append('edad', data.edad.toString());
    }

    // Documento de identidad (como JSON) - limpiar y validar antes del envío
    if (data.documentoIdentidad && Object.values(data.documentoIdentidad).some(value => value)) {
      // Limpiar el objeto para asegurar que no hay JSON strings anidados
      const cleanDocumento = {
        tipo: data.documentoIdentidad.tipo || '',
        numero: data.documentoIdentidad.numero || '',
        expedidoEn: data.documentoIdentidad.expedidoEn || ''
      };
      
      // Si algún campo contiene JSON, parsearlo
      if (typeof cleanDocumento.numero === 'string' && cleanDocumento.numero.startsWith('{')) {
        try {
          const parsed = JSON.parse(cleanDocumento.numero);
          cleanDocumento.numero = parsed.numero || '';
          cleanDocumento.expedidoEn = parsed.expedidoEn || cleanDocumento.expedidoEn;
          cleanDocumento.tipo = parsed.tipo || cleanDocumento.tipo;
        } catch (error) {
          console.warn('Error parsing nested JSON in numero:', error);
        }
      }
      
      console.log('🔍 DEBUGGING - documentoIdentidad limpio antes de enviar:', cleanDocumento);
      const documentoToSend = JSON.stringify(cleanDocumento);
      console.log('🔍 DEBUGGING - documentoIdentidad JSON string a enviar:', documentoToSend);
      formData.append('documentoIdentidad', documentoToSend);
    }

    // Fecha de nacimiento (como JSON)
    if (data.fechaNacimiento || data.lugarNacimiento) {
      const fechaNacimiento = {
        fecha: data.fechaNacimiento,
        lugar: data.lugarNacimiento
      };
      formData.append('fechaNacimiento', JSON.stringify(fechaNacimiento));
    }

    // Señales físicas básicas (como JSON) - extraer del objeto anidado
    const senalesFisicas = {
      estatura: data.senalesFisicas?.estatura,
      peso: data.senalesFisicas?.peso,
      contexturaFisica: data.senalesFisicas?.contexturaFisica,
      colorPiel: data.senalesFisicas?.colorPiel,
      colorOjos: data.senalesFisicas?.colorOjos,
      colorCabello: data.senalesFisicas?.colorCabello,
      marcasEspeciales: data.senalesFisicas?.marcasEspeciales
    };

    // Solo enviar señales físicas básicas si al menos uno está presente
    if (Object.values(senalesFisicas).some(value => value)) {
      formData.append('senalesFisicas', JSON.stringify(senalesFisicas));
    }
    
    // Señales físicas detalladas (como JSON con ñ) - extraer del objeto anidado
    const señalesFisicas = {
      complexion: data.senalesFisicasDetalladas?.complexion,
      formaCara: data.senalesFisicasDetalladas?.formaCara,
      tipoCabello: data.senalesFisicasDetalladas?.tipoCabello,
      largoCabello: data.senalesFisicasDetalladas?.largoCabello,
      formaOjos: data.senalesFisicasDetalladas?.formaOjos,
      formaNariz: data.senalesFisicasDetalladas?.formaNariz,
      formaBoca: data.senalesFisicasDetalladas?.formaBoca,
      formaLabios: data.senalesFisicasDetalladas?.formaLabios
    };

    // Solo enviar señales físicas detalladas si al menos uno está presente
    if (Object.values(señalesFisicas).some(value => value)) {
      formData.append('senalesFisicasDetalladas', JSON.stringify(señalesFisicas));
    }

    // Foto si está presente
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return formData;
  }

  // Obtener URL de la foto
  static obtenerUrlFoto(filename?: string): string | null {
    if (!filename) return null;
    
    // Si el filename ya es una URL completa de Cloudinary, devolverlo tal como está
    if (filename.startsWith('https://res.cloudinary.com')) {
      return filename;
    }
    
    // Si no, construir la URL local para compatibilidad con archivos antiguos
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/uploads/${filename}`;
  }

  // Verificar si un indiciado existe por ID
  static async verificarExistencia(id: string): Promise<boolean> {
    try {
      const response = await axios.get(`/indiciados/${id}`);
      console.log('🔍 Verificación de existencia - respuesta:', {
        status: response.status,
        existe: !!response.data,
        id: response.data?.id || response.data?._id
      });
      return !!response.data;
    } catch (error: any) {
      console.log('❌ Error verificando existencia:', error.response?.status);
      return false;
    }
  }

  // Alias para compatibilidad con otros componentes
  static async getIndiciado(id: string): Promise<Indiciado> {
    return this.obtenerPorId(id);
  }
}
