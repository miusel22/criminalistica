const express = require('express');
const { Sector, User } = require('../models/sequelize');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/sectores - Obtener todos los sectores
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🏗 Obteniendo sectores...');
    
    const sectores = await Sector.findAll({
      where: {
        type: 'sector',
        activo: true
      },
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });

    console.log(`✅ Encontrados ${sectores.length} sectores`);
    
    // Usar toDict() para obtener estructura completa
    const sectoresData = sectores.map(sector => sector.toDict());

    res.json({
      sectores: sectoresData
    });
  } catch (error) {
    console.error('❌ Error obteniendo sectores:', error);
    res.status(500).json({
      error: 'Server error fetching sectores',
      message: error.message
    });
  }
});

// GET /api/sectores/jerarquia - Obtener jerarquía completa de sectores
router.get('/jerarquia', authMiddleware, async (req, res) => {
  try {
    console.log('🏭 Obteniendo jerarquía para usuario:', req.user.id);
    
    const jerarquia = await Sector.getHierarchy(req.user.id, false);
    console.log(`✅ Jerarquía obtenida: ${jerarquia.length} sectores principales`);
    
    res.json(jerarquia);
  } catch (error) {
    console.error('❌ Error obteniendo jerarquía:', error);
    res.status(500).json({
      error: 'Server error fetching hierarchy',
      message: error.message
    });
  }
});

// GET /api/sectores/:id - Obtener sector específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Obteniendo sector:', req.params.id);
    
    const sector = await Sector.findOne({
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!sector) {
      return res.status(404).json({
        error: 'Sector no encontrado'
      });
    }

    const sectorData = sector.toDict();
    console.log('✅ Sector obtenido:', sectorData.nombre);

    res.json(sectorData);
  } catch (error) {
    console.error('❌ Error obteniendo sector:', error);
    res.status(500).json({
      error: 'Server error fetching sector',
      message: error.message
    });
  }
});

// POST /api/sectores - Crear nuevo sector
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('🆕 Creando sector con datos:', req.body);
    
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
      orden
    } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        error: 'El nombre del sector es requerido'
      });
    }

    // Verificar si ya existe un sector con ese nombre
    const existingSector = await Sector.findOne({
      where: {
        nombre: nombre.trim(),
        type: 'sector'
      }
    });

    if (existingSector) {
      return res.status(409).json({
        error: `Ya existe un sector con el nombre '${nombre}'`
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
          error: `Ya existe un sector con el código '${codigo}'`
        });
      }
    }

    // Crear nuevo sector
    const nuevoSector = await Sector.create({
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
      type: 'sector',
      ownerId: req.user.id
    });

    console.log('✅ Sector creado:', nuevoSector.id);
    const sectorData = nuevoSector.toDict();

    res.status(201).json({
      message: 'Sector creado exitosamente',
      sector: sectorData
    });
  } catch (error) {
    console.error('❌ Error creando sector:', error);
    res.status(500).json({
      error: 'Server error creating sector',
      message: error.message
    });
  }
});

// PUT /api/sectores/:id - Actualizar sector
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 Actualizando sector con datos:', req.body);
    
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

    const sector = await Sector.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!sector) {
      return res.status(404).json({
        error: 'Sector no encontrado'
      });
    }

    // Verificar nombre único si se está cambiando
    if (nombre && nombre.trim() !== sector.nombre) {
      const existingSector = await Sector.findOne({
        where: {
          nombre: nombre.trim(),
          type: 'sector',
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingSector) {
        return res.status(409).json({
          error: `Ya existe otro sector con el nombre '${nombre}'`
        });
      }
    }

    // Verificar código único si se está cambiando
    if (codigo && codigo.trim() !== sector.codigo) {
      const existingCodigo = await Sector.findOne({
        where: {
          codigo: codigo.trim(),
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingCodigo) {
        return res.status(409).json({
          error: `Ya existe otro sector con el código '${codigo}'`
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {
      nombre: nombre !== undefined ? nombre.trim() : sector.nombre,
      descripcion: descripcion !== undefined ? (descripcion ? descripcion.trim() : '') : sector.descripcion,
      codigo: codigo !== undefined ? (codigo ? codigo.trim() : null) : sector.codigo,
      ubicacion: ubicacion !== undefined ? (ubicacion ? ubicacion.trim() : '') : sector.ubicacion,
      telefono: telefono !== undefined ? (telefono ? telefono.trim() : '') : sector.telefono,
      email: email !== undefined ? (email ? email.trim() : null) : sector.email,
      jefeNombre: jefeNombre !== undefined ? (jefeNombre ? jefeNombre.trim() : null) : sector.jefeNombre,
      jefeCargo: jefeCargo !== undefined ? (jefeCargo ? jefeCargo.trim() : null) : sector.jefeCargo,
      jefeContacto: jefeContacto !== undefined ? (jefeContacto ? jefeContacto.trim() : null) : sector.jefeContacto,
      configuracion: configuracion !== undefined ? configuracion : sector.configuracion,
      orden: orden !== undefined ? orden : sector.orden,
      activo: activo !== undefined ? activo : sector.activo
    };

    console.log('📦 Datos procesados para actualizar:', updateData);

    // Actualizar sector
    await sector.update(updateData);
    console.log('✅ Sector actualizado:', sector.id);

    // Usar toDict() para formatear respuesta
    const sectorData = sector.toDict();

    res.json({
      message: 'Sector actualizado exitosamente',
      sector: sectorData
    });
  } catch (error) {
    console.error('❌ Error actualizando sector:', error);
    res.status(500).json({
      error: 'Server error updating sector',
      message: error.message
    });
  }
});

// DELETE /api/sectores/:id - Eliminar sector (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ Eliminando sector:', req.params.id);
    
    const sector = await Sector.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!sector) {
      return res.status(404).json({
        error: 'Sector no encontrado'
      });
    }

    // Verificar si tiene subsectores activos
    const subsectores = await Sector.count({
      where: {
        parentId: sector.id,
        activo: true
      }
    });

    if (subsectores > 0) {
      return res.status(400).json({
        error: `No se puede eliminar el sector porque tiene ${subsectores} subsectores activos`
      });
    }

    // TODO: Verificar si tiene indiciados o vehículos relacionados
    // const indiciados = await Indiciado.count({ where: { subsectorId: sector.id } });
    // const vehiculos = await Vehiculo.count({ where: { subsectorId: sector.id } });
    
    // Soft delete - marcar como inactivo
    sector.activo = false;
    await sector.save();
    
    console.log('✅ Sector eliminado (soft delete):', sector.id);

    res.json({
      message: 'Sector eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando sector:', error);
    res.status(500).json({
      error: 'Server error deleting sector',
      message: error.message
    });
  }
});

// GET /api/sectores/buscar/:query - Buscar sectores
router.get('/buscar/:query', authMiddleware, async (req, res) => {
  try {
    const { query } = req.params;
    console.log('🔍 Buscando sectores con término:', query);
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const resultado = await Sector.searchAll(req.user.id, query.trim());
    console.log(`✅ Encontrados ${resultado.total} resultados`);

    res.json({
      message: `Encontrados ${resultado.total} sectores`,
      sectores: resultado.resultados
    });
  } catch (error) {
    console.error('❌ Error buscando sectores:', error);
    res.status(500).json({
      error: 'Server error searching sectores',
      message: error.message
    });
  }
});

module.exports = router;
