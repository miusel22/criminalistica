const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireAdmin } = require('../middleware/adminAuth');
const usersController = require('../controllers/usersController');

// Todas las rutas requieren permisos de administrador
router.use(requireAdmin);

// Validaciones para crear usuario
const createUserValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellidos')
    .notEmpty()
    .withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 50 })
    .withMessage('Los apellidos deben tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula y un número'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('El rol debe ser "user" o "admin"')
];

// Validaciones para actualizar usuario
const updateUserValidation = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('apellidos')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Los apellidos deben tener entre 2 y 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula y un número'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('El rol debe ser "user" o "admin"'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (solo admin)
 * @access  Admin
 * @query   page, limit, search, role
 */
router.get('/', usersController.getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Obtener estadísticas de usuarios (solo admin)
 * @access  Admin
 */
router.get('/stats', usersController.getUserStats);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID (solo admin)
 * @access  Admin
 */
router.get('/:id', usersController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario (solo admin)
 * @access  Admin
 */
router.post('/', createUserValidation, usersController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar usuario (solo admin)
 * @access  Admin
 */
router.put('/:id', updateUserValidation, usersController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario (solo admin)
 * @access  Admin
 */
router.delete('/:id', usersController.deleteUser);

/**
 * @route   PATCH /api/users/:id/toggle-status
 * @desc    Cambiar estado activo/inactivo del usuario (solo admin)
 * @access  Admin
 */
router.patch('/:id/toggle-status', usersController.toggleUserStatus);

module.exports = router;
