const jwt = require('jsonwebtoken');
const { User } = require('../models/sequelize');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        msg: 'Se requiere un token de acceso.',
        error_detail: 'No token provided or invalid format'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request (Sequelize syntax)
      const user = await User.findByPk(decoded.id || decoded.userId, {
        attributes: { exclude: ['password'] } // Excluir password en lugar de select
      });
      if (!user) {
        return res.status(401).json({ 
          msg: 'Token inválido o faltante.',
          error_detail: 'User not found'
        });
      }
      
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          msg: 'El token ha expirado. Por favor, inicie sesión de nuevo.'
        });
      } else {
        return res.status(401).json({ 
          msg: 'Token inválido o faltante.',
          error_detail: jwtError.message
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Server error during authentication',
      message: error.message 
    });
  }
};

// Optional auth middleware - continues without user if no token provided
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request (Sequelize syntax)
      const user = await User.findByPk(decoded.id || decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      req.user = user || null;
      next();
    } catch (jwtError) {
      // Invalid token, continue without user
      req.user = null;
      next();
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

// Middleware para verificar roles
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // El middleware de autenticación debe ejecutarse primero
      if (!req.user) {
        return res.status(401).json({
          msg: 'Acceso no autorizado. Debe iniciar sesión.'
        });
      }

      if (allowedRoles.includes(req.user.role)) {
        return next();
      } else {
        return res.status(403).json({
          msg: 'No tiene permisos suficientes para realizar esta acción.'
        });
      }
    } catch (error) {
      console.error('Role check middleware error:', error);
      return res.status(500).json({
        error: 'Error del servidor al verificar permisos',
        message: error.message
      });
    }
  };
};

module.exports = authMiddleware;
module.exports.optional = optionalAuthMiddleware;
module.exports.checkRole = checkRole;
