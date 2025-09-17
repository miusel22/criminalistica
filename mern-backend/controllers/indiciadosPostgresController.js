const { User, Sector, Indiciado } = require('../models/sequelize');
const { buildGlobalQuery, canModifyRecord } = require('../middleware/permissions');
const fs = require('fs-extra');
const path = require('path');
const { Op } = require('sequelize');

// Helper function to get user (real user or default admin)
async function getEffectiveUser(req) {
  if (req.user) {
    return req.user;
  }
  
  // If no user, find the first admin user as default
  const defaultUser = await User.findOne({ 
    where: { role: 'admin' }
  });
  if (!defaultUser) {
    throw new Error('No hay usuarios administradores disponibles');
  }
  
  return defaultUser;
}

class IndiciadosPostgresController {
  // Helper method to parse date strings in various formats
  static parseDateString(dateStr) {
    if (!dateStr || dateStr.trim() === '') {
      return null;
    }
    
    // Remove any extra whitespace
    const cleanStr = dateStr.trim();
    
    // Try different date formats
    let date = null;
    
    // Format DD/MM/YYYY or DD/MM/YY
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
    const ddmmyyyyMatch = cleanStr.match(ddmmyyyyRegex);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      let fullYear = year;
      if (year.length === 2) {
        // Convert 2-digit year to 4-digit (assuming 1900-2099)
        fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
      }
      date = new Date(fullYear, month - 1, day);
    }
    
    // Format YYYY-MM-DD
    if (!date) {
      const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
      const yyyymmddMatch = cleanStr.match(yyyymmddRegex);
      if (yyyymmddMatch) {
        const [, year, month, day] = yyyymmddMatch;
        date = new Date(year, month - 1, day);
      }
    }
    
    // Try parsing as-is if other formats fail
    if (!date) {
      date = new Date(cleanStr);
    }
    
    // Validate the resulting date
    if (date && !isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  }

