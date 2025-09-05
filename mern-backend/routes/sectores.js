const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { Sector, User } = require('../models/sequelize');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');
const { canRead, canWrite, canAdmin, buildGlobalQuery, canModifyRecord } = require('../middleware/permissions');
const { generarNombreSector } = require('../controllers/colombiaController');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Helper function to load Colombia data
const loadColombiaData = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/colombia.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading Colombia data:', error);
    return null;
  }
};

// ============================================================================
// SECTORES (Root level items)
// ============================================================================

// Crear sector - Solo editor y admin (acceso global)
router.post('/', authMiddleware, canWrite, [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El campo "nombre" es requerido y debe ser un texto no vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('departamentoId')
    .notEmpty()
    .trim()
    .withMessage('El departamento es requerido para crear un sector'),
  body('ciudadId')
    .if((value, { req }) => !req.body.ciudadPersonalizada)
    .notEmpty()
    .trim()
    .withMessage('La ciudad es requerida cuando no se especifica una ciudad personalizada'),
  body('ciudadPersonalizada')
    .if((value, { req }) => !req.body.ciudadId)
    .notEmpty()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ciudad personalizada es requerida cuando no se selecciona una ciudad de la lista')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { 
      nombre, 
      departamentoId, 
      ciudadId, 
      ciudadPersonalizada 
    } = req.body;

    // Procesar información de ubicación
    let ubicacion = {};
    
    if (departamentoId || ciudadId || ciudadPersonalizada) {
      const colombiaData = await loadColombiaData();
      
      if (colombiaData && departamentoId) {
        const departamento = colombiaData.departamentos.find(dept => dept.id === departamentoId);
        
        if (departamento) {
          ubicacion.departamento = {
            id: departamento.id,
            nombre: departamento.nombre
          };
          
          if (ciudadId && !ciudadPersonalizada) {
            const ciudad = departamento.ciudades.find(city => city.id === ciudadId);
            if (ciudad) {
              ubicacion.ciudad = {
                id: ciudad.id,
                nombre: ciudad.nombre
              };
            }
          }
          
          if (ciudadPersonalizada) {
            ubicacion.ciudadPersonalizada = ciudadPersonalizada;
          }
        }
      }
    }

    // Verificar que no existe un sector con el mismo nombre
    const exists = await Sector.findOne({
      ownerId: req.user._id,
      parentId: null,
      nombre,
      type: 'sector'
    });

    if (exists) {
      return res.status(409).json({
        msg: `El sector '${nombre}' ya existe`
      });
    }

    // Crear nuevo sector
    const sectorData = {
      nombre,
      ownerId: req.user._id,
      type: 'sector'
    };
    
    // Solo agregar ubicación si tiene datos
    if (Object.keys(ubicacion).length > 0) {
      sectorData.ubicacion = ubicacion;
    }
    
    const nuevoSector = new Sector(sectorData);

    await nuevoSector.save();
    const sectorDict = await nuevoSector.toDict();

    res.status(201).json({
      msg: 'Sector creado exitosamente',
      sector: sectorDict
    });
  } catch (error) {
    console.error('Error creating sector:', error);
    res.status(500).json({
      error: 'Server error creating sector',
      message: error.message
    });
  }
});

// Obtener todos los sectores (con jerarquía completa) - Acceso global para todos los roles
router.get('/', authMiddleware, canRead, [
  query('include_children').optional().isBoolean().withMessage('include_children debe ser un booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros de consulta incorrectos',
        details: errors.array()
      });
    }

    const includeChildren = req.query.include_children === 'true';

    if (includeChildren) {
      // Obtener jerarquía completa - acceso global
      if (['admin', 'editor', 'viewer'].includes(req.user.role)) {
        // Para roles con acceso global, obtener toda la jerarquía
        const sectores = await Sector.getSectorHierarchy();
        res.json(sectores);
      } else {
        // Fallback para otros roles
        const sectores = await Sector.getSectorHierarchy(req.user._id);
        res.json(sectores);
      }
    } else {
      // Solo sectores raíz - acceso global
      const query = buildGlobalQuery(req.user.role, {
        type: 'sector',
        parentId: null
      });
      
      const sectores = await Sector.find(query).sort({ nombre: 1 });

      const sectoresDict = [];
      for (const sector of sectores) {
        const sectorDict = await sector.toDict();
        sectoresDict.push(sectorDict);
      }

      res.json(sectoresDict);
    }
  } catch (error) {
    console.error('Error fetching sectores:', error);
    res.status(500).json({
      error: 'Server error fetching sectores',
      message: error.message
    });
  }
});

