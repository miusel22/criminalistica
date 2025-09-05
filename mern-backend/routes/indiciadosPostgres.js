const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { body, param, validationResult } = require('express-validator');
const indiciadosController = require('../controllers/indiciadosPostgresController');
const authMiddleware = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');
const { canRead, canWrite, canAdmin, buildGlobalQuery, canModifyRecord } = require('../middleware/permissions');
const optionalAuthMiddleware = authMiddleware.optional;

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    fs.ensureDirSync(uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + '_' + Date.now() + ext;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
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
