const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Vehiculo = require('../models/Vehiculo');
const Sector = require('../models/Sector');
const authMiddleware = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');
const { canRead, canWrite, canAdmin, buildGlobalQuery, canModifyRecord } = require('../middleware/permissions');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Configuración de multer para subir fotos de vehículos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/vehiculos');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vehiculo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// ============================================================================
// VEHÍCULOS
// ============================================================================

// Crear vehículo - Solo editor y admin (acceso global)
router.post('/', authMiddleware, canWrite, upload.array('fotos', 10), [
  body('subsectorId')
    .isMongoId()
    .withMessage('subsectorId debe ser un ObjectId válido'),
  body('tipoVehiculo')
    .notEmpty()
    .withMessage('El tipo de vehículo es requerido')
    .isIn(['Taxi', 'Automóvil', 'Motocicleta', 'Camioneta', 'Camión', 'Bus', 'Microbus', 'Furgón', 'Tractocamión', 'Otro'])
    .withMessage('Tipo de vehículo no válido'),
  body('marca')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La marca no puede exceder 100 caracteres'),
  body('linea')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La línea no puede exceder 100 caracteres'),
  body('placa')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('La placa no puede exceder 20 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { subsectorId, ...vehiculoData } = req.body;

    // Verificar que el subsector existe (acceso global)
    const subsectorQuery = buildGlobalQuery(req.user.role, {
      _id: subsectorId, 
      type: 'subsector'
    });
    
    const subsector = await Sector.findOne(subsectorQuery);
    if (!subsector) {
      return res.status(404).json({ 
        msg: 'El subsector no existe'
      });
    }

    // Procesar fotos subidas
    const fotos = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        fotos.push({
          filename: file.filename,
          originalName: file.originalname,
          descripcion: req.body[`descripcionFoto_${i}`] || '',
          mimeType: file.mimetype,
          size: file.size,
          path: file.path
        });
      }
    }

    // Crear nuevo vehículo
    const nuevoVehiculo = new Vehiculo({
      ...vehiculoData,
      ownerId: req.user._id,
      subsectorId: subsectorId,
      fotos: fotos
    });

    await nuevoVehiculo.save();
    const vehiculoDict = await nuevoVehiculo.toDict();

    res.status(201).json({
      msg: 'Vehículo creado exitosamente',
      vehiculo: vehiculoDict
    });
  } catch (error) {
    console.error('Error creating vehiculo:', error);
    res.status(500).json({
      error: 'Server error creating vehiculo',
      message: error.message
    });
  }
});

// Obtener todos los vehículos con paginación (acceso global)
router.get('/', authMiddleware, canRead, [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un número mayor a 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100'),
  query('subsectorId').optional().isMongoId().withMessage('subsectorId debe ser un ObjectId válido'),
  query('tipoVehiculo').optional().trim(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros de consulta incorrectos',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { subsectorId, tipoVehiculo, search } = req.query;

    // Construir query con acceso global
    let query = buildGlobalQuery(req.user.role, { activo: true });
    
    if (subsectorId) {
      query.subsectorId = subsectorId;
    }
    
    if (tipoVehiculo) {
      query.tipoVehiculo = tipoVehiculo;
    }
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { placa: searchRegex },
        { marca: searchRegex },
        { linea: searchRegex },
        { 'propietario.nombre': searchRegex },
        { sectorQueOpera: searchRegex }
      ];
    }

    // Obtener vehículos con paginación
    const [vehiculos, total] = await Promise.all([
      Vehiculo.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vehiculo.countDocuments(query)
    ]);

    const vehiculosDict = [];
    for (const vehiculo of vehiculos) {
      const vehiculoInstance = new Vehiculo(vehiculo);
      const vehiculoDict = await vehiculoInstance.toDict();
      vehiculosDict.push(vehiculoDict);
    }

    res.json({
      vehiculos: vehiculosDict,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching vehiculos:', error);
    res.status(500).json({
      error: 'Server error fetching vehiculos',
      message: error.message
    });
  }
});

