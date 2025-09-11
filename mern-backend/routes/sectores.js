const express = require('express');
const { Sector, User, Indiciado, Vehiculo } = require('../models/sequelize');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// Helper functions para cargar datos de Colombia
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

const obtenerNombreDepartamento = async (departamentoId) => {
  try {
    const data = await loadColombiaData();
    if (!data) return null;
    
    const departamento = data.departamentos.find(dept => dept.id === departamentoId);
    return departamento ? departamento.nombre : null;
  } catch (error) {
    console.error('Error obteniendo nombre departamento:', error);
    return null;
  }
};

const obtenerNombreCiudad = async (departamentoId, ciudadId) => {
  try {
    const data = await loadColombiaData();
    if (!data) return null;
    
    const departamento = data.departamentos.find(dept => dept.id === departamentoId);
    if (!departamento) return null;
    
    const ciudad = departamento.ciudades.find(city => city.id === ciudadId);
    return ciudad ? ciudad.nombre : null;
  } catch (error) {
    console.error('Error obteniendo nombre ciudad:', error);
    return null;
  }
};

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
    
    // Mostrar jerarquía global (sin filtrar por owner)
    const jerarquia = await Sector.getHierarchy(null, false);
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
        msg: 'Sector no encontrado'
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
      orden,
      // Nuevos campos de ubicación
      departamentoId,
      ciudadId,
      ciudadPersonalizada
    } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        msg: 'El nombre del sector es requerido'
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
        msg: `Ya existe un sector con el nombre '${nombre}'`
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
          msg: `Ya existe un sector con el código '${codigo}'`
        });
      }
    }

    // Obtener nombres de departamento y ciudad si se proporcionaron IDs
    let departamentoNombre = null;
    let ciudadNombre = null;
    
    if (departamentoId) {
      departamentoNombre = await obtenerNombreDepartamento(departamentoId);
      console.log(`🗺️ Departamento resuelto: ${departamentoId} -> ${departamentoNombre}`);
    }
    
    if (ciudadId && departamentoId) {
      ciudadNombre = await obtenerNombreCiudad(departamentoId, ciudadId);
      console.log(`🏢 Ciudad resuelta: ${ciudadId} -> ${ciudadNombre}`);
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
      ownerId: req.user.id,
      // Nuevos campos de ubicación
      departamentoId: departamentoId || null,
      departamentoNombre: departamentoNombre,
      ciudadId: ciudadId || null,
      ciudadNombre: ciudadNombre,
      ciudadPersonalizada: ciudadPersonalizada || null
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
      activo,
      // Nuevos campos de ubicación
      departamentoId,
      ciudadId,
      ciudadPersonalizada
    } = req.body;

    const sector = await Sector.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!sector) {
      return res.status(404).json({
        msg: 'Sector no encontrado'
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
          msg: `Ya existe otro sector con el nombre '${nombre}'`
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
          msg: `Ya existe otro sector con el código '${codigo}'`
        });
      }
    }

    // Obtener nombres de departamento y ciudad si se proporcionaron IDs
    let departamentoNombre = sector.departamentoNombre;
    let ciudadNombre = sector.ciudadNombre;
    
    if (departamentoId && departamentoId !== sector.departamentoId) {
      departamentoNombre = await obtenerNombreDepartamento(departamentoId);
      console.log(`🗺️ Departamento actualizado: ${departamentoId} -> ${departamentoNombre}`);
    }
    
    if (ciudadId && ciudadId !== sector.ciudadId && departamentoId) {
      ciudadNombre = await obtenerNombreCiudad(departamentoId, ciudadId);
      console.log(`🏢 Ciudad actualizada: ${ciudadId} -> ${ciudadNombre}`);
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
      activo: activo !== undefined ? activo : sector.activo,
      // Nuevos campos de ubicación
      departamentoId: departamentoId !== undefined ? departamentoId : sector.departamentoId,
      departamentoNombre: departamentoNombre,
      ciudadId: ciudadId !== undefined ? ciudadId : sector.ciudadId,
      ciudadNombre: ciudadNombre,
      ciudadPersonalizada: ciudadPersonalizada !== undefined ? ciudadPersonalizada : sector.ciudadPersonalizada
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
        msg: 'Sector no encontrado'
      });
    }

    // Obtener subsectores del sector para eliminación en cascada
    const subsectores = await Sector.findAll({
      where: {
        parentId: sector.id,
        activo: true
      }
    });

    console.log(`📊 Sector tiene ${subsectores.length} subsectores que serán eliminados en cascada`);

    // Variables para contar elementos eliminados
    let totalIndiciados = 0;
    let totalVehiculos = 0;

    // Eliminar en cascada: indiciados, vehículos y subsectores (ELIMINACIÓN REAL)
    if (subsectores.length > 0) {
      
      // Eliminar indiciados y vehículos de cada subsector
      for (const subsector of subsectores) {
        // Eliminar indiciados del subsector (ELIMINACIÓN REAL)
        const indiciadosResult = await Indiciado.destroy({
          where: { 
            subsectorId: subsector.id
          }
        });
        totalIndiciados += indiciadosResult || 0;
        
        // Eliminar vehículos del subsector (ELIMINACIÓN REAL)
        const vehiculosResult = await Vehiculo.destroy({
          where: { 
            subsectorId: subsector.id
          }
        });
        totalVehiculos += vehiculosResult || 0;
      }
      
      console.log(`📈 Eliminados permanentemente: ${totalIndiciados} indiciados, ${totalVehiculos} vehículos`);
      
      // Eliminar subsectores (ELIMINACIÓN REAL)
      const subsectoresEliminados = await Sector.destroy({
        where: {
          parentId: sector.id
        }
      });
      
      console.log(`✅ Eliminación en cascada completada: ${subsectoresEliminados} subsectores, ${totalIndiciados} indiciados, ${totalVehiculos} vehículos`);
    }
    
    // Eliminar el sector principal (ELIMINACIÓN REAL)
    await sector.destroy();
    
    console.log('✅ Sector eliminado permanentemente:', sector.id);

    // Preparar mensaje de respuesta con estadísticas
    let message = 'Sector eliminado exitosamente';
    if (subsectores.length > 0) {
      message += ` junto con ${subsectores.length} subsectores`;
      if (totalIndiciados > 0) message += `, ${totalIndiciados} indiciados`;
      if (totalVehiculos > 0) message += `, ${totalVehiculos} vehículos`;
    }

    res.json({
      message,
      eliminacionCascada: {
        subsectores: subsectores.length,
        indiciados: totalIndiciados,
        vehiculos: totalVehiculos
      }
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

const resultado = await Sector.searchAll(null, query.trim());
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
