const express = require('express');
const { Sector, User, Indiciado, Vehiculo } = require('../models/sequelize');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/subsectores - Obtener todos los subsectores
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🏪 Obteniendo subsectores...');
    
    const subsectores = await Sector.findAll({
      where: {
        type: 'subsector',
        activo: true
      },
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });

    console.log(`✅ Encontrados ${subsectores.length} subsectores`);
    
    // Usar toDict() para obtener estructura completa
    const subsectoresData = subsectores.map(subsector => subsector.toDict());

    res.json({
      subsectores: subsectoresData
    });
  } catch (error) {
    console.error('❌ Error obteniendo subsectores:', error);
    res.status(500).json({
      error: 'Server error fetching subsectores',
      message: error.message
    });
  }
});

// GET /api/subsectores/sector/:sectorId - Obtener subsectores de un sector específico
router.get('/sector/:sectorId', authMiddleware, async (req, res) => {
  try {
    const { sectorId } = req.params;
    console.log('🏪 Obteniendo subsectores del sector:', sectorId);
    
    const subsectores = await Sector.findAll({
      where: {
        type: 'subsector',
        parentId: sectorId,
        activo: true
      },
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });
    
    console.log(`✅ Encontrados ${subsectores.length} subsectores para el sector`);
    
    // Usar toDict() para obtener estructura completa
    const subsectoresData = subsectores.map(subsector => subsector.toDict());

    res.json({
      subsectores: subsectoresData
    });
  } catch (error) {
    console.error('❌ Error obteniendo subsectores por sector:', error);
    res.status(500).json({
      error: 'Server error fetching subsectores',
      message: error.message
    });
  }
});

// GET /api/subsectores/:id - Obtener subsector específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Obteniendo subsector:', req.params.id);
    
    const subsector = await Sector.findOne({
      where: {
        id: req.params.id,
        type: 'subsector',
        activo: true
      }
    });

    if (!subsector) {
      return res.status(404).json({
        msg: 'Subsector no encontrado'
      });
    }

    const subsectorData = subsector.toDict();
    console.log('✅ Subsector obtenido:', subsectorData.nombre);

    res.json(subsectorData);
  } catch (error) {
    console.error('❌ Error obteniendo subsector:', error);
    res.status(500).json({
      error: 'Server error fetching subsector',
      message: error.message
    });
  }
});

// POST /api/subsectores - Crear nuevo subsector
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('🆕 Creando subsector con datos:', req.body);
    
    const {
      nombre,
      descripcion,
      codigo,
      ubicacion,
      telefono,
      email,
      jefeNombre,
      jefeCargo,
      jefeContacto,
      configuracion,
      orden,
      parentId
    } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        msg: 'El nombre del subsector es requerido'
      });
    }

    if (!parentId) {
      return res.status(400).json({
        msg: 'El sector padre es requerido'
      });
    }

    // Verificar que el sector padre existe
    const sectorPadre = await Sector.findOne({
      where: {
        id: parentId,
        type: 'sector'
      }
    });
    
    if (!sectorPadre) {
      return res.status(404).json({
        msg: 'Sector padre no encontrado'
      });
    }

    // Verificar si ya existe un subsector con ese nombre en el mismo sector
    const existingSubsector = await Sector.findOne({
      where: {
        nombre: nombre.trim(),
        type: 'subsector',
        parentId: parentId
      }
    });

    if (existingSubsector) {
      return res.status(409).json({
        msg: `Ya existe un subsector con el nombre '${nombre}' en este sector`
      });
    }

    // Verificar código único si se proporciona
    if (codigo && codigo.trim()) {
      const existingCodigo = await Sector.findOne({
        where: {
          codigo: codigo.trim()
        }
      });

      if (existingCodigo) {
        return res.status(409).json({
          msg: `Ya existe un subsector con el código '${codigo}'`
        });
      }
    }

    // Crear nuevo subsector
    const nuevoSubsector = await Sector.create({
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : '',
      codigo: codigo ? codigo.trim() : null,
      ubicacion: ubicacion ? ubicacion.trim() : '',
      telefono: telefono ? telefono.trim() : '',
      email: email ? email.trim() : null,
      jefeNombre: jefeNombre ? jefeNombre.trim() : null,
      jefeCargo: jefeCargo ? jefeCargo.trim() : null,
      jefeContacto: jefeContacto ? jefeContacto.trim() : null,
      configuracion: configuracion || {},
      orden: orden || 0,
      type: 'subsector',
      parentId: parentId,
      ownerId: req.user.id
    });

    console.log('✅ Subsector creado:', nuevoSubsector.id);
    const subsectorData = nuevoSubsector.toDict();

    res.status(201).json({
      message: 'Subsector creado exitosamente',
      subsector: subsectorData
    });
  } catch (error) {
    console.error('❌ Error creando subsector:', error);
    res.status(500).json({
      error: 'Server error creating subsector',
      message: error.message
    });
  }
});