// Obtener vehículo específico (acceso global)
router.get('/:id', authMiddleware, canRead, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros incorrectos',
        details: errors.array()
      });
    }

    // Buscar vehículo con acceso global
    const vehiculoQuery = buildGlobalQuery(req.user.role, {
      _id: req.params.id,
      activo: true
    });
    
    const vehiculo = await Vehiculo.findOne(vehiculoQuery);

    if (!vehiculo) {
      return res.status(404).json({
        msg: 'Vehículo no encontrado'
      });
    }

    const vehiculoDict = await vehiculo.toDict();
    res.json(vehiculoDict);
  } catch (error) {
    console.error('Error fetching vehiculo:', error);
    res.status(500).json({
      error: 'Server error fetching vehiculo',
      message: error.message
    });
  }
});

// Actualizar vehículo - Solo editor y admin (acceso global)
router.put('/:id', authMiddleware, canWrite, upload.array('nuevasFotos', 10), [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido'),
  body('tipoVehiculo')
    .optional()
    .isIn(['Taxi', 'Automóvil', 'Motocicleta', 'Camioneta', 'Camión', 'Bus', 'Microbus', 'Furgón', 'Tractocamión', 'Otro'])
    .withMessage('Tipo de vehículo no válido'),
  body('marca')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La marca no puede exceder 100 caracteres'),
  body('linea')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La línea no puede exceder 100 caracteres'),
  body('placa')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('La placa no puede exceder 20 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const vehiculoId = req.params.id;
    const updateData = req.body;

    // Buscar vehículo con acceso global
    const vehiculoQuery = buildGlobalQuery(req.user.role, {
      _id: vehiculoId,
      activo: true
    });
    
    const vehiculo = await Vehiculo.findOne(vehiculoQuery);

    if (!vehiculo) {
      return res.status(404).json({
        msg: 'Vehículo no encontrado'
      });
    }

    // Verificar que el usuario puede modificar este registro
    if (!canModifyRecord(req.user.role, vehiculo.ownerId, req.user._id)) {
      return res.status(403).json({
        msg: 'No tiene permisos para modificar este vehículo'
      });
    }

    // Procesar nuevas fotos si se subieron
    if (req.files && req.files.length > 0) {
      const nuevasFotos = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        nuevasFotos.push({
          filename: file.filename,
          originalName: file.originalname,
          descripcion: req.body[`descripcionNuevaFoto_${i}`] || '',
          mimeType: file.mimetype,
          size: file.size,
          path: file.path
        });
      }
      // Agregar nuevas fotos a las existentes
      vehiculo.fotos = [...vehiculo.fotos, ...nuevasFotos];
    }

    // Actualizar otros campos
    Object.keys(updateData).forEach(key => {
      if (key !== 'nuevasFotos' && !key.startsWith('descripcionNuevaFoto_')) {
        vehiculo[key] = updateData[key];
      }
    });

    await vehiculo.save();
    const vehiculoDict = await vehiculo.toDict();

    res.json({
      msg: 'Vehículo actualizado exitosamente',
      vehiculo: vehiculoDict
    });
  } catch (error) {
    console.error('Error updating vehiculo:', error);
    res.status(500).json({
      error: 'Server error updating vehiculo',
      message: error.message
    });
  }
});

// Eliminar vehículo (soft delete) - Solo editor y admin (acceso global)
router.delete('/:id', authMiddleware, canWrite, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'ID inválido',
        details: errors.array()
      });
    }

    // Buscar vehículo con acceso global
    const vehiculoQuery = buildGlobalQuery(req.user.role, {
      _id: req.params.id,
      activo: true
    });
    
    const vehiculo = await Vehiculo.findOne(vehiculoQuery);

    if (!vehiculo) {
      return res.status(404).json({
        msg: 'Vehículo no encontrado'
      });
    }

    // Verificar que el usuario puede modificar este registro
    if (!canModifyRecord(req.user.role, vehiculo.ownerId, req.user._id)) {
      return res.status(403).json({
        msg: 'No tiene permisos para eliminar este vehículo'
      });
    }

    // Soft delete - marcar como inactivo
    vehiculo.activo = false;
    await vehiculo.save();

    res.json({
      msg: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting vehiculo:', error);
    res.status(500).json({
      error: 'Server error deleting vehiculo',
      message: error.message
    });
  }
});

