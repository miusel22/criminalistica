const express = require('express');
const IndiciadoSimple = require('../models/sequelize/IndiciadoSimple');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/indiciados - Obtener todos los indiciados
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching indiciados for user:', req.user.id);
    
    const indiciados = await IndiciadoSimple.findAll({
      order: [['nombre', 'ASC'], ['apellidos', 'ASC']]
    });

    console.log(`Found ${indiciados.length} indiciados`);
    
    const indiciadosData = indiciados.map(indiciado => ({
      id: indiciado.id,
      nombre: indiciado.nombre,
      apellidos: indiciado.apellidos,
      cedula: indiciado.cedula,
      genero: indiciado.genero,
      fechaNacimiento: indiciado.fechaNacimiento,
      estadoCivil: indiciado.estadoCivil,
      telefono: indiciado.telefono,
      email: indiciado.email,
      direccion: indiciado.direccion,
      ocupacion: indiciado.ocupacion,
      estado: indiciado.estado,
      fechaIngreso: indiciado.fechaIngreso,
      observaciones: indiciado.observaciones,
      sectorQueOpera: indiciado.sectorQueOpera,
      subsectorId: indiciado.subsectorId,
      ownerId: indiciado.ownerId,
      createdAt: indiciado.createdAt,
      updatedAt: indiciado.updatedAt
    }));

    res.json(indiciadosData);
  } catch (error) {
    console.error('Error fetching indiciados:', error);
    res.status(500).json({
      error: 'Server error fetching indiciados',
      message: error.message
    });
  }
});

// GET /api/indiciados/:id - Obtener indiciado específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const indiciado = await IndiciadoSimple.findByPk(req.params.id);

    if (!indiciado) {
      return res.status(404).json({
        error: 'Indiciado no encontrado'
      });
    }

    const indiciadoData = {
      id: indiciado.id,
      nombre: indiciado.nombre,
      apellidos: indiciado.apellidos,
      cedula: indiciado.cedula,
      genero: indiciado.genero,
      fechaNacimiento: indiciado.fechaNacimiento,
      estadoCivil: indiciado.estadoCivil,
      telefono: indiciado.telefono,
      email: indiciado.email,
      direccion: indiciado.direccion,
      ocupacion: indiciado.ocupacion,
      estado: indiciado.estado,
      fechaIngreso: indiciado.fechaIngreso,
      observaciones: indiciado.observaciones,
      sectorQueOpera: indiciado.sectorQueOpera,
      subsectorId: indiciado.subsectorId,
      ownerId: indiciado.ownerId,
      createdAt: indiciado.createdAt,
      updatedAt: indiciado.updatedAt
    };

    res.json(indiciadoData);
  } catch (error) {
    console.error('Error fetching indiciado:', error);
    res.status(500).json({
      error: 'Server error fetching indiciado',
      message: error.message
    });
  }
});

// GET /api/indiciados/sector/:sector - Obtener indiciados por sector
router.get('/sector/:sector', authMiddleware, async (req, res) => {
  try {
    const { sector } = req.params;
    
    const indiciados = await IndiciadoSimple.findAll({
      where: {
        sectorQueOpera: sector
      },
      order: [['nombre', 'ASC'], ['apellidos', 'ASC']]
    });
    
    const indiciadosData = indiciados.map(indiciado => ({
      id: indiciado.id,
      nombre: indiciado.nombre,
      apellidos: indiciado.apellidos,
      cedula: indiciado.cedula,
      genero: indiciado.genero,
      fechaNacimiento: indiciado.fechaNacimiento,
      estadoCivil: indiciado.estadoCivil,
      telefono: indiciado.telefono,
      email: indiciado.email,
      direccion: indiciado.direccion,
      ocupacion: indiciado.ocupacion,
      estado: indiciado.estado,
      fechaIngreso: indiciado.fechaIngreso,
      observaciones: indiciado.observaciones,
      sectorQueOpera: indiciado.sectorQueOpera,
      subsectorId: indiciado.subsectorId,
      ownerId: indiciado.ownerId,
      createdAt: indiciado.createdAt,
      updatedAt: indiciado.updatedAt
    }));

    res.json(indiciadosData);
  } catch (error) {
    console.error('Error fetching indiciados by sector:', error);
    res.status(500).json({
      error: 'Server error fetching indiciados',
      message: error.message
    });
  }
});

