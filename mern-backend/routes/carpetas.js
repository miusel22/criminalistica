const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Carpeta = require('../models/Carpeta');
const User = require('../models/User');
const Indiciado = require('../models/Indiciado');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Crear carpeta
router.post('', authMiddleware, [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El campo "nombre" es requerido y debe ser un texto no vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres'),
  body('parent_id')
    .optional()
    .isMongoId()
    .withMessage('parent_id debe ser un ID válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { nombre, parent_id } = req.body;

    // Si hay parent_id, verificar que existe y pertenece al usuario
    if (parent_id) {
      const parent = await Carpeta.findOne({ 
        _id: parent_id, 
        ownerId: req.user._id 
      });
      
      if (!parent) {
        return res.status(404).json({
          msg: 'El sector padre no existe o no pertenece al usuario'
        });
      }

      // Verificar que no existe una carpeta con el mismo nombre en el mismo nivel
      const exists = await Carpeta.findOne({
        ownerId: req.user._id,
        parentId: parent_id,
        nombre
      });

      if (exists) {
        return res.status(409).json({
          msg: `El sub-sector '${nombre}' ya existe en '${parent.nombre}'`
        });
      }
    } else {
      // Verificar que no existe una carpeta raíz con el mismo nombre
      const exists = await Carpeta.findOne({
        ownerId: req.user._id,
        parentId: null,
        nombre
      });

      if (exists) {
        return res.status(409).json({
          msg: `El sector '${nombre}' ya existe`
        });
      }
    }

    // Crear nueva carpeta
    const nuevaCarpeta = new Carpeta({
      nombre,
      ownerId: req.user._id,
      parentId: parent_id || null
    });

    await nuevaCarpeta.save();
    const carpetaDict = await nuevaCarpeta.toDict();

    res.status(201).json({
      msg: 'Carpeta creada exitosamente',
      carpeta: carpetaDict
    });
  } catch (error) {
    console.error('Error creating carpeta:', error);
    res.status(500).json({
      error: 'Server error creating carpeta',
      message: error.message
    });
  }
});

// Obtener carpetas del usuario (solo carpetas raíz)
router.get('', authMiddleware, async (req, res) => {
  try {
    const carpetas = await Carpeta.find({
      ownerId: req.user._id,
      parentId: null
    }).sort({ nombre: 1 });

    const carpetasDict = [];
    for (const carpeta of carpetas) {
      const carpetaDict = await carpeta.toDict();
      carpetasDict.push(carpetaDict);
    }

    res.json(carpetasDict);
  } catch (error) {
    console.error('Error fetching carpetas:', error);
    res.status(500).json({
      error: 'Server error fetching carpetas',
      message: error.message
    });
  }
});

// Obtener carpeta específica con indiciados
router.get('/:id', authMiddleware, [
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

    const carpeta = await Carpeta.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!carpeta) {
      return res.status(404).json({
        msg: 'Carpeta no encontrada o no pertenece al usuario'
      });
    }

    const carpetaDict = await carpeta.toDict(true);
    res.json(carpetaDict);
  } catch (error) {
    console.error('Error fetching carpeta:', error);
    res.status(500).json({
      error: 'Server error fetching carpeta',
      message: error.message
    });
  }
});

// Actualizar carpeta
router.put('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El campo "nombre" es requerido y debe ser un texto no vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { nombre } = req.body;
    const carpetaId = req.params.id;

    const carpeta = await Carpeta.findOne({
      _id: carpetaId,
      ownerId: req.user._id
    });

    if (!carpeta) {
      return res.status(404).json({
        msg: 'Carpeta no encontrada o no pertenece al usuario'
      });
    }

    // Verificar que no existe otra carpeta con el mismo nombre en el mismo nivel
    const conflicto = await Carpeta.findOne({
      ownerId: req.user._id,
      parentId: carpeta.parentId,
      nombre,
      _id: { $ne: carpetaId }
    });

    if (conflicto) {
      return res.status(409).json({
        msg: `Ya existe una carpeta con el nombre '${nombre}' en este nivel.`
      });
    }

    // Actualizar carpeta
    carpeta.nombre = nombre;
    await carpeta.save();

    const carpetaDict = await carpeta.toDict();

    res.json({
      msg: 'Carpeta actualizada exitosamente',
      carpeta: carpetaDict
    });
  } catch (error) {
    console.error('Error updating carpeta:', error);
    res.status(500).json({
      error: 'Server error updating carpeta',
      message: error.message
    });
  }
});

// Eliminar carpeta
router.delete('/:id', authMiddleware, [
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

    const carpeta = await Carpeta.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!carpeta) {
      return res.status(404).json({
        msg: 'Carpeta no encontrada o no pertenece al usuario'
      });
    }

    // Las carpetas se eliminarán en cascada gracias a los middleware de Mongoose
    await Carpeta.findByIdAndDelete(req.params.id);

    res.json({
      msg: 'Carpeta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting carpeta:', error);
    res.status(500).json({
      error: 'Server error deleting carpeta',
      message: error.message
    });
  }
});

module.exports = router;