  // Crear indiciado
  async crear(req, res) {
    try {
      console.log('🆕 PostgreSQL: Creando indiciado');
      console.log('📋 Datos recibidos:', req.body);
      
      // Get effective user (logged in user or default admin)
      const effectiveUser = await getEffectiveUser(req);
      const {
        sectorQueOpera,
        nombre,
        apellidos,
        alias,
        documentoIdentidad,
        fechaNacimiento,
        edad,
        hijoDe,
        genero,
        estadoCivil,
        nacionalidad,
        residencia,
        direccion,
        telefono,
        email,
        estudiosRealizados,
        profesion,
        oficio,
        senalesFisicas,
        senalesFisicasDetalladas,
        informacionMedica,
        informacionDelito,
        informacionJudicial,
        informacionPolicial,
        estado,
        observaciones,
        bandaDelincuencial,
        delitosAtribuidos,
        situacionJuridica,
        antecedentes,
        googleEarthUrl,
        subsectorId
      } = req.body;

      console.log('👤 Usuario efectivo:', effectiveUser.email);
      console.log('📄 Datos específicos recibidos:');
      console.log('  - nombre:', nombre);
      console.log('  - apellidos:', apellidos);
      console.log('  - documentoIdentidad:', documentoIdentidad);
      console.log('  - fechaNacimiento:', fechaNacimiento);
      console.log('  - subsectorId:', subsectorId);

      // Verificar que el subsector existe y el usuario tiene acceso
      let subsectorToUse = subsectorId;
      if (subsectorId) {
        // Buscar primero como subsector, luego como sector
        let sector = await Sector.findOne({
          where: {
            id: subsectorId,
            type: 'subsector'
          }
        });
        
        // Si no se encuentra como subsector, buscar como sector
        if (!sector) {
          sector = await Sector.findOne({
            where: {
              id: subsectorId,
              type: 'sector'
            }
          });
        }

        if (!sector) {
          if (req.file) {
            fs.unlink(req.file.path).catch(console.error);
          }
          return res.status(404).json({ 
            msg: 'El sector/subsector no existe' 
          });
        }
      } else {
        // Si no se proporciona subsectorId, usar el primer sector disponible (acceso global)
        const defaultSector = await Sector.findOne({ 
          where: {
            activo: true
          },
          order: [['createdAt', 'ASC']]
        });
        if (defaultSector) {
          subsectorToUse = defaultSector.id;
          console.log('\u2139\ufe0f Usando sector por defecto:', defaultSector.nombre, defaultSector.id);
        } else {
          // Si no tiene sectores, crear uno temporal
          console.log('\ud83c\udd86 Creando sector temporal para el usuario');
          const tempSector = await Sector.create({
            nombre: `Sector Temporal - ${effectiveUser.email}`,
            descripcion: 'Sector creado autom\u00e1ticamente para indiciados',
            type: 'sector',
            ownerId: effectiveUser.id,
            activo: true
          });
          subsectorToUse = tempSector.id;
          console.log('\u2705 Sector temporal creado:', tempSector.id);
        }
      }

      // Procesar fecha de nacimiento
      let fechaNacimientoObj = {
        fecha: null,
        lugar: ''
      };
      
      if (fechaNacimiento) {
        if (typeof fechaNacimiento === 'object') {
          fechaNacimientoObj = {
            fecha: fechaNacimiento.fecha ? IndiciadosPostgresController.parseDateString(fechaNacimiento.fecha) : null,
            lugar: fechaNacimiento.lugar || ''
          };
        } else if (typeof fechaNacimiento === 'string' && fechaNacimiento.trim() !== '') {
          // Intentar parsear como JSON primero
          try {
            const parsedFecha = JSON.parse(fechaNacimiento);
            fechaNacimientoObj = {
              fecha: parsedFecha.fecha ? IndiciadosPostgresController.parseDateString(parsedFecha.fecha) : null,
              lugar: parsedFecha.lugar || ''
            };
            console.log('✅ FechaNacimiento parseada desde JSON:', fechaNacimientoObj);
          } catch (e) {
            // Si no es JSON, usar como fecha directamente
            const parsedDate = IndiciadosPostgresController.parseDateString(fechaNacimiento);
            if (parsedDate) {
              fechaNacimientoObj.fecha = parsedDate;
            }
            console.log('✅ FechaNacimiento usada como string:', fechaNacimientoObj);
          }
        }
      }

      // Procesar documento de identidad
      let documentoIdentidadObj = {
        tipo: '',
        numero: '',
        expedidoEn: ''
      };
      
      if (documentoIdentidad) {
        if (typeof documentoIdentidad === 'object') {
          documentoIdentidadObj = {
            tipo: documentoIdentidad.tipo || '',
            numero: documentoIdentidad.numero || '',
            expedidoEn: documentoIdentidad.expedidoEn || ''
          };
        } else if (typeof documentoIdentidad === 'string' && documentoIdentidad.trim() !== '') {
          // Intentar parsear como JSON primero
          try {
            const parsedDocumento = JSON.parse(documentoIdentidad);
            documentoIdentidadObj = {
              tipo: parsedDocumento.tipo || '',
              numero: parsedDocumento.numero || '',
              expedidoEn: parsedDocumento.expedidoEn || ''
            };
            console.log('✅ DocumentoIdentidad parseado desde JSON:', documentoIdentidadObj);
          } catch (e) {
            // Si no es JSON, usar como número directamente
            documentoIdentidadObj.numero = documentoIdentidad.trim();
            console.log('✅ DocumentoIdentidad usado como string:', documentoIdentidadObj);
          }
        }
      }

      // Verificar que el documento de identidad no exista (solo si se proporciona)
      if (documentoIdentidadObj.numero && documentoIdentidadObj.numero.trim() !== '') {
        const existingIndiciado = await Indiciado.findOne({
          where: {
            documentoIdentidad: {
              numero: documentoIdentidadObj.numero.trim()
            },
            activo: true
          }
        });
        
        if (existingIndiciado) {
          if (req.file) {
            fs.unlink(req.file.path).catch(console.error);
          }
          return res.status(409).json({
            msg: 'Ya existe un indiciado con ese documento de identidad'
          });
        }
      }

      // Procesar señales físicas
      let senalesFisicasObj = {
        estatura: '',
        peso: '',
        contexturaFisica: '',
        colorPiel: '',
        colorOjos: '',
        colorCabello: '',
        marcasEspeciales: '',
        tatuajes: '',
        cicatrices: '',
        piercing: '',
        deformidades: '',
        otras: ''
      };
      
      if (senalesFisicas) {
        if (typeof senalesFisicas === 'object') {
          senalesFisicasObj = { ...senalesFisicasObj, ...senalesFisicas };
        } else if (typeof senalesFisicas === 'string' && senalesFisicas.trim() !== '') {
          try {
            const parsedSenales = JSON.parse(senalesFisicas);
            senalesFisicasObj = { ...senalesFisicasObj, ...parsedSenales };
            console.log('✅ SenalesFisicas parseadas desde JSON:', senalesFisicasObj);
          } catch (e) {
            // Si no es JSON, usar como marcasEspeciales directamente
            senalesFisicasObj.marcasEspeciales = senalesFisicas.trim();
            console.log('✅ SenalesFisicas usado como string:', senalesFisicasObj);
          }
        }
      }

      // Procesar señales físicas detalladas
      let senalesFisicasDetalladasObj = {
        complexion: '',
        formaCara: '',
        tipoCabello: '',
        largoCabello: '',
        formaOjos: '',
        formaNariz: '',
        formaBoca: '',
        formaLabios: ''
      };
      
      if (senalesFisicasDetalladas) {
        if (typeof senalesFisicasDetalladas === 'object') {
          senalesFisicasDetalladasObj = { ...senalesFisicasDetalladasObj, ...senalesFisicasDetalladas };
        } else if (typeof senalesFisicasDetalladas === 'string' && senalesFisicasDetalladas.trim() !== '') {
          try {
            const parsedSenalesDetalladas = JSON.parse(senalesFisicasDetalladas);
            senalesFisicasDetalladasObj = { ...senalesFisicasDetalladasObj, ...parsedSenalesDetalladas };
            console.log('\u2705 SenalesFisicasDetalladas parseadas desde JSON:', senalesFisicasDetalladasObj);
          } catch (e) {
            // Si no es JSON válido, mantener objeto por defecto
            console.warn('Error parsing senalesFisicasDetalladas JSON:', e);
            console.log('\u2705 SenalesFisicasDetalladas usando objeto por defecto');
          }
        }
      }

      // Procesar información médica
      let informacionMedicaObj = {
        enfermedades: '',
        medicamentos: '',
        alergias: '',
        discapacidades: '',
        adicciones: '',
        tratamientos: ''
      };
      
      if (informacionMedica) {
        if (typeof informacionMedica === 'object') {
          informacionMedicaObj = { ...informacionMedicaObj, ...informacionMedica };
        } else if (typeof informacionMedica === 'string' && informacionMedica.trim() !== '') {
          try {
            const parsed = JSON.parse(informacionMedica);
            informacionMedicaObj = { ...informacionMedicaObj, ...parsed };
          } catch (e) {
            informacionMedicaObj.enfermedades = informacionMedica.trim();
          }
        }
      }

      // Procesar información del delito
      let informacionDelitoObj = {
        fechaDelito: null,
        lugarDelito: '',
        tipoDelito: '',
        modalidad: '',
        descripcionHechos: '',
        victimas: [],
        testigos: [],
        coautores: []
      };
      
      if (informacionDelito) {
        if (typeof informacionDelito === 'object') {
          informacionDelitoObj = { ...informacionDelitoObj, ...informacionDelito };
        } else if (typeof informacionDelito === 'string' && informacionDelito.trim() !== '') {
          try {
            const parsed = JSON.parse(informacionDelito);
            informacionDelitoObj = { ...informacionDelitoObj, ...parsed };
          } catch (e) {
            informacionDelitoObj.descripcionHechos = informacionDelito.trim();
          }
        }
      }

      // Procesar información judicial
      let informacionJudicialObj = {
        numeroRadicado: '',
        fiscalAsignado: '',
        juzgado: '',
        estadoProceso: '',
        fechaCaptura: null,
        lugarCaptura: '',
        ordenesPendientes: [],
        antecedentes: []
      };
      
      if (informacionJudicial) {
        if (typeof informacionJudicial === 'object') {
          informacionJudicialObj = { ...informacionJudicialObj, ...informacionJudicial };
        } else if (typeof informacionJudicial === 'string' && informacionJudicial.trim() !== '') {
          try {
            const parsed = JSON.parse(informacionJudicial);
            informacionJudicialObj = { ...informacionJudicialObj, ...parsed };
          } catch (e) {
            informacionJudicialObj.numeroRadicado = informacionJudicial.trim();
          }
        }
      }

      // Procesar información policial
      let informacionPolicialObj = {
        unidadCaptura: '',
        investigadorAsignado: '',
        numeroInvestigacion: '',
        clasificacionRiesgo: '',
        observacionesEspeciales: ''
      };
      
      if (informacionPolicial) {
        if (typeof informacionPolicial === 'object') {
          informacionPolicialObj = { ...informacionPolicialObj, ...informacionPolicial };
        } else if (typeof informacionPolicial === 'string' && informacionPolicial.trim() !== '') {
          try {
            const parsed = JSON.parse(informacionPolicial);
            informacionPolicialObj = { ...informacionPolicialObj, ...parsed };
          } catch (e) {
            informacionPolicialObj.unidadCaptura = informacionPolicial.trim();
          }
        }
      }

      // Procesar foto
      let fotoObj = {
        filename: '',
        originalName: '',
        mimeType: '',
        size: 0,
        path: '',
        fechaSubida: null
      };
      
      if (req.file) {
        fotoObj = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          fechaSubida: new Date()
        };
      }

      // Crear datos para el indiciado
      const indiciadoData = {
        sectorQueOpera: sectorQueOpera || '',
        nombre,
        apellidos,
        alias: alias || '',
        documentoIdentidad: documentoIdentidadObj,
        fechaNacimiento: fechaNacimientoObj,
        edad: edad ? parseInt(edad) : null,
        hijoDe: hijoDe || '',
        genero: genero || null,
        estadoCivil: estadoCivil || null,
        nacionalidad: nacionalidad || '',
        residencia: residencia || '',
        direccion: direccion || '',
        telefono: telefono || '',
        email: email && email.trim() !== '' ? email.trim() : null,
        estudiosRealizados: estudiosRealizados || '',
        profesion: profesion || '',
        oficio: oficio || '',
        senalesFisicas: senalesFisicasObj,
        senalesFisicasDetalladas: senalesFisicasDetalladasObj,
        informacionMedica: informacionMedicaObj,
        informacionDelito: informacionDelitoObj,
        informacionJudicial: informacionJudicialObj,
        informacionPolicial: informacionPolicialObj,
        estado: estado || 'Activo',
        foto: fotoObj,
        observaciones: observaciones || '',
        bandaDelincuencial: bandaDelincuencial || '',
        delitosAtribuidos: delitosAtribuidos || '',
        situacionJuridica: situacionJuridica || '',
        antecedentes: antecedentes || '',
        googleEarthUrl: googleEarthUrl || '',
        ownerId: effectiveUser.id,
        subsectorId: subsectorToUse,
        activo: true
      };

      console.log('💾 Datos a guardar en PostgreSQL:', {
        ...indiciadoData,
        documentoIdentidad: indiciadoData.documentoIdentidad,
        fechaNacimiento: indiciadoData.fechaNacimiento
      });

      // Crear nuevo indiciado en PostgreSQL
      const nuevoIndiciado = await Indiciado.create(indiciadoData);
      
      console.log('✅ Indiciado creado exitosamente en PostgreSQL:', nuevoIndiciado.id);

      const indiciadoDict = nuevoIndiciado.toDict();

      res.status(201).json({
        msg: 'Indiciado creado exitosamente',
        indiciado: indiciadoDict
      });

    } catch (error) {
      // Limpiar archivo si hay error
      if (req.file) {
        fs.unlink(req.file.path).catch(console.error);
      }
      console.error('❌ Error creando indiciado en PostgreSQL:', error);
      res.status(500).json({
        error: 'Error del servidor al crear indiciado',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Obtener todos los indiciados del usuario
  async obtenerTodos(req, res) {
    try {
      const effectiveUser = await getEffectiveUser(req);
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      // Construir condiciones de búsqueda
      let whereCondition = {
        activo: true
      };

      // No se filtra por ownerId - todos los roles pueden ver todos los registros
      // El control de acceso se maneja a nivel de middleware (canRead)

      // Si hay búsqueda, aplicar filtros
      if (search) {
        whereCondition[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { apellidos: { [Op.iLike]: `%${search}%` } },
          { alias: { [Op.iLike]: `%${search}%` } },
          { sectorQueOpera: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: indiciados } = await Indiciado.findAndCountAll({
        where: whereCondition,
        include: [{
          model: Sector,
          as: 'subsector',
          attributes: ['nombre', 'descripcion']
        }],
        order: [['createdAt', 'DESC']],
        offset: parseInt(offset),
        limit: parseInt(limit)
      });

      const indiciadosDict = indiciados.map(indiciado => indiciado.toDict());

      res.json({
        indiciados: indiciadosDict,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count
        }
      });

    } catch (error) {
      console.error('Error obteniendo indiciados:', error);
      res.status(500).json({
        error: 'Error del servidor al obtener indiciados',
        message: error.message
      });
    }
  }

  // Obtener un indiciado por ID
  async obtenerPorId(req, res) {
    try {
      const effectiveUser = await getEffectiveUser(req);
      
      let whereCondition = {
        id: req.params.id,
        activo: true
      };

      // No se filtra por ownerId - todos los roles pueden ver todos los registros
      // El control de acceso se maneja a nivel de middleware (canRead)
      
      console.log('🔍 Buscando indiciado PostgreSQL con condición:', whereCondition);
      
      const indiciado = await Indiciado.findOne({
        where: whereCondition,
        include: [{
          model: Sector,
          as: 'subsector',
          attributes: ['nombre', 'descripcion']
        }]
      });

      if (!indiciado) {
        console.log('❌ Indiciado no encontrado con ID:', req.params.id);
        return res.status(404).json({
          msg: 'Indiciado no encontrado'
        });
      }
      
      console.log('✅ Indiciado encontrado:', indiciado.nombre, indiciado.apellidos);

      const indiciadoDict = indiciado.toDict();
      res.json(indiciadoDict);

    } catch (error) {
      console.error('❌ Error obteniendo indiciado:', error);
      res.status(500).json({
        error: 'Error del servidor al obtener indiciado',
        message: error.message
      });
    }
  }

  // Actualizar indiciado
  async actualizar(req, res) {
    try {
      console.log('🔄 PostgreSQL: Actualizando indiciado:', req.params.id);
      console.log('📋 Datos recibidos:', req.body);
      
      const effectiveUser = await getEffectiveUser(req);
      console.log('👤 Usuario efectivo:', effectiveUser.email, '| Rol:', effectiveUser.role);
      
      let whereCondition = {
        id: req.params.id,
        activo: true
      };

      // Agregar filtros de acceso según el rol
      if (effectiveUser.role !== 'admin') {
        whereCondition.ownerId = effectiveUser.id;
      }
      
      const indiciado = await Indiciado.findOne({
        where: whereCondition
      });

      if (!indiciado) {
        console.log('❌ Indiciado no encontrado para actualización');
        if (req.file) {
          fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(404).json({
          msg: 'Indiciado no encontrado o no tienes permisos para actualizarlo'
        });
      }
      
      console.log('✅ Indiciado encontrado para actualización:', indiciado.nombre, indiciado.apellidos);
      
      // Verificar que el usuario puede modificar este registro
      if (!canModifyRecord(effectiveUser.role, indiciado.ownerId, effectiveUser.id)) {
        if (req.file) {
          fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(403).json({
          msg: 'No tiene permisos para modificar este indiciado'
        });
      }

      // Obtener datos del body
      const updateData = { ...req.body };
      
      // Validar documento de identidad único (solo si se está actualizando)
      if (updateData.documentoIdentidad) {
        let documentoNumero = null;
        
        // Extraer número del documento según el formato
        if (typeof updateData.documentoIdentidad === 'object') {
          documentoNumero = updateData.documentoIdentidad.numero;
        } else if (typeof updateData.documentoIdentidad === 'string') {
          try {
            const parsed = JSON.parse(updateData.documentoIdentidad);
            documentoNumero = parsed.numero;
          } catch (e) {
            documentoNumero = updateData.documentoIdentidad;
          }
        }
        
        // Verificar que el documento no existe en otro indiciado
        if (documentoNumero && documentoNumero.trim() !== '') {
          console.log('🔍 Verificando documento único:', documentoNumero);
          
          const existingIndiciado = await Indiciado.findOne({
            where: {
              documentoIdentidad: {
                numero: documentoNumero.trim()
              },
              activo: true,
              id: {
                [Op.ne]: req.params.id  // Excluir el indiciado actual
              }
            }
          });
          
          if (existingIndiciado) {
            console.log('❌ Documento duplicado encontrado en indiciado:', existingIndiciado.id);
            if (req.file) {
              fs.unlink(req.file.path).catch(console.error);
            }
            return res.status(409).json({
              msg: 'Ya existe un indiciado con ese documento de identidad'
            });
          }
          
          console.log('✅ Documento único verificado');
        }
      }

      // Procesar campos complejos (JSONB)
      ['documentoIdentidad', 'fechaNacimiento', 'senalesFisicas', 'senalesFisicasDetalladas', 'informacionMedica', 'informacionDelito', 'informacionJudicial', 'informacionPolicial'].forEach(field => {
        if (updateData[field]) {
          if (typeof updateData[field] === 'string') {
            try {
              updateData[field] = JSON.parse(updateData[field]);
            } catch (e) {
              console.warn(`Error parsing ${field}:`, e);
            }
          }
        }
      });

      // Validar edad
      if (updateData.edad) {
        updateData.edad = parseInt(updateData.edad);
      }

      // Actualizar foto si se proporciona una nueva
      if (req.file) {
        // Eliminar foto anterior si existe
        if (indiciado.foto && indiciado.foto.filename) {
          const oldPhotoPath = path.join(__dirname, '../uploads', indiciado.foto.filename);
          fs.unlink(oldPhotoPath).catch(console.error);
        }

        updateData.foto = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          fechaSubida: new Date()
        };
      }

      console.log('💾 Actualizando en PostgreSQL con datos:', updateData);

      // Actualizar el indiciado
      await indiciado.update(updateData);
      
      console.log('✅ Indiciado actualizado exitosamente en PostgreSQL');
      
      const indiciadoActualizado = await Indiciado.findByPk(indiciado.id);
      const indiciadoDict = indiciadoActualizado.toDict();

      res.json({
        msg: 'Indiciado actualizado exitosamente',
        indiciado: indiciadoDict
      });

    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path).catch(console.error);
      }
      console.error('❌ Error actualizando indiciado en PostgreSQL:', error);
      res.status(500).json({
        error: 'Error del servidor al actualizar indiciado',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Eliminar indiciado (soft delete)
  async eliminar(req, res) {
    try {
      const effectiveUser = await getEffectiveUser(req);
      
      let whereCondition = {
        id: req.params.id,
        activo: true
      };

      // Agregar filtros de acceso según el rol
      if (effectiveUser.role !== 'admin') {
        whereCondition.ownerId = effectiveUser.id;
      }
      
      const indiciado = await Indiciado.findOne({
        where: whereCondition
      });

      if (!indiciado) {
        return res.status(404).json({
          msg: 'Indiciado no encontrado'
        });
      }
      
      // Verificar que el usuario puede modificar este registro
      if (!canModifyRecord(effectiveUser.role, indiciado.ownerId, effectiveUser.id)) {
        return res.status(403).json({
          msg: 'No tiene permisos para eliminar este indiciado'
        });
      }

      // Soft delete
      await indiciado.update({ activo: false });

      res.json({
        msg: 'Indiciado eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando indiciado:', error);
      res.status(500).json({
        error: 'Error del servidor al eliminar indiciado',
        message: error.message
      });
    }
  }

  // Buscar indiciados
  async buscar(req, res) {
    try {
      const effectiveUser = await getEffectiveUser(req);
      const { q: query } = req.query;

      if (!query || query.trim().length === 0) {
        return res.json([]);
      }

      let whereCondition = {
        activo: true,
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${query}%` } },
          { apellidos: { [Op.iLike]: `%${query}%` } },
          { alias: { [Op.iLike]: `%${query}%` } },
          { sectorQueOpera: { [Op.iLike]: `%${query}%` } }
        ]
      };

      // No se filtra por ownerId en búsqueda - todos los roles pueden buscar en todos los registros
      // El control de acceso se maneja a nivel de middleware (canRead)

      const indiciados = await Indiciado.findAll({
        where: whereCondition,
        include: [{
          model: Sector,
          as: 'subsector',
          attributes: ['nombre', 'descripcion']
        }],
        limit: 20
      });

      const results = indiciados.map(indiciado => indiciado.toDict());
      res.json(results);

    } catch (error) {
      console.error('Error buscando indiciados:', error);
      res.status(500).json({
        error: 'Error del servidor al buscar indiciados',
        message: error.message
      });
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(req, res) {
    try {
      const effectiveUser = await getEffectiveUser(req);
      
      let whereCondition = { activo: true };

      // No se filtra por ownerId en estadísticas - todos los roles pueden ver estadísticas globales
      // El control de acceso se maneja a nivel de middleware (canRead)

      const totalIndiciados = await Indiciado.count({
        where: whereCondition
      });

      const totalEliminados = await Indiciado.count({
        where: {
          ...whereCondition,
          activo: false
        }
      });

      // Indiciados recientes (últimos 30 días)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      
      const recentesCount = await Indiciado.count({
        where: {
          ...whereCondition,
          createdAt: { [Op.gte]: fechaLimite }
        }
      });

      res.json({
        total: totalIndiciados,
        eliminados: totalEliminados,
        recientes: recentesCount
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: 'Error del servidor al obtener estadísticas',
        message: error.message
      });
    }
  }
}

module.exports = new IndiciadosPostgresController();