// POST /api/indiciados - Crear nuevo indiciado
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('📥 Received body:', JSON.stringify(req.body, null, 2));
    
    const data = req.body;
    
    // Extraer nombre y apellidos (requeridos)
    const nombre = data.nombre;
    const apellidos = data.apellidos;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        error: 'El nombre del indiciado es requerido'
      });
    }

    if (!apellidos || apellidos.trim() === '') {
      return res.status(400).json({
        error: 'Los apellidos del indiciado son requeridos'
      });
    }

    // Extraer cédula del documento de identidad
    let cedula = null;
    if (data.documentoIdentidad && data.documentoIdentidad.numero) {
      cedula = data.documentoIdentidad.numero;
    } else if (data.cedula) {
      cedula = data.cedula;
    }
    
    // Verificar si ya existe un indiciado con esa cédula
    if (cedula && cedula.trim() !== '') {
      const existingIndiciadoSimple = await IndiciadoSimple.findOne({
        where: {
          cedula: cedula.trim()
        }
      });

      if (existingIndiciadoSimple) {
        return res.status(409).json({
          error: `Ya existe un indiciado con la cédula '${cedula}'`
        });
      }
    }
    
    // Extraer fecha de nacimiento
    let fechaNacimientoDate = null;
    if (data.fechaNacimiento) {
      if (typeof data.fechaNacimiento === 'object' && data.fechaNacimiento.fecha) {
        fechaNacimientoDate = new Date(data.fechaNacimiento.fecha);
      } else if (typeof data.fechaNacimiento === 'string') {
        fechaNacimientoDate = new Date(data.fechaNacimiento);
      }
    }
    
    // Extraer otros campos del formulario
    const genero = data.genero || null;
    const estadoCivil = data.estadoCivil || null;
    const telefono = data.telefono || null;
    const email = data.email || null;
    const direccion = data.direccion || null;
    const ocupacion = data.ocupacion || data.profesion || data.oficio || null;
    const estado = data.estado || 'Activo';
    const observaciones = data.observaciones || null;
    const sectorQueOpera = data.sectorQueOpera || null;
    const subsectorId = data.subsectorId || null;
    
    // Extraer campos del documento de identidad
    let tipoDocumento = null;
    let expedidoEn = null;
    if (data.documentoIdentidad) {
      tipoDocumento = data.documentoIdentidad.tipo || null;
      expedidoEn = data.documentoIdentidad.expedidoEn || null;
    }
    
    // Extraer campos de fecha de nacimiento extendidos
    let lugarNacimiento = null;
    let edad = null;
    if (data.fechaNacimiento && typeof data.fechaNacimiento === 'object') {
      lugarNacimiento = data.fechaNacimiento.lugar || null;
    }
    if (data.edad) {
      edad = parseInt(data.edad) || null;
    }
    
    // Extraer campos de información personal adicional
    const hijoDe = data.hijoDe || null;
    const nacionalidad = data.nacionalidad || null;
    const alias = data.alias || null;
    
    // Extraer campos académicos y laborales
    const estudiosRealizados = data.estudiosRealizados || null;
    const profesion = data.profesion || null;
    const oficio = data.oficio || null;
    
    // Extraer campos de señales físicas
    const estatura = data.estatura || null;
    const peso = data.peso || null;
    const contexturaFisica = data.contexturaFisica || null;
    const colorPiel = data.colorPiel || null;
    const colorOjos = data.colorOjos || null;
    const colorCabello = data.colorCabello || null;
    const marcasEspeciales = data.marcasEspeciales || null;
    
    // Extraer campos de información delictiva
    const bandaDelincuencial = data.bandaDelincuencial || null;
    const delitosAtribuidos = data.delitosAtribuidos || null;
    
    // Extraer campos de señales físicas detalladas
    const complexion = data.complexion || null;
    const formaCara = data.formaCara || null;
    const tipoCabello = data.tipoCabello || null;
    const largoCabello = data.largoCabello || null;
    const formaOjos = data.formaOjos || null;
    const formaNariz = data.formaNariz || null;
    const formaBoca = data.formaBoca || null;
    const formaLabios = data.formaLabios || null;
    
    // Extraer URL de Google Earth
    const urlGoogleEarth = data.urlGoogleEarth || null;
    
    console.log('📝 Processed data:', {
      nombre,
      apellidos,
      cedula,
      genero,
      fechaNacimiento: fechaNacimientoDate,
      estadoCivil,
      telefono,
      email,
      direccion,
      ocupacion,
      estado,
      observaciones,
      sectorQueOpera,
      subsectorId
    });

    // Crear nuevo indiciado
    const nuevoIndiciado = await IndiciadoSimple.create({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      cedula: cedula ? cedula.trim() : null,
      genero: genero,
      fechaNacimiento: fechaNacimientoDate,
      estadoCivil: estadoCivil,
      telefono: telefono ? telefono.trim() : null,
      email: email ? email.trim() : null,
      direccion: direccion ? direccion.trim() : null,
      ocupacion: ocupacion ? ocupacion.trim() : null,
      estado: estado,
      fechaIngreso: new Date(),
      observaciones: observaciones ? observaciones.trim() : null,
      sectorQueOpera: sectorQueOpera ? sectorQueOpera.trim() : null,
      subsectorId: subsectorId || null,
      // Campos adicionales del documento de identidad
      tipoDocumento: tipoDocumento ? tipoDocumento.trim() : null,
      expedidoEn: expedidoEn ? expedidoEn.trim() : null,
      // Campos de fecha de nacimiento extendidos
      lugarNacimiento: lugarNacimiento ? lugarNacimiento.trim() : null,
      edad: edad,
      // Campos de información personal adicional
      hijoDe: hijoDe ? hijoDe.trim() : null,
      nacionalidad: nacionalidad ? nacionalidad.trim() : null,
      alias: alias ? alias.trim() : null,
      // Campos académicos y laborales
      estudiosRealizados: estudiosRealizados ? estudiosRealizados.trim() : null,
      profesion: profesion ? profesion.trim() : null,
      oficio: oficio ? oficio.trim() : null,
      // Campos de señales físicas
      estatura: estatura ? estatura.trim() : null,
      peso: peso ? peso.trim() : null,
      contexturaFisica: contexturaFisica ? contexturaFisica.trim() : null,
      colorPiel: colorPiel ? colorPiel.trim() : null,
      colorOjos: colorOjos ? colorOjos.trim() : null,
      colorCabello: colorCabello ? colorCabello.trim() : null,
      marcasEspeciales: marcasEspeciales ? marcasEspeciales.trim() : null,
      // Campos de información delictiva
      bandaDelincuencial: bandaDelincuencial ? bandaDelincuencial.trim() : null,
      delitosAtribuidos: delitosAtribuidos ? delitosAtribuidos.trim() : null,
      // Campos de señales físicas detalladas
      complexion: complexion ? complexion.trim() : null,
      formaCara: formaCara ? formaCara.trim() : null,
      tipoCabello: tipoCabello ? tipoCabello.trim() : null,
      largoCabello: largoCabello ? largoCabello.trim() : null,
      formaOjos: formaOjos ? formaOjos.trim() : null,
      formaNariz: formaNariz ? formaNariz.trim() : null,
      formaBoca: formaBoca ? formaBoca.trim() : null,
      formaLabios: formaLabios ? formaLabios.trim() : null,
      // URL de Google Earth
      urlGoogleEarth: urlGoogleEarth ? urlGoogleEarth.trim() : null,
      ownerId: req.user.id
    });

    const indiciadoData = {
      id: nuevoIndiciado.id,
      nombre: nuevoIndiciado.nombre,
      apellidos: nuevoIndiciado.apellidos,
      cedula: nuevoIndiciado.cedula,
      genero: nuevoIndiciado.genero,
      fechaNacimiento: nuevoIndiciado.fechaNacimiento,
      estadoCivil: nuevoIndiciado.estadoCivil,
      telefono: nuevoIndiciado.telefono,
      email: nuevoIndiciado.email,
      direccion: nuevoIndiciado.direccion,
      ocupacion: nuevoIndiciado.ocupacion,
      estado: nuevoIndiciado.estado,
      fechaIngreso: nuevoIndiciado.fechaIngreso,
      observaciones: nuevoIndiciado.observaciones,
      sectorQueOpera: nuevoIndiciado.sectorQueOpera,
      subsectorId: nuevoIndiciado.subsectorId,
      ownerId: nuevoIndiciado.ownerId,
      createdAt: nuevoIndiciado.createdAt,
      updatedAt: nuevoIndiciado.updatedAt
    };

    res.status(201).json({
      message: 'Indiciado creado exitosamente',
      indiciado: indiciadoData
    });
  } catch (error) {
    console.error('Error creating indiciado:', error);
    res.status(500).json({
      error: 'Server error creating indiciado',
      message: error.message
    });
  }
});

