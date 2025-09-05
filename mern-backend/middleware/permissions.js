const User = require('../models/User');

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
 * Función helper para modificar queries para acceso global
 * Los viewers y editors pueden ver todos los registros, no solo los propios
 */
const buildGlobalQuery = (userRole, baseQuery = {}) => {
  // Si es admin, puede ver todo sin restricciones adicionales
  if (userRole === 'admin') {
    return baseQuery;
  }
  
  // Si es editor o viewer, puede ver todos los registros activos
  // Removemos la restricción de ownerId para permitir acceso global
  if (['editor', 'viewer'].includes(userRole)) {
    return baseQuery; // Sin filtrar por ownerId
  }
  
  // Fallback: si no es un rol reconocido, restringir a registros propios
  return {
    ...baseQuery,
    ownerId: null // Esto causará que no encuentre registros como medida de seguridad
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