// ============================================================================
// UTILIDADES (moved before parameterized routes to avoid conflicts)
// ============================================================================

// Obtener estadísticas de la jerarquía - Acceso global
router.get('/stats', authMiddleware, canRead, async (req, res) => {
  try {
    // Obtener estadísticas globales según el rol
    const sectorQuery = buildGlobalQuery(req.user.role, {
      type: 'sector',
      parentId: null
    });
    
    const subsectorQuery = buildGlobalQuery(req.user.role, {
      type: 'subsector'
    });
    
    const sectores = await Sector.find(sectorQuery);
    const subsectores = await Sector.find(subsectorQuery);

    // Para indiciados, usar el modelo Indiciado real con acceso global
    const Indiciado = require('../models/Indiciado');
    const indiciadoQuery = buildGlobalQuery(req.user.role, {
      activo: true
    });
    const indiciados = await Indiciado.countDocuments(indiciadoQuery);

    res.json({
      sectores: sectores.length,
      subsectores: subsectores.length,
      indiciados: indiciados,
      total: sectores.length + subsectores.length + indiciados
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Server error getting stats',
      message: error.message
    });
  }
});

// Buscar en toda la jerarquía por nombre - Acceso global
router.get('/buscar', authMiddleware, canRead, [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('El parámetro de búsqueda "q" es requerido')
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

    const query = req.query.q;

    // Búsqueda global según el rol
    const searchQuery = buildGlobalQuery(req.user.role, {
      nombre: { $regex: query, $options: 'i' }
    });
    
    const resultados = await Sector.find(searchQuery).sort({ type: 1, nombre: 1 });

    const resultadosDict = [];
    for (const item of resultados) {
      const itemDict = await item.toDict();
      resultadosDict.push(itemDict);
    }

    res.json({
      msg: `Encontrados ${resultados.length} resultados`,
      resultados: resultadosDict
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({
      error: 'Server error searching',
      message: error.message
    });
  }
});

// Obtener sector específico - Acceso global
router.get('/:id', authMiddleware, canRead, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido'),
  query('include_children').optional().isBoolean().withMessage('include_children debe ser un booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros incorrectos',
        details: errors.array()
      });
    }

    const includeChildren = req.query.include_children === 'true';

    // Búsqueda global del sector según el rol
    const sectorQuery = buildGlobalQuery(req.user.role, {
      _id: req.params.id,
      type: 'sector'
    });
    
    const sector = await Sector.findOne(sectorQuery);

    if (!sector) {
      return res.status(404).json({
        msg: 'Sector no encontrado'
      });
    }

    const sectorDict = await sector.toDict(includeChildren);
    res.json(sectorDict);
  } catch (error) {
    console.error('Error fetching sector:', error);
    res.status(500).json({
      error: 'Server error fetching sector',
      message: error.message
    });
  }
});

// Actualizar sector - Solo editor y admin con acceso global
router.put('/:id', authMiddleware, canWrite, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El campo "nombre" es requerido y debe ser un texto no vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;
    const sectorId = req.params.id;

    // Buscar sector con acceso global
    const sectorQuery = buildGlobalQuery(req.user.role, {
      _id: sectorId,
      type: 'sector'
    });
    
    const sector = await Sector.findOne(sectorQuery);

    if (!sector) {
      return res.status(404).json({
        msg: 'Sector no encontrado'
      });
    }

    // Verificar que el usuario puede modificar este registro
    if (!canModifyRecord(req.user.role, sector.ownerId, req.user._id)) {
      return res.status(403).json({
        msg: 'No tiene permisos para modificar este sector'
      });
    }

    // Verificar que no existe otro sector con el mismo nombre
    const conflictoQuery = buildGlobalQuery(req.user.role, {
      type: 'sector',
      parentId: null,
      nombre,
      _id: { $ne: sectorId }
    });
    
    const conflicto = await Sector.findOne(conflictoQuery);

    if (conflicto) {
      return res.status(409).json({
        msg: `Ya existe un sector con el nombre '${nombre}'.`
      });
    }

    // Actualizar sector
    sector.nombre = nombre;
    if (descripcion !== undefined) {
      sector.descripcion = descripcion;
    }
    await sector.save();

    const sectorDict = await sector.toDict();

    res.json({
      msg: 'Sector actualizado exitosamente',
      sector: sectorDict
    });
  } catch (error) {
    console.error('Error updating sector:', error);
    res.status(500).json({
      error: 'Server error updating sector',
      message: error.message
    });
  }
});

