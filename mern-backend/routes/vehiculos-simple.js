const express = require('express');
const { Vehiculo } = require('../models/sequelize');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/vehiculos - Obtener todos los vehículos
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching vehiculos for user:', req.user.id);
    
    const vehiculos = await Vehiculo.findAll({
      where: { activo: true },
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${vehiculos.length} vehiculos`);
    
    // Usar toDict() para obtener la estructura completa
    const vehiculosData = vehiculos.map(vehiculo => vehiculo.toDict());

    res.json(vehiculosData);
  } catch (error) {
    console.error('Error fetching vehiculos:', error);
    res.status(500).json({
      error: 'Server error fetching vehiculos',
      message: error.message
    });
  }
});

// GET /api/vehiculos/:id - Obtener vehículo específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Obteniendo vehículo:', req.params.id);
    
    const vehiculo = await Vehiculo.findOne({
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    // Usar toDict() para obtener la estructura completa
    const vehiculoData = vehiculo.toDict();
    console.log('✅ Vehículo obtenido:', vehiculoData.id);

    res.json(vehiculoData);
  } catch (error) {
    console.error('Error fetching vehiculo:', error);
    res.status(500).json({
      error: 'Server error fetching vehiculo',
      message: error.message
    });
  }
});

// GET /api/vehiculos/sector/:sector - Obtener vehículos por sector
router.get('/sector/:sector', authMiddleware, async (req, res) => {
  try {
    const { sector } = req.params;
    
    const vehiculos = await Vehiculo.findAll({
      where: {
        sectorQueOpera: sector
      },
      order: [['marca', 'ASC'], ['modelo', 'ASC']]
    });
    
    const vehiculosData = vehiculos.map(vehiculo => ({
      id: vehiculo.id,
      tipoVehiculo: vehiculo.tipoVehiculo,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      placa: vehiculo.placa,
      color: vehiculo.color,
      chasis: vehiculo.chasis,
      motor: vehiculo.motor,
      combustible: vehiculo.combustible,
      estado: vehiculo.estado,
      observaciones: vehiculo.observaciones,
      sectorQueOpera: vehiculo.sectorQueOpera,
      fechaIngreso: vehiculo.fechaIngreso,
      ownerId: vehiculo.ownerId,
      createdAt: vehiculo.createdAt,
      updatedAt: vehiculo.updatedAt
    }));

    res.json(vehiculosData);
  } catch (error) {
    console.error('Error fetching vehiculos by sector:', error);
    res.status(500).json({
      error: 'Server error fetching vehiculos',
      message: error.message
    });
  }
});

// GET /api/vehiculos/placa/:placa - Buscar vehículo por placa
router.get('/placa/:placa', authMiddleware, async (req, res) => {
  try {
    const { placa } = req.params;
    
    const vehiculo = await Vehiculo.findOne({
      where: {
        placa: placa.toUpperCase()
      }
    });

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado con esa placa'
      });
    }

    const vehiculoData = {
      id: vehiculo.id,
      tipoVehiculo: vehiculo.tipoVehiculo,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      placa: vehiculo.placa,
      color: vehiculo.color,
      chasis: vehiculo.chasis,
      motor: vehiculo.motor,
      combustible: vehiculo.combustible,
      estado: vehiculo.estado,
      observaciones: vehiculo.observaciones,
      sectorQueOpera: vehiculo.sectorQueOpera,
      fechaIngreso: vehiculo.fechaIngreso,
      ownerId: vehiculo.ownerId,
      createdAt: vehiculo.createdAt,
      updatedAt: vehiculo.updatedAt
    };

    res.json(vehiculoData);
  } catch (error) {
    console.error('Error fetching vehiculo by placa:', error);
    res.status(500).json({
      error: 'Server error fetching vehiculo',
      message: error.message
    });
  }
});

// POST /api/vehiculos - Crear nuevo vehículo
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('🆕 Creando vehículo con datos:', req.body);
    
    const {
      tipoVehiculo,
      marca,
      linea,
      modelo,
      placa,
      color,
      numeroChasis,
      numeroMotor,
      cilindraje,
      combustible,
      propietario,
      soat,
      tecnomecanica,
      estado,
      fechaIncidente,
      lugarIncidente,
      tipoIncidente,
      observaciones,
      caracteristicasParticulares,
      googleEarthUrl,
      sectorQueOpera,
      subsectorId
    } = req.body;

    if (!tipoVehiculo || tipoVehiculo.trim() === '') {
      return res.status(400).json({
        error: 'El tipo de vehículo es requerido'
      });
    }

    // Verificar si ya existe un vehículo con esa placa
    if (placa && placa.trim()) {
      const existingVehiculo = await Vehiculo.findOne({
        where: {
          placa: placa.toUpperCase().trim()
        }
      });

      if (existingVehiculo) {
        return res.status(409).json({
          error: `Ya existe un vehículo con la placa '${placa}'`
        });
      }
    }

    // Verificar si ya existe un vehículo con ese chasis
    if (numeroChasis && numeroChasis.trim()) {
      const existingVehiculo = await Vehiculo.findOne({
        where: {
          numeroChasis: numeroChasis.toUpperCase().trim()
        }
      });

      if (existingVehiculo) {
        return res.status(409).json({
          error: `Ya existe un vehículo con el chasis '${numeroChasis}'`
        });
      }
    }

    // Preparar datos para la creación
    const vehiculoData = {
      tipoVehiculo: tipoVehiculo.trim(),
      marca: marca ? marca.trim() : '',
      linea: linea ? linea.trim() : '',
      modelo: modelo ? modelo.trim() : '',
      placa: placa ? placa.toUpperCase().trim() : '',
      color: color ? color.trim() : '',
      numeroChasis: numeroChasis ? numeroChasis.toUpperCase().trim() : '',
      numeroMotor: numeroMotor ? numeroMotor.trim() : '',
      cilindraje: cilindraje ? cilindraje.trim() : '',
      combustible: combustible || null,
      propietario: propietario || {
        nombre: '',
        documento: { tipo: '', numero: '' },
        telefono: '',
        direccion: ''
      },
      soat: soat || {
        numeroPoliza: '',
        vigencia: null,
        aseguradora: ''
      },
      tecnomecanica: tecnomecanica || {
        numero: '',
        vigencia: null,
        cda: ''
      },
      estado: estado || 'Activo',
      fechaIncidente: fechaIncidente || null,
      lugarIncidente: lugarIncidente ? lugarIncidente.trim() : '',
      tipoIncidente: tipoIncidente ? tipoIncidente.trim() : '',
      observaciones: observaciones ? observaciones.trim() : '',
      caracteristicasParticulares: caracteristicasParticulares ? caracteristicasParticulares.trim() : '',
      googleEarthUrl: googleEarthUrl ? googleEarthUrl.trim() : '',
      sectorQueOpera: sectorQueOpera ? sectorQueOpera.trim() : '',
      subsectorId: subsectorId || null,
      ownerId: req.user.id
    };

    console.log('📦 Datos procesados para crear:', vehiculoData);

    // Crear nuevo vehículo
    const nuevoVehiculo = await Vehiculo.create(vehiculoData);
    console.log('✅ Vehículo creado:', nuevoVehiculo.id);

    // Usar el método toDict del modelo para formatear la respuesta
    const responseData = nuevoVehiculo.toDict();

    res.status(201).json({
      message: 'Vehículo creado exitosamente',
      vehiculo: responseData
    });
  } catch (error) {
    console.error('❌ Error creating vehiculo:', error);
    res.status(500).json({
      error: 'Server error creating vehiculo',
      message: error.message
    });
  }
});

// PUT /api/vehiculos/:id - Actualizar vehículo
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 Actualizando vehículo con datos:', req.body);
    
    const {
      tipoVehiculo,
      marca,
      linea,
      modelo,
      placa,
      color,
      numeroChasis,
      numeroMotor,
      cilindraje,
      combustible,
      propietario,
      soat,
      tecnomecanica,
      estado,
      fechaIncidente,
      lugarIncidente,
      tipoIncidente,
      observaciones,
      caracteristicasParticulares,
      googleEarthUrl,
      sectorQueOpera,
      subsectorId
    } = req.body;

    const vehiculo = await Vehiculo.findByPk(req.params.id);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && vehiculo.ownerId !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permisos para editar este vehículo'
      });
    }

    // Verificar placa única si se está actualizando
    if (placa && placa.toUpperCase().trim() !== vehiculo.placa) {
      const existingVehiculo = await Vehiculo.findOne({
        where: {
          placa: placa.toUpperCase().trim(),
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingVehiculo) {
        return res.status(409).json({
          error: `Ya existe otro vehículo con la placa '${placa}'`
        });
      }
    }

    // Verificar chasis único si se está actualizando
    if (numeroChasis && numeroChasis.toUpperCase().trim() !== vehiculo.numeroChasis) {
      const existingVehiculo = await Vehiculo.findOne({
        where: {
          numeroChasis: numeroChasis.toUpperCase().trim(),
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingVehiculo) {
        return res.status(409).json({
          error: `Ya existe otro vehículo con el chasis '${numeroChasis}'`
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {
      tipoVehiculo: tipoVehiculo ? tipoVehiculo.trim() : vehiculo.tipoVehiculo,
      marca: marca !== undefined ? (marca ? marca.trim() : '') : vehiculo.marca,
      linea: linea !== undefined ? (linea ? linea.trim() : '') : vehiculo.linea,
      modelo: modelo !== undefined ? (modelo ? modelo.trim() : '') : vehiculo.modelo,
      placa: placa !== undefined ? (placa ? placa.toUpperCase().trim() : '') : vehiculo.placa,
      color: color !== undefined ? (color ? color.trim() : '') : vehiculo.color,
      numeroChasis: numeroChasis !== undefined ? (numeroChasis ? numeroChasis.toUpperCase().trim() : '') : vehiculo.numeroChasis,
      numeroMotor: numeroMotor !== undefined ? (numeroMotor ? numeroMotor.trim() : '') : vehiculo.numeroMotor,
      cilindraje: cilindraje !== undefined ? (cilindraje ? cilindraje.trim() : '') : vehiculo.cilindraje,
      combustible: combustible !== undefined ? combustible : vehiculo.combustible,
      propietario: propietario !== undefined ? propietario : vehiculo.propietario,
      soat: soat !== undefined ? soat : vehiculo.soat,
      tecnomecanica: tecnomecanica !== undefined ? tecnomecanica : vehiculo.tecnomecanica,
      estado: estado !== undefined ? estado : vehiculo.estado,
      fechaIncidente: fechaIncidente !== undefined ? fechaIncidente : vehiculo.fechaIncidente,
      lugarIncidente: lugarIncidente !== undefined ? (lugarIncidente ? lugarIncidente.trim() : '') : vehiculo.lugarIncidente,
      tipoIncidente: tipoIncidente !== undefined ? (tipoIncidente ? tipoIncidente.trim() : '') : vehiculo.tipoIncidente,
      observaciones: observaciones !== undefined ? (observaciones ? observaciones.trim() : '') : vehiculo.observaciones,
      caracteristicasParticulares: caracteristicasParticulares !== undefined ? (caracteristicasParticulares ? caracteristicasParticulares.trim() : '') : vehiculo.caracteristicasParticulares,
      googleEarthUrl: googleEarthUrl !== undefined ? (googleEarthUrl ? googleEarthUrl.trim() : '') : vehiculo.googleEarthUrl,
      sectorQueOpera: sectorQueOpera !== undefined ? (sectorQueOpera ? sectorQueOpera.trim() : '') : vehiculo.sectorQueOpera,
      subsectorId: subsectorId !== undefined ? subsectorId : vehiculo.subsectorId
    };

    console.log('📦 Datos procesados para actualizar:', updateData);

    // Actualizar vehículo
    await vehiculo.update(updateData);
    console.log('✅ Vehículo actualizado:', vehiculo.id);

    // Usar el método toDict del modelo para formatear la respuesta
    const responseData = vehiculo.toDict();

    res.json({
      message: 'Vehículo actualizado exitosamente',
      vehiculo: responseData
    });
  } catch (error) {
    console.error('Error updating vehiculo:', error);
    res.status(500).json({
      error: 'Server error updating vehiculo',
      message: error.message
    });
  }
});

// DELETE /api/vehiculos/:id - Eliminar vehículo (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && vehiculo.ownerId !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permisos para eliminar este vehículo'
      });
    }

    // Soft delete - marcar como inactivo
    vehiculo.activo = false;
    await vehiculo.save();

    res.json({
      message: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting vehiculo:', error);
    res.status(500).json({
      error: 'Server error deleting vehiculo',
      message: error.message
    });
  }
});

// GET /api/vehiculos/buscar/:query - Buscar vehículos
router.get('/buscar/:query', authMiddleware, async (req, res) => {
  try {
    const { query } = req.params;
    console.log('🔍 Buscando vehículos con término:', query);
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const searchTerm = `%${query.trim()}%`;
    
    const vehiculos = await Vehiculo.findAll({
      where: {
        activo: true,
        [Op.or]: [
          { placa: { [Op.iLike]: searchTerm } },
          { marca: { [Op.iLike]: searchTerm } },
          { linea: { [Op.iLike]: searchTerm } },
          { sectorQueOpera: { [Op.iLike]: searchTerm } },
          { numeroChasis: { [Op.iLike]: searchTerm } },
          { numeroMotor: { [Op.iLike]: searchTerm } }
        ]
      },
      limit: 50,
      order: [['createdAt', 'DESC']]
    });

    // Usar toDict() para obtener la estructura completa
    const vehiculosData = vehiculos.map(vehiculo => vehiculo.toDict());
    console.log(`✅ Encontrados ${vehiculos.length} vehículos`);

    res.json({
      msg: `Encontrados ${vehiculos.length} vehículos`,
      vehiculos: vehiculosData
    });
  } catch (error) {
    console.error('Error searching vehiculos:', error);
    res.status(500).json({
      error: 'Server error searching vehiculos',
      message: error.message
    });
  }
});

module.exports = router;
