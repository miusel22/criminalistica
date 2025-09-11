const express = require('express');
const multer = require('multer');
const { body, param, validationResult } = require('express-validator');
const indiciadosController = require('../controllers/indiciadosPostgresController');
const authMiddleware = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');
const { canRead, canWrite, canAdmin, buildGlobalQuery, canModifyRecord } = require('../middleware/permissions');
const optionalAuthMiddleware = authMiddleware.optional;

// Importar configuración de Cloudinary
const { photoStorage } = require('../config/cloudinary');

const router = express.Router();

// Configuración de multer con Cloudinary
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP)'), false);
  }
};

const upload = multer({
  storage: photoStorage, // Usar Cloudinary storage
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB (Cloudinary puede manejar archivos más grandes)
  }
});

// Validaciones
const createValidations = [
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellidos').notEmpty().withMessage('Apellidos es requerido')
];

const updateValidations = [
  param('id').isUUID().withMessage('ID debe ser un UUID válido')
];

const searchValidations = [
  param('id').isUUID().withMessage('ID debe ser un UUID válido')
];

// Rutas CRUD

// GET /api/postgres/indiciados - Obtener todos los indiciados (acceso global - todos los roles pueden ver)
router.get('/', authMiddleware, canRead, indiciadosController.obtenerTodos);

// GET /api/postgres/indiciados/search - Buscar indiciados (acceso global - todos los roles pueden buscar)
router.get('/search', authMiddleware, canRead, indiciadosController.buscar);

// GET /api/postgres/indiciados/stats - Obtener estadísticas (acceso global - todos los roles pueden ver stats)
router.get('/stats', authMiddleware, canRead, indiciadosController.obtenerEstadisticas);

// GET /api/postgres/indiciados/:id - Obtener un indiciado por ID (acceso global - todos los roles pueden ver)
router.get('/:id', authMiddleware, canRead, searchValidations, indiciadosController.obtenerPorId);

// POST /api/postgres/indiciados - Crear nuevo indiciado (solo editor y admin)
router.post('/', authMiddleware, canWrite, upload.single('foto'), createValidations, indiciadosController.crear);

// PUT /api/postgres/indiciados/:id - Actualizar indiciado (solo editor y admin)
router.put('/:id', authMiddleware, canWrite, upload.single('foto'), updateValidations, indiciadosController.actualizar);

// DELETE /api/postgres/indiciados/:id - Eliminar indiciado (solo editor y admin)
router.delete('/:id', authMiddleware, canWrite, updateValidations, indiciadosController.eliminar);

module.exports = router;