// Eliminar sector - Solo editor y admin con acceso global
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

    // Buscar sector con acceso global
    const sectorQuery = buildGlobalQuery(req.user.role, {
      _id: req.params.id,
      type: 'sector'
    });
    
    const sector = await Sector.findOne(sectorQuery);

    if (!sector) {
      return res.status(404).json({
        msg: 'Sector no encontrado'
      });
    }

    // Verificar que el usuario puede modificar este registro
    if (!canModifyRecord(req.user.role, sector.ownerId, req.user._id)) {
      return res.status(403).json({
        msg: 'No tiene permisos para eliminar este sector'
      });
    }

    // Eliminar sector y todos sus hijos (cascade delete)
    await Sector.findOneAndDelete({ _id: req.params.id });

    res.json({
      msg: 'Sector eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting sector:', error);
    res.status(500).json({
      error: 'Server error deleting sector',
      message: error.message
    });
  }
});

// ============================================================================
// SUBSECTORES
// ============================================================================

// Crear subsector - Solo admin y editor
router.post('/:sectorId/subsectores', authMiddleware, checkRole(['admin', 'editor']), [
  param('sectorId').isMongoId().withMessage('sectorId debe ser un ObjectId válido'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El campo "nombre" es requerido y debe ser un texto no vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;
    const { sectorId } = req.params;

    // Verificar que el sector padre existe
    // Admin/editor pueden crear en cualquier sector
    let query = { _id: sectorId, type: 'sector' };
    if (!['admin', 'editor'].includes(req.user.role)) {
      query.ownerId = req.user._id;
    }
    
    const sectorPadre = await Sector.findOne(query);
    
    if (!sectorPadre) {
      const errorMsg = ['admin', 'editor'].includes(req.user.role)
        ? 'El sector padre no existe'
        : 'El sector padre no existe o no pertenece al usuario';
      return res.status(404).json({ msg: errorMsg });
    }

    // Verificar que no existe un subsector con el mismo nombre en este sector
    const exists = await Sector.findOne({
      ownerId: req.user._id,
      parentId: sectorId,
      nombre,
      type: 'subsector'
    });

    if (exists) {
      return res.status(409).json({
        msg: `El subsector '${nombre}' ya existe en '${sectorPadre.nombre}'`
      });
    }

    // Crear nuevo subsector
    const nuevoSubsector = new Sector({
      nombre,
      descripcion,
      ownerId: req.user._id,
      parentId: sectorId,
      type: 'subsector'
    });

    await nuevoSubsector.save();
    const subsectorDict = await nuevoSubsector.toDict();

    res.status(201).json({
      msg: 'Subsector creado exitosamente',
      subsector: subsectorDict
    });
  } catch (error) {
    console.error('Error creating subsector:', error);
    res.status(500).json({
      error: 'Server error creating subsector',
      message: error.message
    });
  }
});

// Obtener subsectores de un sector
router.get('/:sectorId/subsectores', authMiddleware, [
  param('sectorId').isMongoId().withMessage('sectorId debe ser un ObjectId válido'),
  query('include_children').optional().isBoolean().withMessage('include_children debe ser un booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros incorrectos',
        details: errors.array()
      });
    }

    const { sectorId } = req.params;
    const includeChildren = req.query.include_children === 'true';

    // Verificar que el sector padre existe y pertenece al usuario
    const sectorPadre = await Sector.findOne({ 
      _id: sectorId, 
      ownerId: req.user._id,
      type: 'sector'
    });
    
    if (!sectorPadre) {
      return res.status(404).json({
        msg: 'El sector padre no existe o no pertenece al usuario'
      });
    }

    const subsectores = await Sector.find({
      ownerId: req.user._id,
      parentId: sectorId,
      type: 'subsector'
    }).sort({ nombre: 1 });

    const subsectoresDict = [];
    for (const subsector of subsectores) {
      const subsectorDict = await subsector.toDict(includeChildren);
      subsectoresDict.push(subsectorDict);
    }

    res.json(subsectoresDict);
  } catch (error) {
    console.error('Error fetching subsectores:', error);
    res.status(500).json({
      error: 'Server error fetching subsectores',
      message: error.message
    });
  }
});

