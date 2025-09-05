const express = require('express');
const router = express.Router();
const {
  getDepartamentos,
  getCiudadesByDepartamento,
  buscarCiudades,
  validarUbicacion
} = require('../controllers/colombiaController');

// @route   GET /api/colombia/departamentos
// @desc    Obtener todos los departamentos de Colombia
// @access  Public
router.get('/departamentos', getDepartamentos);

// @route   GET /api/colombia/departamentos/:departamentoId/ciudades
// @desc    Obtener ciudades de un departamento específico
// @access  Public
router.get('/departamentos/:departamentoId/ciudades', getCiudadesByDepartamento);

// @route   GET /api/colombia/ciudades/buscar?q=termino
// @desc    Buscar ciudades por nombre (autocompletado)
// @access  Public
router.get('/ciudades/buscar', buscarCiudades);

// @route   POST /api/colombia/validar-ubicacion
// @desc    Validar combinación departamento-ciudad y generar nombre de sector
// @access  Public
router.post('/validar-ubicacion', validarUbicacion);

module.exports = router;