// Buscar vehículos (acceso global)
router.get('/buscar/:query', authMiddleware, canRead, [
  param('query')
    .trim()
    .notEmpty()
    .withMessage('El término de búsqueda es requerido')
    .isLength({ min: 2 })
    .withMessage('La búsqueda debe tener al menos 2 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros de búsqueda incorrectos',
        details: errors.array()
      });
    }

    const searchTerm = req.params.query;
    
    // Construir query de búsqueda con acceso global
    const baseQuery = buildGlobalQuery(req.user.role, { activo: true });
    const searchRegex = new RegExp(searchTerm, 'i');
    
    const searchQuery = {
      ...baseQuery,
      $or: [
        { placa: searchRegex },
        { marca: searchRegex },
        { linea: searchRegex },
        { 'propietario.nombre': searchRegex },
        { sectorQueOpera: searchRegex }
      ]
    };
    
    const vehiculos = await Vehiculo.find(searchQuery).limit(50).lean();

    const vehiculosDict = [];
    for (const vehiculo of vehiculos) {
      const vehiculoInstance = new Vehiculo(vehiculo);
      const vehiculoDict = await vehiculoInstance.toDict();
      vehiculosDict.push(vehiculoDict);
    }

    res.json({
      msg: `Encontrados ${vehiculos.length} vehículos`,
      vehiculos: vehiculosDict
    });
  } catch (error) {
    console.error('Error searching vehiculos:', error);
    res.status(500).json({
      error: 'Server error searching vehiculos',
      message: error.message
    });
  }
});

// Eliminar foto específica de un vehículo
router.delete('/:id/fotos/:fotoId', authMiddleware, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido'),
  param('fotoId').isMongoId().withMessage('fotoId debe ser un ObjectId válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros incorrectos',
        details: errors.array()
      });
    }

    const vehiculo = await Vehiculo.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      activo: true
    });

    if (!vehiculo) {
      return res.status(404).json({
        msg: 'Vehículo no encontrado o no pertenece al usuario'
      });
    }

    const fotoIndex = vehiculo.fotos.findIndex(foto => foto._id.toString() === req.params.fotoId);
    if (fotoIndex === -1) {
      return res.status(404).json({
        msg: 'Foto no encontrada'
      });
    }

    // Intentar eliminar el archivo físico
    const foto = vehiculo.fotos[fotoIndex];
    if (foto.path) {
      try {
        await fs.unlink(foto.path);
      } catch (fileError) {
        console.warn('Warning: Could not delete physical file:', fileError.message);
      }
    }

    // Eliminar foto del array
    vehiculo.fotos.splice(fotoIndex, 1);
    await vehiculo.save();

    res.json({
      msg: 'Foto eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      error: 'Server error deleting photo',
      message: error.message
    });
  }
});

// Obtener estadísticas de vehículos
router.get('/stats/general', authMiddleware, async (req, res) => {
  try {
    const [
      total,
      eliminados,
      porTipo,
      porEstado,
      recientes
    ] = await Promise.all([
      Vehiculo.countDocuments({ ownerId: req.user._id, activo: true }),
      Vehiculo.countDocuments({ ownerId: req.user._id, activo: false }),
      Vehiculo.aggregate([
        { $match: { ownerId: req.user._id, activo: true } },
        { $group: { _id: '$tipoVehiculo', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Vehiculo.aggregate([
        { $match: { ownerId: req.user._id, activo: true } },
        { $group: { _id: '$estado', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Vehiculo.countDocuments({
        ownerId: req.user._id,
        activo: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // últimos 30 días
      })
    ]);

    res.json({
      total,
      eliminados,
      recientes,
      porTipo,
      porEstado
    });
  } catch (error) {
    console.error('Error getting vehiculos stats:', error);
    res.status(500).json({
      error: 'Server error getting stats',
      message: error.message
    });
  }
});

module.exports = router;