// PUT /api/indiciados/:id - Actualizar indiciado
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      cedula,
      genero,
      fechaNacimiento,
      estadoCivil,
      telefono,
      email,
      direccion,
      ocupacion,
      estado,
      fechaIngreso,
      observaciones,
      sectorQueOpera
    } = req.body;

    const indiciado = await IndiciadoSimple.findByPk(req.params.id);

    if (!indiciado) {
      return res.status(404).json({
        error: 'Indiciado no encontrado'
      });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && indiciado.ownerId !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permisos para editar este indiciado'
      });
    }

    // Verificar cédula única si se está actualizando
    if (cedula && cedula.trim() !== indiciado.cedula) {
      const existingIndiciado = await IndiciadoSimple.findOne({
        where: {
          cedula: cedula.trim(),
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingIndiciado) {
        return res.status(409).json({
          error: `Ya existe otro indiciado con la cédula '${cedula}'`
        });
      }
    }

    // Actualizar campos
    if (nombre !== undefined) indiciado.nombre = nombre ? nombre.trim() : null;
    if (apellidos !== undefined) indiciado.apellidos = apellidos ? apellidos.trim() : null;
    if (cedula !== undefined) indiciado.cedula = cedula ? cedula.trim() : null;
    if (genero !== undefined) indiciado.genero = genero;
    if (fechaNacimiento !== undefined) indiciado.fechaNacimiento = fechaNacimiento;
    if (estadoCivil !== undefined) indiciado.estadoCivil = estadoCivil;
    if (telefono !== undefined) indiciado.telefono = telefono ? telefono.trim() : null;
    if (email !== undefined) indiciado.email = email ? email.trim() : null;
    if (direccion !== undefined) indiciado.direccion = direccion ? direccion.trim() : null;
    if (ocupacion !== undefined) indiciado.ocupacion = ocupacion ? ocupacion.trim() : null;
    if (estado !== undefined) indiciado.estado = estado;
    if (fechaIngreso !== undefined) indiciado.fechaIngreso = fechaIngreso;
    if (observaciones !== undefined) indiciado.observaciones = observaciones ? observaciones.trim() : null;
    if (sectorQueOpera !== undefined) indiciado.sectorQueOpera = sectorQueOpera ? sectorQueOpera.trim() : null;

    await indiciado.save();

    const indiciadoData = {
      id: indiciado.id,
      nombre: indiciado.nombre,
      apellidos: indiciado.apellidos,
      cedula: indiciado.cedula,
      genero: indiciado.genero,
      fechaNacimiento: indiciado.fechaNacimiento,
      estadoCivil: indiciado.estadoCivil,
      telefono: indiciado.telefono,
      email: indiciado.email,
      direccion: indiciado.direccion,
      ocupacion: indiciado.ocupacion,
      estado: indiciado.estado,
      fechaIngreso: indiciado.fechaIngreso,
      observaciones: indiciado.observaciones,
      sectorQueOpera: indiciado.sectorQueOpera,
      ownerId: indiciado.ownerId,
      createdAt: indiciado.createdAt,
      updatedAt: indiciado.updatedAt
    };

    res.json({
      message: 'Indiciado actualizado exitosamente',
      indiciado: indiciadoData
    });
  } catch (error) {
    console.error('Error updating indiciado:', error);
    res.status(500).json({
      error: 'Server error updating indiciado',
      message: error.message
    });
  }
});

// DELETE /api/indiciados/:id - Eliminar indiciado
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const indiciado = await IndiciadoSimple.findByPk(req.params.id);

    if (!indiciado) {
      return res.status(404).json({
        error: 'Indiciado no encontrado'
      });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && indiciado.ownerId !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar este indiciado'
      });
    }

    await indiciado.destroy();

    res.json({
      message: 'Indiciado eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting indiciado:', error);
    res.status(500).json({
      error: 'Server error deleting indiciado',
      message: error.message
    });
  }
});

module.exports = router;