// Obtener subsector específico
router.get('/subsectores/:id', authMiddleware, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido'),
  query('include_children').optional().isBoolean().withMessage('include_children debe ser un booleano')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros incorrectos',
        details: errors.array()
      });
    }

    const includeChildren = req.query.include_children === 'true';

    const subsector = await Sector.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      type: 'subsector'
    });

    if (!subsector) {
      return res.status(404).json({
        msg: 'Subsector no encontrado o no pertenece al usuario'
      });
    }

    const subsectorDict = await subsector.toDict(includeChildren);
    res.json(subsectorDict);
  } catch (error) {
    console.error('Error fetching subsector:', error);
    res.status(500).json({
      error: 'Server error fetching subsector',
      message: error.message
    });
  }
});

// Actualizar subsector
router.put('/subsectores/:id', authMiddleware, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El campo "nombre" es requerido y debe ser un texto no vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;
    const subsectorId = req.params.id;

    const subsector = await Sector.findOne({
      _id: subsectorId,
      ownerId: req.user._id,
      type: 'subsector'
    });

    if (!subsector) {
      return res.status(404).json({
        msg: 'Subsector no encontrado o no pertenece al usuario'
      });
    }

    // Verificar que no existe otro subsector con el mismo nombre en el mismo sector
    const conflicto = await Sector.findOne({
      ownerId: req.user._id,
      parentId: subsector.parentId,
      type: 'subsector',
      nombre,
      _id: { $ne: subsectorId }
    });

    if (conflicto) {
      return res.status(409).json({
        msg: `Ya existe un subsector con el nombre '${nombre}' en este sector.`
      });
    }

    // Actualizar subsector
    subsector.nombre = nombre;
    if (descripcion !== undefined) {
      subsector.descripcion = descripcion;
    }
    await subsector.save();

    const subsectorDict = await subsector.toDict();

    res.json({
      msg: 'Subsector actualizado exitosamente',
      subsector: subsectorDict
    });
  } catch (error) {
    console.error('Error updating subsector:', error);
    res.status(500).json({
      error: 'Server error updating subsector',
      message: error.message
    });
  }
});

// Eliminar subsector
router.delete('/subsectores/:id', authMiddleware, [
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

    const subsector = await Sector.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      type: 'subsector'
    });

    if (!subsector) {
      return res.status(404).json({
        msg: 'Subsector no encontrado o no pertenece al usuario'
      });
    }

    // Eliminar subsector y todos sus índices (cascade delete)
    await Sector.findOneAndDelete({ _id: req.params.id });

    res.json({
      msg: 'Subsector eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting subsector:', error);
    res.status(500).json({
      error: 'Server error deleting subsector',
      message: error.message
    });
  }
});

// ============================================================================
// INDICIADOS
// ============================================================================

// Crear indiciado - Solo admin y editor
router.post('/subsectores/:subsectorId/indiciados', authMiddleware, checkRole(['admin', 'editor']), [
  param('subsectorId').isMongoId().withMessage('subsectorId debe ser un ObjectId válido'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El campo "nombre" es requerido y debe ser un texto no vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;
    const { subsectorId } = req.params;

    // Verificar que el subsector padre existe
    // Admin/editor pueden crear en cualquier subsector
    let query = { _id: subsectorId, type: 'subsector' };
    if (!['admin', 'editor'].includes(req.user.role)) {
      query.ownerId = req.user._id;
    }
    
    const subsectorPadre = await Sector.findOne(query);
    
    if (!subsectorPadre) {
      const errorMsg = ['admin', 'editor'].includes(req.user.role)
        ? 'El subsector padre no existe'
        : 'El subsector padre no existe o no pertenece al usuario';
      return res.status(404).json({ msg: errorMsg });
    }

    // Verificar que no existe un indiciado con el mismo nombre en este subsector
    const exists = await Sector.findOne({
      ownerId: req.user._id,
      parentId: subsectorId,
      nombre,
      type: 'indiciado'
    });

    if (exists) {
      return res.status(409).json({
        msg: `El indiciado '${nombre}' ya existe en '${subsectorPadre.nombre}'`
      });
    }

    // Crear nuevo indiciado
    const nuevoIndiciado = new Sector({
      nombre,
      descripcion,
      ownerId: req.user._id,
      parentId: subsectorId,
      type: 'indiciado'
    });

    await nuevoIndiciado.save();
    const indiciadoDict = await nuevoIndiciado.toDict();

    res.status(201).json({
      msg: 'Indiciado creado exitosamente',
      indiciado: indiciadoDict
    });
  } catch (error) {
    console.error('Error creating indiciado:', error);
    res.status(500).json({
      error: 'Server error creating indiciado',
      message: error.message
    });
  }
});

