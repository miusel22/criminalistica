const jwt = require('jsonwebtoken');
const User = require('../models/sequelize/User');

// Middleware para verificar que el usuario es administrador (PostgreSQL/Sequelize version)
const requireAdmin = async (req, res, next) => {
  try {
    // Verificar que hay token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        msg: 'No token, autorización denegada'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        msg: 'Token no válido'
      });
    }

    // Verificar que el usuario está activo
    if (!user.isActive) {
      return res.status(403).json({
        msg: 'Cuenta desactivada. Contacta al administrador.'
      });
    }

    // Verificar que el usuario es administrador
    if (user.role !== 'admin') {
      return res.status(403).json({
        msg: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware requireAdmin:', error);
    res.status(401).json({
      msg: 'Token no válido'
    });
  }
};

module.exports = { requireAdmin };
