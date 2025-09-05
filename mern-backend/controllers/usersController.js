const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

class UsersController {
  // Obtener todos los usuarios (solo admin)
  async getAllUsers(req, res) {
    try {
      console.log('📋 Admin solicitando lista de usuarios');
      
      const { page = 1, limit = 10, search, role } = req.query;
      const skip = (page - 1) * limit;
      
      // Construir filtro de búsqueda
      let filter = {};
      
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter = {
          $or: [
            { nombre: searchRegex },
            { email: searchRegex },
            { apellidos: searchRegex }
          ]
        };
      }
      
      if (role && role !== 'all') {
        filter.role = role;
      }
      
      // Obtener usuarios sin mostrar las contraseñas
      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await User.countDocuments(filter);
      
      console.log(`✅ Enviando ${users.length} usuarios de ${total} total`);
      
      res.json({
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: skip + users.length < total,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      res.status(500).json({
        msg: 'Error del servidor al obtener usuarios',
        error: error.message
      });
    }
  }
  
  // Obtener un usuario por ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      console.log(`🔍 Buscando usuario con ID: ${id}`);
      
      const user = await User.findById(id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          msg: 'Usuario no encontrado'
        });
      }
      
      console.log(`✅ Usuario encontrado: ${user.email}`);
      res.json(user);
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      res.status(500).json({
        msg: 'Error del servidor al obtener usuario',
        error: error.message
      });
    }
  }
  
  // Crear nuevo usuario (solo admin)
  async createUser(req, res) {
    try {
      console.log('🆕 Admin creando nuevo usuario');
      
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          msg: 'Error en los datos proporcionados',
          errors: errors.array()
        });
      }
      
      const { nombre, apellidos, email, password, role = 'user' } = req.body;
      
      // Verificar que el email no existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          msg: 'Ya existe un usuario con ese email'
        });
      }
      
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Crear usuario
      const newUser = new User({
        nombre,
        apellidos,
        email,
        password: hashedPassword,
        role,
        isActive: true
      });
      
      await newUser.save();
      
      // Devolver usuario sin contraseña
      const userResponse = await User.findById(newUser._id).select('-password');
      
      console.log(`✅ Usuario creado exitosamente: ${email}`);
      res.status(201).json({
        msg: 'Usuario creado exitosamente',
        user: userResponse
      });
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      res.status(500).json({
        msg: 'Error del servidor al crear usuario',
        error: error.message
      });
    }
  }
  
  // Actualizar usuario (solo admin)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      console.log(`🔄 Admin actualizando usuario: ${id}`);
      
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          msg: 'Error en los datos proporcionados',
          errors: errors.array()
        });
      }
      
      const { nombre, apellidos, email, password, role, isActive } = req.body;
      
      // Buscar usuario
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          msg: 'Usuario no encontrado'
        });
      }
      
      // Verificar que el nuevo email no esté en uso por otro usuario
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: id } });
        if (emailExists) {
          return res.status(400).json({
            msg: 'Ya existe otro usuario con ese email'
          });
        }
      }
      
      // Prevenir que el admin se quite permisos a sí mismo
      if (req.user._id.toString() === id && role !== 'admin') {
        return res.status(400).json({
          msg: 'No puedes quitarte permisos de administrador a ti mismo'
        });
      }
      
      // Actualizar campos
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (apellidos !== undefined) updateData.apellidos = apellidos;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // Si se proporciona nueva contraseña, encriptarla
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
      
      updateData.updatedAt = new Date();
      
      const updatedUser = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
      
      console.log(`✅ Usuario actualizado exitosamente: ${updatedUser.email}`);
      res.json({
        msg: 'Usuario actualizado exitosamente',
        user: updatedUser
      });
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      res.status(500).json({
        msg: 'Error del servidor al actualizar usuario',
        error: error.message
      });
    }
  }
  
  // Eliminar usuario (solo admin)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Admin eliminando usuario: ${id}`);
      
      // Buscar usuario
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          msg: 'Usuario no encontrado'
        });
      }
      
      // Prevenir que el admin se elimine a sí mismo
      if (req.user._id.toString() === id) {
        return res.status(400).json({
          msg: 'No puedes eliminar tu propia cuenta'
        });
      }
      
      // Verificar si es el único administrador
      if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({
            msg: 'No se puede eliminar el último administrador del sistema'
          });
        }
      }
      
      await User.findByIdAndDelete(id);
      
      console.log(`✅ Usuario eliminado exitosamente: ${user.email}`);
      res.json({
        msg: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      res.status(500).json({
        msg: 'Error del servidor al eliminar usuario',
        error: error.message
      });
    }
  }
  
  // Cambiar estado activo/inactivo
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      console.log(`🔄 Admin cambiando estado del usuario: ${id}`);
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          msg: 'Usuario no encontrado'
        });
      }
      
      // Prevenir desactivar al admin actual
      if (req.user._id.toString() === id) {
        return res.status(400).json({
          msg: 'No puedes desactivar tu propia cuenta'
        });
      }
      
      user.isActive = !user.isActive;
      await user.save();
      
      const updatedUser = await User.findById(id).select('-password');
      
      console.log(`✅ Estado del usuario cambiado: ${user.email} - ${user.isActive ? 'Activo' : 'Inactivo'}`);
      res.json({
        msg: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
        user: updatedUser
      });
    } catch (error) {
      console.error('❌ Error cambiando estado del usuario:', error);
      res.status(500).json({
        msg: 'Error del servidor al cambiar estado del usuario',
        error: error.message
      });
    }
  }
  
  // Obtener estadísticas de usuarios
  async getUserStats(req, res) {
    try {
      console.log('📊 Admin solicitando estadísticas de usuarios');
      
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const inactiveUsers = await User.countDocuments({ isActive: false });
      const adminUsers = await User.countDocuments({ role: 'admin' });
      const regularUsers = await User.countDocuments({ role: 'user' });
      
      // Usuarios creados en los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });
      
      const stats = {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: adminUsers,
        regularUsers: regularUsers,
        recent: recentUsers
      };
      
      console.log('✅ Estadísticas enviadas:', stats);
      res.json(stats);
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        msg: 'Error del servidor al obtener estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new UsersController();
