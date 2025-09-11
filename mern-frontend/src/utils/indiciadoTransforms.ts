// Helper function to transform backend data to form data
export const transformBackendDataToFormData = (backendData: any): any => {
  if (!backendData) return {};
  
  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateValue: any): string => {
    if (!dateValue) return '';
    
    try {
      let date: Date;
      if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return '';
      }
      
      if (isNaN(date.getTime())) return '';
      
      // Format as YYYY-MM-DD for input[type="date"]
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error formatting date:', dateValue, error);
      return '';
    }
  };
  
  return {
    id: backendData.id || backendData._id,
    _id: backendData.id || backendData._id,
    nombre: backendData.nombre || '',
    apellidos: backendData.apellidos || '',
    sectorQueOpera: backendData.sectorQueOpera || '',
    alias: backendData.alias || '',
    // Transform documentoIdentidad de manera robusta
    documentoIdentidad: (() => {
      let docIdentidad = { tipo: '', numero: '', expedidoEn: '' };
      
      // Caso 1: documentoIdentidad como string JSON
      if (typeof backendData.documentoIdentidad === 'string') {
        try {
          const parsed = JSON.parse(backendData.documentoIdentidad);
          docIdentidad = {
            tipo: parsed.tipo || '',
            numero: parsed.numero || '',
            expedidoEn: parsed.expedidoEn || ''
          };
        } catch (error) {
          // Si falla el parsing, usar como numero directamente
          docIdentidad.numero = backendData.documentoIdentidad;
        }
      }
      // Caso 2: documentoIdentidad como objeto
      else if (backendData.documentoIdentidad && typeof backendData.documentoIdentidad === 'object') {
        // Si el campo numero contiene JSON, parsearlo
        let numero = backendData.documentoIdentidad.numero || '';
        if (typeof numero === 'string' && numero.startsWith('{')) {
          try {
            const parsedFromNumero = JSON.parse(numero);
            docIdentidad = {
              tipo: parsedFromNumero.tipo || backendData.documentoIdentidad.tipo || '',
              numero: parsedFromNumero.numero || '',
              expedidoEn: parsedFromNumero.expedidoEn || backendData.documentoIdentidad.expedidoEn || ''
            };
          } catch (error) {
            // Si falla el parsing, usar los valores directos
            docIdentidad = {
              tipo: backendData.documentoIdentidad.tipo || '',
              numero: numero,
              expedidoEn: backendData.documentoIdentidad.expedidoEn || ''
            };
          }
        } else {
          // Usar valores directos del objeto
          docIdentidad = {
            tipo: backendData.documentoIdentidad.tipo || '',
            numero: numero,
            expedidoEn: backendData.documentoIdentidad.expedidoEn || ''
          };
        }
      }
      // Caso 3: Campos individuales directos
      else {
        docIdentidad = {
          tipo: backendData.documentoTipo || '',
          numero: backendData.documentoNumero || '',
          expedidoEn: backendData.documentoExpedidoEn || ''
        };
      }
      
      return docIdentidad;
    })(),
    // Transform nested fechaNacimiento with proper date formatting
    fechaNacimiento: formatDateForInput(backendData.fechaNacimiento?.fecha || backendData.fechaNacimiento),
    lugarNacimiento: backendData.fechaNacimiento?.lugar || backendData.lugarNacimiento || '',
    edad: backendData.edad?.toString() || '',
    // Personal info
    hijoDe: backendData.hijoDe || '',
    genero: backendData.genero || '',
    estadoCivil: backendData.estadoCivil || '',
    nacionalidad: backendData.nacionalidad || '',
    residencia: backendData.residencia || '',
    direccion: backendData.direccion || '',
    telefono: backendData.telefono || '',
    email: backendData.email || '',
    // Académica/Laboral
    estudiosRealizados: backendData.estudiosRealizados || '',
    profesion: backendData.profesion || '',
    oficio: backendData.oficio || '',
    // Transform señales físicas como objeto anidado para el formulario
    senalesFisicas: (() => {
      
      let senalesFisicas: any = {};
      
      // Si senalesFisicas es un string JSON, parsearlo
      if (typeof backendData.senalesFisicas === 'string') {
        try {
          senalesFisicas = JSON.parse(backendData.senalesFisicas);
          console.log('✨ Señales físicas parseadas desde JSON string:', senalesFisicas);
        } catch (error) {
          console.error('❌ Error parsing senalesFisicas JSON:', error);
          senalesFisicas = {};
        }
      }
      // Si senalesFisicas es un objeto, usarlo directamente
      else if (backendData.senalesFisicas && typeof backendData.senalesFisicas === 'object') {
        senalesFisicas = backendData.senalesFisicas;
      }
      
      
      const result = {
        estatura: senalesFisicas.estatura || '',
        peso: senalesFisicas.peso || '',
        contexturaFisica: senalesFisicas.contexturaFisica || '',
        colorPiel: senalesFisicas.colorPiel || '',
        colorOjos: senalesFisicas.colorOjos || '',
        colorCabello: senalesFisicas.colorCabello || '',
        marcasEspeciales: senalesFisicas.marcasEspeciales || ''
      };
      
      return result;
    })(),
    // Transform señales físicas detalladas como objeto anidado separado para el formulario
    senalesFisicasDetalladas: (() => {
      let senalesFisicasDetalladas: any = {};
      
      // Intentar primero con el campo sin ñ (senalesFisicasDetalladas)
      if (typeof backendData.senalesFisicasDetalladas === 'string') {
        try {
          senalesFisicasDetalladas = JSON.parse(backendData.senalesFisicasDetalladas);
  
        } catch (error) {
          console.error('❌ Error parsing senalesFisicasDetalladas JSON:', error);
          senalesFisicasDetalladas = {};
        }
      }
      // Si senalesFisicasDetalladas es un objeto, usarlo directamente
      else if (backendData.senalesFisicasDetalladas && typeof backendData.senalesFisicasDetalladas === 'object') {
        senalesFisicasDetalladas = backendData.senalesFisicasDetalladas;
        console.log('✨ Señales físicas detalladas como objeto (senalesFisicasDetalladas):', senalesFisicasDetalladas);
      }
      // Si no encontramos con el campo sin ñ, intentar con el campo con ñ (señalesFisicas) - MISMA SOLUCIÓN
      else if (typeof backendData.señalesFisicas === 'string') {
        try {
          senalesFisicasDetalladas = JSON.parse(backendData.señalesFisicas);
          console.log('✨ Señales físicas detalladas parseadas desde JSON string (señalesFisicas):', senalesFisicasDetalladas);
        } catch (error) {
          console.error('❌ Error parsing señalesFisicas JSON:', error);
          senalesFisicasDetalladas = {};
        }
      }
      // Si señalesFisicas es un objeto, usarlo directamente
      else if (backendData.señalesFisicas && typeof backendData.señalesFisicas === 'object') {
        senalesFisicasDetalladas = backendData.señalesFisicas;
        console.log('✨ Señales físicas detalladas como objeto (señalesFisicas):', senalesFisicasDetalladas);
      }
  
      
      const result = {
        complexion: senalesFisicasDetalladas.complexion || '',
        formaCara: senalesFisicasDetalladas.formaCara || '',
        tipoCabello: senalesFisicasDetalladas.tipoCabello || '',
        largoCabello: senalesFisicasDetalladas.largoCabello || '',
        formaOjos: senalesFisicasDetalladas.formaOjos || '',
        formaNariz: senalesFisicasDetalladas.formaNariz || '',
        formaBoca: senalesFisicasDetalladas.formaBoca || '',
        formaLabios: senalesFisicasDetalladas.formaLabios || ''
      };
      
      console.log('🎯 RESULTADO FINAL DE TRANSFORMACIÓN DE SEÑALES FÍSICAS DETALLADAS:', result);
      return result;
    })(),
    // Información delictiva - extraer de los objetos JSONB correspondientes
    bandaDelincuencial: backendData.bandaDelincuencial || '',
    delitosAtribuidos: backendData.delitosAtribuidos || '',
    situacionJuridica: backendData.situacionJuridica || '',
    antecedentes: backendData.antecedentes || '',
    // Adicionales
    observaciones: backendData.observaciones || '',
    googleEarthUrl: backendData.googleEarthUrl || '',
    subsectorId: (() => {
      
      // Si es un objeto, extraer el ID; si es string, usar directo; si no existe, string vacío
      let result = '';
      if (backendData.subsectorId) {
        if (typeof backendData.subsectorId === 'object' && backendData.subsectorId._id) {
          result = backendData.subsectorId._id;
        } else if (typeof backendData.subsectorId === 'string') {
          result = backendData.subsectorId;
        }
      }
      return result;
    })(),
    // Include photo info for display
    foto: backendData.foto,
    fotoUrl: backendData.fotoUrl
  };
};