// Obtener indiciados de un subsector
router.get('/subsectores/:subsectorId/indiciados', authMiddleware, [
  param('subsectorId').isMongoId().withMessage('subsectorId debe ser un ObjectId válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Parámetros incorrectos',
        details: errors.array()
      });
    }

    const { subsectorId } = req.params;

    // Verificar que el subsector padre existe y pertenece al usuario
    const subsectorPadre = await Sector.findOne({ 
      _id: subsectorId, 
      ownerId: req.user._id,
      type: 'subsector'
    });
    
    if (!subsectorPadre) {
      return res.status(404).json({
        msg: 'El subsector padre no existe o no pertenece al usuario'
      });
    }

    const indiciados = await Sector.find({
      ownerId: req.user._id,
      parentId: subsectorId,
      type: 'indiciado'
    }).sort({ nombre: 1 });

    const indiciadosDict = [];
    for (const indiciado of indiciados) {
      const indiciadoDict = await indiciado.toDict();
      indiciadosDict.push(indiciadoDict);
    }

    res.json(indiciadosDict);
  } catch (error) {
    console.error('Error fetching indiciados:', error);
    res.status(500).json({
      error: 'Server error fetching indiciados',
      message: error.message
    });
  }
});

// Obtener índice específico
router.get('/indices/:id', authMiddleware, [
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

    const indice = await Sector.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      type: 'index'
    });

    if (!indice) {
      return res.status(404).json({
        msg: 'Índice no encontrado o no pertenece al usuario'
      });
    }

    const indiceDict = await indice.toDict();
    res.json(indiceDict);
  } catch (error) {
    console.error('Error fetching indice:', error);
    res.status(500).json({
      error: 'Server error fetching indice',
      message: error.message
    });
  }
});

// Actualizar índice
router.put('/indices/:id', authMiddleware, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El campo "nombre" es requerido y debe ser un texto no vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;
    const indiceId = req.params.id;

    const indice = await Sector.findOne({
      _id: indiceId,
      ownerId: req.user._id,
      type: 'index'
    });

    if (!indice) {
      return res.status(404).json({
        msg: 'Índice no encontrado o no pertenece al usuario'
      });
    }

    // Verificar que no existe otro índice con el mismo nombre en el mismo subsector
    const conflicto = await Sector.findOne({
      ownerId: req.user._id,
      parentId: indice.parentId,
      type: 'index',
      nombre,
      _id: { $ne: indiceId }
    });

    if (conflicto) {
      return res.status(409).json({
        msg: `Ya existe un índice con el nombre '${nombre}' en este subsector.`
      });
    }

    // Actualizar índice
    indice.nombre = nombre;
    if (descripcion !== undefined) {
      indice.descripcion = descripcion;
    }
    await indice.save();

    const indiceDict = await indice.toDict();

    res.json({
      msg: 'Índice actualizado exitosamente',
      indice: indiceDict
    });
  } catch (error) {
    console.error('Error updating indice:', error);
    res.status(500).json({
      error: 'Server error updating indice',
      message: error.message
    });
  }
});

// Eliminar índice
router.delete('/indices/:id', authMiddleware, [
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

    const indice = await Sector.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      type: 'index'
    });

    if (!indice) {
      return res.status(404).json({
        msg: 'Índice no encontrado o no pertenece al usuario'
      });
    }

    // Eliminar índice
    await Sector.findOneAndDelete({ _id: req.params.id });

    res.json({
      msg: 'Índice eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting indice:', error);
    res.status(500).json({
      error: 'Server error deleting indice',
      message: error.message
    });
  }
});


module.exports = router;
