const { User } = require('../models/sequelize');

/**
 * Middleware de permisos para el sistema de roles
 * - viewer: Solo lectura global a todos los registros
 * - editor: Lectura y escritura global a todos los registros  
 * - admin: Todos los permisos (hereda de editor)
 */

/**
 * Middleware para operaciones de solo lectura
 * Permite: viewer, editor, admin
 */
const canRead = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        msg: 'Acceso no autorizado. Debe iniciar sesión.'
      });
    }

    // Todos los roles pueden leer
    if (['viewer', 'editor', 'admin'].includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      msg: 'No tiene permisos para acceder a esta información.'
    });
  } catch (error) {
    console.error('Read permission middleware error:', error);
    return res.status(500).json({
      error: 'Error del servidor al verificar permisos de lectura',
      message: error.message
    });
  }
};

/**
 * Middleware para operaciones de escritura (crear, actualizar, eliminar)
 * Permite: editor, admin
 */
const canWrite = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        msg: 'Acceso no autorizado. Debe iniciar sesión.'
      });
    }

    // Solo editor y admin pueden escribir
    if (['editor', 'admin'].includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      msg: 'No tiene permisos para realizar esta acción. Se requieren permisos de editor.'
    });
  } catch (error) {
    console.error('Write permission middleware error:', error);
    return res.status(500).json({
      error: 'Error del servidor al verificar permisos de escritura',
      message: error.message
    });
  }
};

/**
 * Middleware para operaciones administrativas (solo admin)
 * Permite: admin
 */
const canAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        msg: 'Acceso no autorizado. Debe iniciar sesión.'
      });
    }

    // Solo admin puede realizar operaciones administrativas
    if (req.user.role === 'admin') {
      return next();
    }

    return res.status(403).json({
      msg: 'No tiene permisos para realizar esta acción. Se requieren permisos de administrador.'
    });
  } catch (error) {
    console.error('Admin permission middleware error:', error);
    return res.status(500).json({
      error: 'Error del servidor al verificar permisos administrativos',
      message: error.message
    });
  }
};

/**
 * Función helper para construir consultas Sequelize con acceso global
 * Los viewers, editors y admins pueden ver todos los registros
 */
const buildGlobalQuery = (userRole, baseQuery = {}) => {
  // Para PostgreSQL/Sequelize, simplemente retornamos la consulta base
  // ya que el control de acceso se maneja a nivel de middleware
  if (['admin', 'editor', 'viewer'].includes(userRole)) {
    return baseQuery; // Acceso global - sin filtrar por ownerId
  }
  
  // Fallback: si no es un rol reconocido, no permitir acceso
  return {
    ...baseQuery,
    id: null // Esto causará que no encuentre registros como medida de seguridad
  };
};

/**
 * Función helper para validar si un usuario puede modificar un registro específico
 * Para editor/admin: puede modificar cualquier registro
 * Para viewer: no puede modificar nada
 */
const canModifyRecord = (userRole, recordOwnerId = null, userId = null) => {
  // Admin puede modificar cualquier cosa
  if (userRole === 'admin') {
    return true;
  }
  
  // Editor puede modificar cualquier registro
  if (userRole === 'editor') {
    return true;
  }
  
  // Viewer no puede modificar nada
  if (userRole === 'viewer') {
    return false;
  }
  
  return false;
};

module.exports = {
  canRead,
  canWrite,
  canAdmin,
  buildGlobalQuery,
  canModifyRecord
};
