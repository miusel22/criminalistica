const fs = require('fs').promises;
const path = require('path');

// Cargar datos de Colombia
const loadColombiaData = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/colombia.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading Colombia data:', error);
    throw new Error('Error al cargar los datos de Colombia');
  }
};

// Obtener todos los departamentos
const getDepartamentos = async (req, res) => {
  try {
    const data = await loadColombiaData();
    const departamentos = data.departamentos.map(dept => ({
      id: dept.id,
      nombre: dept.nombre
    }));

    res.json({
      exito: true,
      departamentos
    });
  } catch (error) {
    console.error('Error getting departamentos:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener los departamentos'
    });
  }
};

// Obtener ciudades de un departamento específico
const getCiudadesByDepartamento = async (req, res) => {
  try {
    const { departamentoId } = req.params;
    const data = await loadColombiaData();
    
    const departamento = data.departamentos.find(dept => dept.id === departamentoId);
    
    if (!departamento) {
      return res.status(404).json({
        exito: false,
        error: 'Departamento no encontrado'
      });
    }

    res.json({
      exito: true,
      departamento: {
        id: departamento.id,
        nombre: departamento.nombre
      },
      ciudades: departamento.ciudades
    });
  } catch (error) {
    console.error('Error getting ciudades:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener las ciudades'
    });
  }
};

// Buscar ciudades por nombre (para autocompletado)
const buscarCiudades = async (req, res) => {
  try {
    const { q } = req.query; // query parameter para búsqueda
    
    if (!q || q.length < 2) {
      return res.json({
        exito: true,
        resultados: []
      });
    }

    const data = await loadColombiaData();
    const resultados = [];

    // Buscar en todas las ciudades de todos los departamentos
    data.departamentos.forEach(departamento => {
      departamento.ciudades.forEach(ciudad => {
        if (ciudad.nombre.toLowerCase().includes(q.toLowerCase())) {
          resultados.push({
            ...ciudad,
            departamento: {
              id: departamento.id,
              nombre: departamento.nombre
            }
          });
        }
      });
    });

    // Limitar resultados y ordenar por relevancia
    const resultadosLimitados = resultados
      .sort((a, b) => {
        // Priorizar coincidencias exactas al inicio
        const aStartsWith = a.nombre.toLowerCase().startsWith(q.toLowerCase());
        const bStartsWith = b.nombre.toLowerCase().startsWith(q.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return a.nombre.localeCompare(b.nombre);
      })
      .slice(0, 20); // Limitar a 20 resultados

    res.json({
      exito: true,
      resultados: resultadosLimitados
    });
  } catch (error) {
    console.error('Error searching ciudades:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al buscar ciudades'
    });
  }
};

// Generar nombre de sector basado en departamento y ciudad
const generarNombreSector = (departamentoNombre, ciudadNombre) => {
  return `Sector ${departamentoNombre} - ${ciudadNombre}`;
};

// Validar combinación departamento-ciudad
const validarUbicacion = async (req, res) => {
  try {
    const { departamentoId, ciudadId } = req.body;
    const data = await loadColombiaData();
    
    const departamento = data.departamentos.find(dept => dept.id === departamentoId);
    
    if (!departamento) {
      return res.status(400).json({
        exito: false,
        error: 'Departamento no válido'
      });
    }

    const ciudad = departamento.ciudades.find(city => city.id === ciudadId);
    
    if (!ciudad) {
      return res.status(400).json({
        exito: false,
        error: 'Ciudad no válida para el departamento seleccionado'
      });
    }

    const nombreSector = generarNombreSector(departamento.nombre, ciudad.nombre);

    res.json({
      exito: true,
      ubicacion: {
        departamento: {
          id: departamento.id,
          nombre: departamento.nombre
        },
        ciudad: {
          id: ciudad.id,
          nombre: ciudad.nombre
        },
        nombreSectorSugerido: nombreSector
      }
    });
  } catch (error) {
    console.error('Error validating ubicacion:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al validar la ubicación'
    });
  }
};

module.exports = {
  getDepartamentos,
  getCiudadesByDepartamento,
  buscarCiudades,
  validarUbicacion,
  generarNombreSector
};
