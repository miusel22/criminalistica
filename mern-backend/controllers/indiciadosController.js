const Indiciado = require('../models/Indiciado');
const Sector = require('../models/Sector');
const Documento = require('../models/Documento');
const User = require('../models/User');
const { buildGlobalQuery, canModifyRecord } = require('../middleware/permissions');
const fs = require('fs-extra');
const path = require('path');

// Helper function to get user (real user or default admin)
async function getEffectiveUser(req) {
  if (req.user) {
    return req.user;
  }
  
  // If no user, find the first admin user as default
  const defaultUser = await User.findOne({ role: 'admin' });
  if (!defaultUser) {
    throw new Error('No hay usuarios administradores disponibles');
  }
  
  return defaultUser;
}

class IndiciadosController {
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
        bandaDelincuencial,
        delitosAtribuidos,
        antecedentes,
        situacionJuridica,
        observaciones,
        googleEarthUrl,
        subsectorId
      } = req.body;

      // Verificar que el documento de identidad no exista (solo si se proporciona)
      if (documentoIdentidad?.numero && documentoIdentidad.numero.trim() !== '') {
        const existingIndiciado = await Indiciado.findOne({
          'documentoIdentidad.numero': documentoIdentidad.numero.trim(),
          activo: true
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

      // Verificar que el subsector existe y el usuario tiene acceso
      let subsectorToUse = subsectorId;
      if (subsectorId) {
        // Verificar acceso global al subsector según el rol
        const sectorQuery = buildGlobalQuery(effectiveUser.role, {
          _id: subsectorId, 
          type: 'subsector'
        });
        
        const sector = await Sector.findOne(sectorQuery);

        if (!sector) {
          if (req.file) {
            fs.unlink(req.file.path).catch(console.error);
          }
          const errorMsg = 'El subsector no existe';
          return res.status(404).json({ msg: errorMsg });
        }
      } else {
        // Si no se proporciona subsectorId, usar el sector por defecto del usuario
        const defaultSector = await Sector.findOne({ 
          ownerId: effectiveUser._id, 
          type: 'subsector'
        });
        if (defaultSector) {
          subsectorToUse = defaultSector._id;
        }
      }

      // Procesar fecha de nacimiento
      let fechaNacimientoObj = {};
      if (fechaNacimiento) {
        if (typeof fechaNacimiento === 'object') {
          fechaNacimientoObj = fechaNacimiento;
          // Validar la fecha si viene como objeto
          if (fechaNacimientoObj.fecha) {
            const parsedDate = IndiciadosController.parseDateString(fechaNacimientoObj.fecha);
            fechaNacimientoObj.fecha = parsedDate;
          }
        } else if (typeof fechaNacimiento === 'string' && fechaNacimiento.trim() !== '') {
          // Intentar parsear como JSON primero
          try {
            const parsedFecha = JSON.parse(fechaNacimiento);
            fechaNacimientoObj = {
              fecha: parsedFecha.fecha ? IndiciadosController.parseDateString(parsedFecha.fecha) : null,
              lugar: parsedFecha.lugar || ''
            };
            console.log('✅ FechaNacimiento parseada desde JSON:', fechaNacimientoObj);
          } catch (e) {
            // Si no es JSON, usar como fecha directamente
            const parsedDate = IndiciadosController.parseDateString(fechaNacimiento);
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

      // Procesar señales físicas
      let senalesFisicasObj = {};
      if (senalesFisicas) {
        if (typeof senalesFisicas === 'object') {
          senalesFisicasObj = senalesFisicas;
        } else if (typeof senalesFisicas === 'string' && senalesFisicas.trim() !== '') {
          // Intentar parsear como JSON primero
          try {
            const parsedSenales = JSON.parse(senalesFisicas);
            senalesFisicasObj = {
              estatura: parsedSenales.estatura || '',
              peso: parsedSenales.peso || '',
              contexturaFisica: parsedSenales.contexturaFisica || '',
              colorPiel: parsedSenales.colorPiel || '',
              colorOjos: parsedSenales.colorOjos || '',
              colorCabello: parsedSenales.colorCabello || '',
              marcasEspeciales: parsedSenales.marcasEspeciales || ''
            };
            console.log('✅ SenalesFisicas parseadas desde JSON:', senalesFisicasObj);
          } catch (e) {
            // Si no es JSON, usar como marcasEspeciales directamente
            senalesFisicasObj.marcasEspeciales = senalesFisicas.trim();
            console.log('✅ SenalesFisicas usado como string:', senalesFisicasObj);
          }
        }
      }
      
      // Procesar señales físicas detalladas
      let senalesFisicasDetalladasObj = {};
      if (senalesFisicasDetalladas) {
        if (typeof senalesFisicasDetalladas === 'object') {
          senalesFisicasDetalladasObj = senalesFisicasDetalladas;
        } else if (typeof senalesFisicasDetalladas === 'string' && senalesFisicasDetalladas.trim() !== '') {
          // Intentar parsear como JSON primero
          try {
            const parsedSenalesDetalladas = JSON.parse(senalesFisicasDetalladas);
            senalesFisicasDetalladasObj = {
              complexion: parsedSenalesDetalladas.complexion || '',
              formaCara: parsedSenalesDetalladas.formaCara || '',
              tipoCabello: parsedSenalesDetalladas.tipoCabello || '',
              largoCabello: parsedSenalesDetalladas.largoCabello || '',
              formaOjos: parsedSenalesDetalladas.formaOjos || '',
              formaNariz: parsedSenalesDetalladas.formaNariz || '',
              formaBoca: parsedSenalesDetalladas.formaBoca || '',
              formaLabios: parsedSenalesDetalladas.formaLabios || ''
            };
            console.log('✅ SenalesFisicasDetalladas parseadas desde JSON:', senalesFisicasDetalladasObj);
          } catch (e) {
            // Si no es JSON válido, crear objeto vacío
            console.warn('Error parsing senalesFisicasDetalladas JSON:', e);
            console.log('✅ SenalesFisicasDetalladas con error de parsing, usando objeto vacío');
          }
        }
      }

      // Procesar foto
      let fotoObj = {};
      if (req.file) {
        fotoObj = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        };
      }

      // Crear nuevo indiciado
      const nuevoIndiciado = new Indiciado({
        sectorQueOpera: sectorQueOpera || '',
        nombre,
        apellidos,
        alias: alias || '',
        documentoIdentidad: documentoIdentidadObj,
        fechaNacimiento: fechaNacimientoObj,
        edad: edad ? parseInt(edad) : null,
        hijoDe: hijoDe || '',
        genero: genero || '',
        estadoCivil: estadoCivil || '',
        nacionalidad: nacionalidad || '',
        residencia: residencia || '',
        direccion: direccion || '',
        telefono: telefono || '',
        email: email || '',
        estudiosRealizados: estudiosRealizados || '',
        profesion: profesion || '',
        oficio: oficio || '',
        senalesFisicas: senalesFisicasObj,
        senalesFisicasDetalladas: senalesFisicasDetalladasObj,
        bandaDelincuencial: bandaDelincuencial || '',
        delitosAtribuidos: delitosAtribuidos || '',
        antecedentes: antecedentes || '',
        situacionJuridica: situacionJuridica || '',
        observaciones: observaciones || '',
        foto: fotoObj,
        googleEarthUrl: googleEarthUrl || '',
        ownerId: effectiveUser._id,
        subsectorId: subsectorToUse
      });

      await nuevoIndiciado.save();
      const indiciadoDict = await nuevoIndiciado.toDict();

      // Ya no necesitamos crear entradas en la tabla Sector para indiciados
      // La jerarquía ahora obtiene los indiciados directamente de la tabla Indiciado
      console.log('✅ Indiciado creado exitosamente:', `${nombre} ${apellidos}`, 'ID:', nuevoIndiciado._id);

      res.status(201).json({
        msg: 'Indiciado creado exitosamente',
        indiciado: indiciadoDict
      });

    } catch (error) {
      // Limpiar archivo si hay error
      if (req.file) {
        fs.unlink(req.file.path).catch(console.error);
      }
      console.error('Error creando indiciado:', error);
      res.status(500).json({
        error: 'Error del servidor al crear indiciado',
        message: error.message
      });
    }
  }

  // Obtener todos los indiciados del usuario
  async obtenerTodos(req, res) {
    try {
      const effectiveUser = await getEffectiveUser(req);
      const { page = 1, limit = 10, search } = req.query;
      const skip = (page - 1) * limit;

      // Construir query con acceso global según el rol
      let query = buildGlobalQuery(effectiveUser.role, { activo: true });

      // Si hay búsqueda, aplicar filtros
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { nombre: searchRegex },
          { apellidos: searchRegex },
          { alias: searchRegex },
          { 'documentoIdentidad.numero': searchRegex },
          { sectorQueOpera: searchRegex }
        ];
      }

      const indiciados = await Indiciado.find(query)
        .populate('subsectorId', 'nombre descripcion')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Indiciado.countDocuments(query);

      const indiciadosDict = [];
      for (const indiciado of indiciados) {
        const dict = await indiciado.toDict();
        indiciadosDict.push(dict);
      }

      res.json({
        indiciados: indiciadosDict,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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
      
      // Construir query con acceso global según el rol
      let query = buildGlobalQuery(effectiveUser.role, {
        _id: req.params.id,
        activo: true
      });
      
      console.log('🔍 Buscando indiciado con query:', query);
      
      const indiciado = await Indiciado.findOne(query)
        .populate('subsectorId', 'nombre descripcion');

      if (!indiciado) {
        console.log('❌ Indiciado no encontrado con ID:', req.params.id);
        return res.status(404).json({
          msg: 'Indiciado no encontrado'
        });
      }
      
      console.log('✅ Indiciado encontrado:', indiciado.nombre, indiciado.apellidos);

      const indiciadoDict = await indiciado.toDict();
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
      console.log('🔄 Iniciando actualización de indiciado:', req.params.id);
      console.log('📋 Datos recibidos:', req.body);
      
      const effectiveUser = await getEffectiveUser(req);
      console.log('👤 Usuario efectivo:', effectiveUser.email, '| Rol:', effectiveUser.role);
      
      // Construir query con acceso global según el rol
      let query = buildGlobalQuery(effectiveUser.role, {
        _id: req.params.id,
        activo: true
      });
      
      console.log('🔍 Query de búsqueda:', query);
      const indiciado = await Indiciado.findOne(query);

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
      if (!canModifyRecord(effectiveUser.role, indiciado.ownerId, effectiveUser._id)) {
        if (req.file) {
          fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(403).json({
          msg: 'No tiene permisos para modificar este indiciado'
        });
      }

      const {
        sectorQueOpera,
        nombre,
        apellidos,
        alias,
        // Documento
        documentoTipo,
        documentoIdentidad,
        // Fecha nacimiento
        fechaNacimiento,
        edad,
        // Personal
        hijoDe,
        genero,
        estadoCivil,
        nacionalidad,
        residencia,
        direccion,
        telefono,
        email,
        // Académica/Laboral
        estudiosRealizados,
        profesion,
        oficio,
        // Señales físicas
        senalesFisicas,
        senalesFisicasDetalladas,
        señalesFisicas,
        // Información delictiva
        bandaDelincuencial,
        delitosAtribuidos,
        situacionJuridica,
        antecedentes,
        // Adicionales
        observaciones,
        googleEarthUrl,
        subsectorId
      } = req.body;

      // Verificar cambio de documento de identidad
      if (documentoIdentidad?.numero && 
          documentoIdentidad.numero !== indiciado.documentoIdentidad.numero) {
        console.log('🆔 Verificando cambio de documento de identidad:', documentoIdentidad.numero);
        const existingIndiciado = await Indiciado.findOne({
          'documentoIdentidad.numero': documentoIdentidad.numero,
          _id: { $ne: indiciado._id }
        });
        
        if (existingIndiciado) {
          console.log('❌ Documento de identidad ya existe en otro indiciado');
          if (req.file) {
            fs.unlink(req.file.path).catch(console.error);
          }
          return res.status(409).json({
            msg: 'Ya existe un indiciado con ese documento de identidad'
          });
        }
      }

      // Actualizar campos básicos
      console.log('📝 Actualizando campos básicos...');
      if (sectorQueOpera !== undefined) {
        console.log('  - sectorQueOpera:', indiciado.sectorQueOpera, '->', sectorQueOpera);
        indiciado.sectorQueOpera = sectorQueOpera;
      }
      if (nombre !== undefined) {
        console.log('  - nombre:', indiciado.nombre, '->', nombre);
        indiciado.nombre = nombre;
      }
      if (apellidos !== undefined) {
        console.log('  - apellidos:', indiciado.apellidos, '->', apellidos);
        indiciado.apellidos = apellidos;
      }
      if (alias !== undefined) indiciado.alias = alias;
      
      // Documento
      if (documentoTipo !== undefined) indiciado.documentoTipo = documentoTipo;
      
      // Personal
      if (hijoDe !== undefined) indiciado.hijoDe = hijoDe;
      if (genero !== undefined) indiciado.genero = genero;
      if (estadoCivil !== undefined) indiciado.estadoCivil = estadoCivil;
      if (nacionalidad !== undefined) indiciado.nacionalidad = nacionalidad;
      if (residencia !== undefined) indiciado.residencia = residencia;
      if (direccion !== undefined) indiciado.direccion = direccion;
      if (telefono !== undefined) indiciado.telefono = telefono;
      if (email !== undefined) indiciado.email = email;
      
      // Académica/Laboral
      if (estudiosRealizados !== undefined) indiciado.estudiosRealizados = estudiosRealizados;
      if (profesion !== undefined) indiciado.profesion = profesion;
      if (oficio !== undefined) indiciado.oficio = oficio;
      
      // Información delictiva
      if (bandaDelincuencial !== undefined) indiciado.bandaDelincuencial = bandaDelincuencial;
      if (delitosAtribuidos !== undefined) indiciado.delitosAtribuidos = delitosAtribuidos;
      if (situacionJuridica !== undefined) indiciado.situacionJuridica = situacionJuridica;
      if (antecedentes !== undefined) indiciado.antecedentes = antecedentes;
      
      // Adicionales
      if (observaciones !== undefined) indiciado.observaciones = observaciones;
      if (googleEarthUrl !== undefined) indiciado.googleEarthUrl = googleEarthUrl;
      if (edad !== undefined) indiciado.edad = edad ? parseInt(edad) : null;
      if (subsectorId !== undefined) indiciado.subsectorId = subsectorId;

      // Actualizar documento de identidad
      if (documentoIdentidad) {
        if (typeof documentoIdentidad === 'object') {
          indiciado.documentoIdentidad = { ...indiciado.documentoIdentidad, ...documentoIdentidad };
        } else if (typeof documentoIdentidad === 'string') {
          // Intentar parsear como JSON primero
          try {
            const parsedDocumento = JSON.parse(documentoIdentidad);
            indiciado.documentoIdentidad = { 
              ...indiciado.documentoIdentidad, 
              tipo: parsedDocumento.tipo || '',
              numero: parsedDocumento.numero || '',
              expedidoEn: parsedDocumento.expedidoEn || ''
            };
            console.log('✅ DocumentoIdentidad parseado desde JSON (actualizar):', indiciado.documentoIdentidad);
          } catch (e) {
            // Si no es JSON, usar como número directamente
            indiciado.documentoIdentidad.numero = documentoIdentidad;
            console.log('✅ DocumentoIdentidad usado como string (actualizar):', indiciado.documentoIdentidad);
          }
        }
      }

      // Actualizar fecha de nacimiento
      if (fechaNacimiento) {
        if (typeof fechaNacimiento === 'object') {
          indiciado.fechaNacimiento = { ...indiciado.fechaNacimiento, ...fechaNacimiento };
          // Validar la fecha si viene como objeto
          if (fechaNacimiento.fecha) {
            const parsedDate = IndiciadosController.parseDateString(fechaNacimiento.fecha);
            indiciado.fechaNacimiento.fecha = parsedDate;
          }
        } else if (typeof fechaNacimiento === 'string' && fechaNacimiento.trim() !== '') {
          // Intentar parsear como JSON primero
          try {
            const parsedFecha = JSON.parse(fechaNacimiento);
            indiciado.fechaNacimiento = {
              ...indiciado.fechaNacimiento,
              fecha: parsedFecha.fecha ? IndiciadosController.parseDateString(parsedFecha.fecha) : null,
              lugar: parsedFecha.lugar || ''
            };
            console.log('✅ FechaNacimiento parseada desde JSON (actualizar):', indiciado.fechaNacimiento);
          } catch (e) {
            // Si no es JSON, usar como fecha directamente
            const parsedDate = IndiciadosController.parseDateString(fechaNacimiento);
            if (parsedDate) {
              indiciado.fechaNacimiento.fecha = parsedDate;
            }
            console.log('✅ FechaNacimiento usada como string (actualizar):', indiciado.fechaNacimiento);
          }
        }
      }

      // Actualizar señales físicas
      console.log('🏃 Actualizando señales físicas:', senalesFisicas, typeof senalesFisicas);
      if (senalesFisicas) {
        let senalesFisicasObj;
        if (typeof senalesFisicas === 'string' && senalesFisicas.trim() !== '') {
          try {
            const parsedSenales = JSON.parse(senalesFisicas);
            senalesFisicasObj = {
              estatura: parsedSenales.estatura || '',
              peso: parsedSenales.peso || '',
              contexturaFisica: parsedSenales.contexturaFisica || '',
              colorPiel: parsedSenales.colorPiel || '',
              colorOjos: parsedSenales.colorOjos || '',
              colorCabello: parsedSenales.colorCabello || '',
              marcasEspeciales: parsedSenales.marcasEspeciales || ''
            };
            console.log('✅ SenalesFisicas parseadas desde JSON (actualizar):', senalesFisicasObj);
          } catch (e) {
            console.warn('Error parsing senalesFisicas JSON, using as marcasEspeciales:', e);
            senalesFisicasObj = { marcasEspeciales: senalesFisicas.trim() };
            console.log('✅ SenalesFisicas usado como string (actualizar):', senalesFisicasObj);
          }
        } else if (typeof senalesFisicas === 'object') {
          senalesFisicasObj = senalesFisicas;
        }
        
        if (senalesFisicasObj) {
          console.log('🔄 Aplicando señales físicas:', senalesFisicasObj);
          // Merge con valores existentes
          indiciado.senalesFisicas = {
            ...indiciado.senalesFisicas,
            ...senalesFisicasObj
          };
          console.log('✅ Señales físicas actualizadas:', indiciado.senalesFisicas);
        }
      }
      
      // Actualizar señales físicas detalladas
      console.log('👁️ Actualizando señales físicas detalladas:', senalesFisicasDetalladas, typeof senalesFisicasDetalladas);
      if (senalesFisicasDetalladas) {
        let senalesFisicasDetalladasObj;
        if (typeof senalesFisicasDetalladas === 'string' && senalesFisicasDetalladas.trim() !== '') {
          try {
            const parsedSenalesDetalladas = JSON.parse(senalesFisicasDetalladas);
            senalesFisicasDetalladasObj = {
              complexion: parsedSenalesDetalladas.complexion || '',
              formaCara: parsedSenalesDetalladas.formaCara || '',
              tipoCabello: parsedSenalesDetalladas.tipoCabello || '',
              largoCabello: parsedSenalesDetalladas.largoCabello || '',
              formaOjos: parsedSenalesDetalladas.formaOjos || '',
              formaNariz: parsedSenalesDetalladas.formaNariz || '',
              formaBoca: parsedSenalesDetalladas.formaBoca || '',
              formaLabios: parsedSenalesDetalladas.formaLabios || ''
            };
            console.log('✅ SenalesFisicasDetalladas parseadas desde JSON (actualizar):', senalesFisicasDetalladasObj);
          } catch (e) {
            console.warn('Error parsing senalesFisicasDetalladas JSON:', e);
            console.log('✅ SenalesFisicasDetalladas con error de parsing, usando objeto vacío');
          }
        } else if (typeof senalesFisicasDetalladas === 'object') {
          senalesFisicasDetalladasObj = senalesFisicasDetalladas;
        }
        
        if (senalesFisicasDetalladasObj) {
          console.log('🔄 Aplicando señales físicas detalladas:', senalesFisicasDetalladasObj);
          // Merge con valores existentes
          indiciado.senalesFisicasDetalladas = {
            ...indiciado.senalesFisicasDetalladas,
            ...senalesFisicasDetalladasObj
          };
          console.log('✅ Señales físicas detalladas actualizadas:', indiciado.senalesFisicasDetalladas);
        }
      }
      
      // Actualizar señales físicas detalladas (con ñ) - NOTA: Este campo parece duplicado, mantener por compatibilidad
      console.log('👁️ Actualizando señales físicas detalladas:', señalesFisicas, typeof señalesFisicas);
      if (señalesFisicas) {
        let señalesFisicasObj;
        if (typeof señalesFisicas === 'string' && señalesFisicas.trim() !== '') {
          try {
            const parsedSenales = JSON.parse(señalesFisicas);
            señalesFisicasObj = {
              estatura: parsedSenales.estatura || '',
              peso: parsedSenales.peso || '',
              contexturaFisica: parsedSenales.contexturaFisica || '',
              colorPiel: parsedSenales.colorPiel || '',
              colorOjos: parsedSenales.colorOjos || '',
              colorCabello: parsedSenales.colorCabello || '',
              marcasEspeciales: parsedSenales.marcasEspeciales || ''
            };
            console.log('✅ SeñalesFisicas detalladas parseadas desde JSON (actualizar):', señalesFisicasObj);
          } catch (e) {
            console.warn('Error parsing señalesFisicas JSON:', e);
            señalesFisicasObj = { marcasEspeciales: señalesFisicas.trim() };
            console.log('✅ SeñalesFisicas detalladas usado como string (actualizar):', señalesFisicasObj);
          }
        } else if (typeof señalesFisicas === 'object') {
          señalesFisicasObj = señalesFisicas;
        }
        
        if (señalesFisicasObj) {
          console.log('🔄 Aplicando señales físicas detalladas:', señalesFisicasObj);
          // Merge con valores existentes - usar el mismo campo senalesFisicas
          indiciado.senalesFisicas = {
            ...indiciado.senalesFisicas,
            ...señalesFisicasObj
          };
          console.log('✅ Señales físicas detalladas actualizadas:', indiciado.senalesFisicas);
        }
      }

      // Actualizar foto si se proporciona una nueva
      if (req.file) {
        // Eliminar foto anterior si existe
        if (indiciado.foto && indiciado.foto.filename) {
          const oldPhotoPath = path.join(__dirname, '../uploads', indiciado.foto.filename);
          fs.unlink(oldPhotoPath).catch(console.error);
        }

        indiciado.foto = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        };
      }

      console.log('💾 Intentando guardar cambios en la base de datos...');
      const savedIndiciado = await indiciado.save();
      console.log('✅ Indiciado guardado exitosamente en la base de datos');
      
      console.log('📋 Generando diccionario del indiciado actualizado...');
      const indiciadoDict = await savedIndiciado.toDict();
      console.log('✅ Diccionario generado correctamente');
      
      console.log('🔄 Resultado de la actualización:', {
        id: savedIndiciado._id,
        nombre: savedIndiciado.nombre,
        apellidos: savedIndiciado.apellidos,
        updatedAt: savedIndiciado.updatedAt
      });

      // Actualizar también la entrada en la jerarquía si cambió el nombre
      if ((nombre !== undefined || apellidos !== undefined) && indiciado.subsectorId) {
        const Sector = require('../models/Sector');
        const oldName = `${indiciado.nombre} ${indiciado.apellidos}`;
        const newName = `${nombre || indiciado.nombre} ${apellidos || indiciado.apellidos}`;
        
        if (oldName !== newName) {
          await Sector.findOneAndUpdate(
            {
              ownerId: effectiveUser._id,
              parentId: indiciado.subsectorId,
              type: 'indiciado'
            },
            { nombre: newName },
            { new: true }
          );
          console.log('✅ Updated hierarchy entry name:', newName);
        }
      }

      res.json({
        msg: 'Indiciado actualizado exitosamente',
        indiciado: indiciadoDict
      });

    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path).catch(console.error);
      }
      console.error('Error actualizando indiciado:', error);
      res.status(500).json({
        error: 'Error del servidor al actualizar indiciado',
        message: error.message
      });
    }
  }

  // Eliminar indiciado (soft delete)
  async eliminar(req, res) {
    try {
      const effectiveUser = await getEffectiveUser(req);
      
      // Buscar indiciado con acceso global
      const indiciadoQuery = buildGlobalQuery(effectiveUser.role, {
        _id: req.params.id,
        activo: true
      });
      
      const indiciado = await Indiciado.findOne(indiciadoQuery);

      if (!indiciado) {
        return res.status(404).json({
          msg: 'Indiciado no encontrado'
        });
      }
      
      // Verificar que el usuario puede modificar este registro
      if (!canModifyRecord(effectiveUser.role, indiciado.ownerId, effectiveUser._id)) {
        return res.status(403).json({
          msg: 'No tiene permisos para eliminar este indiciado'
        });
      }

      // Soft delete
      indiciado.activo = false;
      await indiciado.save();

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

  // Eliminar permanentemente (hard delete)
  async eliminarPermanente(req, res) {
    try {
      const effectiveUser = await getEffectiveUser(req);
      
      // Buscar indiciado con acceso global (incluyendo inactivos)
      const indiciadoQuery = buildGlobalQuery(effectiveUser.role, {
        _id: req.params.id
      });
      
      const indiciado = await Indiciado.findOne(indiciadoQuery);

      if (!indiciado) {
        return res.status(404).json({
          msg: 'Indiciado no encontrado'
        });
      }
      
      // Solo admin puede eliminar permanentemente
      if (effectiveUser.role !== 'admin') {
        return res.status(403).json({
          msg: 'No tiene permisos para eliminar permanentemente. Solo administradores pueden realizar esta acción.'
        });
      }

      // Eliminar foto si existe
      if (indiciado.foto && indiciado.foto.filename) {
        const photoPath = path.join(__dirname, '../uploads', indiciado.foto.filename);
        fs.unlink(photoPath).catch(console.error);
      }

      // Eliminar documentos relacionados
      if (indiciado.documentosRelacionados && indiciado.documentosRelacionados.length > 0) {
        for (const doc of indiciado.documentosRelacionados) {
          if (doc.filename) {
            const docPath = path.join(__dirname, '../uploads/documentos', doc.filename);
            fs.unlink(docPath).catch(console.error);
          }
        }
      }

      // Eliminar documentos asociados en la colección Documento
      const documentos = await Documento.find({ indiciadoId: indiciado._id });
      for (const doc of documentos) {
        if (doc.filename) {
          const docPath = path.join(__dirname, '../uploads/documentos', doc.filename);
          fs.unlink(docPath).catch(console.error);
        }
      }
      await Documento.deleteMany({ indiciadoId: indiciado._id });

      // Eliminar indiciado permanentemente
      await Indiciado.findByIdAndDelete(req.params.id);

      res.json({
        msg: 'Indiciado eliminado permanentemente'
      });

    } catch (error) {
      console.error('Error eliminando indiciado permanentemente:', error);
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

      const indiciados = await Indiciado.buscar(effectiveUser._id, query.trim())
        .populate('subsectorId', 'nombre descripcion')
        .limit(20);

      const results = [];
      for (const indiciado of indiciados) {
        const dict = await indiciado.toDict();
        results.push(dict);
      }

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
      
      // Construir filtro con acceso global según el rol
      let queryFilter = buildGlobalQuery(effectiveUser.role, { activo: true });

      const totalIndiciados = await Indiciado.countDocuments(queryFilter);

      const totalEliminados = await Indiciado.countDocuments({
        ...queryFilter,
        activo: false
      });

      // Estadísticas por estado civil
      const estadoCivilStats = await Indiciado.aggregate([
        { $match: { ...queryFilter, activo: true } },
        { $group: { _id: '$estadoCivil', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Estadísticas por sector
      const sectorStats = await Indiciado.aggregate([
        { $match: { ...queryFilter, activo: true } },
        { $group: { _id: '$sectorQueOpera', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Indiciados recientes (últimos 30 días)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);
      
      const recentesCount = await Indiciado.countDocuments({
        ...queryFilter,
        activo: true,
        createdAt: { $gte: fechaLimite }
      });

      // Estadísticas de jerarquía (sectores/subsectores) con acceso global
      const sectorQuery = buildGlobalQuery(effectiveUser.role, { type: 'sector' });
      const subsectorQuery = buildGlobalQuery(effectiveUser.role, { type: 'subsector' });
      
      const sectoresCount = await Sector.countDocuments(sectorQuery);
      const subsectoresCount = await Sector.countDocuments(subsectorQuery);
      const hierarchyStats = {
        sectores: sectoresCount,
        subsectores: subsectoresCount
      };

      res.json({
        total: totalIndiciados,
        eliminados: totalEliminados,
        recientes: recentesCount,
        estadoCivil: estadoCivilStats,
        sectores: sectorStats,
        jerarquia: hierarchyStats
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

module.exports = new IndiciadosController();