// PUT /api/subsectores/:id - Actualizar subsector
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 Actualizando subsector con datos:', req.body);
    
    const {
      nombre,
      descripcion,
      codigo,
      ubicacion,
      telefono,
      email,
      jefeNombre,
      jefeCargo,
      jefeContacto,
      configuracion,
      orden,
      activo
    } = req.body;

    const subsector = await Sector.findOne({
      where: {
        id: req.params.id,
        type: 'subsector'
      }
    });

    if (!subsector) {
      return res.status(404).json({
        error: 'Subsector no encontrado'
      });
    }

    // Verificar nombre único si se está cambiando
    if (nombre && nombre.trim() !== subsector.nombre) {
      const existingSubsector = await Sector.findOne({
        where: {
          nombre: nombre.trim(),
          type: 'subsector',
          parentId: subsector.parentId,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingSubsector) {
        return res.status(409).json({
          error: `Ya existe otro subsector con el nombre '${nombre}' en este sector`
        });
      }
    }

    // Verificar código único si se está cambiando
    if (codigo && codigo.trim() !== subsector.codigo) {
      const existingCodigo = await Sector.findOne({
        where: {
          codigo: codigo.trim(),
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingCodigo) {
        return res.status(409).json({
          error: `Ya existe otro subsector con el código '${codigo}'`
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {
      nombre: nombre !== undefined ? nombre.trim() : subsector.nombre,
      descripcion: descripcion !== undefined ? (descripcion ? descripcion.trim() : '') : subsector.descripcion,
      codigo: codigo !== undefined ? (codigo ? codigo.trim() : null) : subsector.codigo,
      ubicacion: ubicacion !== undefined ? (ubicacion ? ubicacion.trim() : '') : subsector.ubicacion,
      telefono: telefono !== undefined ? (telefono ? telefono.trim() : '') : subsector.telefono,
      email: email !== undefined ? (email ? email.trim() : null) : subsector.email,
      jefeNombre: jefeNombre !== undefined ? (jefeNombre ? jefeNombre.trim() : null) : subsector.jefeNombre,
      jefeCargo: jefeCargo !== undefined ? (jefeCargo ? jefeCargo.trim() : null) : subsector.jefeCargo,
      jefeContacto: jefeContacto !== undefined ? (jefeContacto ? jefeContacto.trim() : null) : subsector.jefeContacto,
      configuracion: configuracion !== undefined ? configuracion : subsector.configuracion,
      orden: orden !== undefined ? orden : subsector.orden,
      activo: activo !== undefined ? activo : subsector.activo
    };

    console.log('📦 Datos procesados para actualizar:', updateData);

    // Actualizar subsector
    await subsector.update(updateData);
    console.log('✅ Subsector actualizado:', subsector.id);

    // Usar toDict() para formatear respuesta
    const subsectorData = subsector.toDict();

    res.json({
      message: 'Subsector actualizado exitosamente',
      subsector: subsectorData
    });
  } catch (error) {
    console.error('❌ Error actualizando subsector:', error);
    res.status(500).json({
      error: 'Server error updating subsector',
      message: error.message
    });
  }
});

// DELETE /api/subsectores/:id - Eliminar subsector (ELIMINACIÓN REAL)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ Eliminando subsector:', req.params.id);
    
    const subsector = await Sector.findOne({
      where: {
        id: req.params.id,
        type: 'subsector'
      }
    });

    if (!subsector) {
      return res.status(404).json({
        error: 'Subsector no encontrado'
      });
    }

    // Eliminar indiciados y vehículos relacionados (ELIMINACIÓN REAL)
    console.log('📈 Eliminando indiciados y vehículos del subsector...');
    
    const indiciadosEliminados = await Indiciado.destroy({
      where: { subsectorId: subsector.id }
    });
    
    const vehiculosEliminados = await Vehiculo.destroy({
      where: { subsectorId: subsector.id }
    });
    
    console.log(`📈 Eliminados: ${indiciadosEliminados} indiciados, ${vehiculosEliminados} vehículos`);
    
    // Eliminar el subsector (ELIMINACIÓN REAL)
    await subsector.destroy();
    
    console.log('✅ Subsector eliminado permanentemente:', subsector.id);

    res.json({
      message: 'Subsector eliminado exitosamente',
      eliminacionCascada: {
        indiciados: indiciadosEliminados,
        vehiculos: vehiculosEliminados
      }
    });
  } catch (error) {
    console.error('❌ Error eliminando subsector:', error);
    res.status(500).json({
      error: 'Server error deleting subsector',
      message: error.message
    });
  }
});

// GET /api/subsectores/buscar/:query - Buscar subsectores
router.get('/buscar/:query', authMiddleware, async (req, res) => {
  try {
    const { query } = req.params;
    console.log('🔍 Buscando subsectores con término:', query);
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const searchTerm = `%${query.trim().toLowerCase()}%`;
    
    const subsectores = await Sector.findAll({
      where: {
        type: 'subsector',
        activo: true,
        [Op.or]: [
          {
            nombre: {
              [Op.iLike]: searchTerm
            }
          },
          {
            descripcion: {
              [Op.iLike]: searchTerm
            }
          },
          {
            codigo: {
              [Op.iLike]: searchTerm
            }
          },
          {
            ubicacion: {
              [Op.iLike]: searchTerm
            }
          }
        ]
      },
      order: [['nombre', 'ASC']]
    });
    
    console.log(`✅ Encontrados ${subsectores.length} subsectores`);

    const subsectoresData = subsectores.map(subsector => subsector.toDict());

    res.json({
      message: `Encontrados ${subsectores.length} subsectores`,
      subsectores: subsectoresData
    });
  } catch (error) {
    console.error('❌ Error buscando subsectores:', error);
    res.status(500).json({
      error: 'Server error searching subsectores',
      message: error.message
    });
  }
});

// ========================
// RUTAS DE DESARROLLO TEMPORAL
// ========================

// GET /api/subsectores/dev/todos - Ver todos los subsectores (sin filtro de usuario)
router.get('/dev/todos', authMiddleware, async (req, res) => {
  try {
    console.log('🛠️ [DEV] Obteniendo TODOS los subsectores...');
    
    const subsectores = await Sector.findAll({
      where: {
        type: 'subsector',
        activo: true
      },
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });

    console.log(`✅ [DEV] Encontrados ${subsectores.length} subsectores (todos los usuarios)`);
    
    const subsectoresData = subsectores.map(subsector => {
      const data = subsector.toDict();
      return {
        ...data,
        _devInfo: {
          ownerId: subsector.ownerId,
          esDelUsuarioActual: subsector.ownerId === req.user.id
        }
      };
    });

    res.json({
      message: '[DEV] Todos los subsectores del sistema',
      subsectores: subsectoresData,
      _warning: 'Esta es una ruta de desarrollo - muestra subsectores de todos los usuarios'
    });
  } catch (error) {
    console.error('❌ [DEV] Error obteniendo todos los subsectores:', error);
    res.status(500).json({
      error: 'Server error fetching all subsectores',
      message: error.message
    });
  }
});

module.exports = router;
