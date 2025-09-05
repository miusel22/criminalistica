const User = require('../models/sequelize/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class UsersController {
  // Obtener todos los usuarios (solo admin)
  async getAllUsers(req, res) {
    try {
      console.log('📋 Admin solicitando lista de usuarios');
      
      const { page = 1, limit = 10, search, role } = req.query;
      const offset = (page - 1) * limit;
      
      // Construir filtro de búsqueda
      let where = {};
      
      if (search) {
        where = {
          [Op.or]: [
            { username: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { fullName: { [Op.iLike]: `%${search}%` } }
          ]
        };
      }
      
      if (role && role !== 'all') {
        where.role = role;
      }
      
      // Obtener usuarios sin mostrar las contraseñas
      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        offset: parseInt(offset),
        limit: parseInt(limit)
      });
      
      console.log(`✅ Enviando ${users.length} usuarios de ${count} total`);
      
      res.json({
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(count / limit),
          total: count,
          hasNext: offset + users.length < count,
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
      
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
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
      
      const { nombre, apellidos, email, password, role = 'viewer', username } = req.body;
      
      // Crear un username si no se proporciona
      const finalUsername = username || email.split('@')[0];
      const fullName = `${nombre || ''} ${apellidos || ''}`.trim();
      
      // Verificar que el email no existe
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        return res.status(400).json({
          msg: 'Ya existe un usuario con ese email'
        });
      }

      // Verificar que el username no existe
      const existingUserByUsername = await User.findOne({ where: { username: finalUsername } });
      if (existingUserByUsername) {
        return res.status(400).json({
          msg: 'Ya existe un usuario con ese nombre de usuario'
        });
      }
      
      // Crear usuario (el password se hashea automáticamente en el hook beforeCreate)
      const newUser = await User.create({
        username: finalUsername,
        email,
        password,
        fullName,
        role,
        isActive: true
      });
      
      // Devolver usuario sin contraseña
      const userResponse = await User.findByPk(newUser.id, {
        attributes: { exclude: ['password'] }
      });
      
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
      
      const { nombre, apellidos, email, password, role, isActive, username } = req.body;
      
      // Buscar usuario
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          msg: 'Usuario no encontrado'
        });
      }
      
      // El email no se puede cambiar una vez creado el usuario
      // Verificar que el nuevo email no esté en uso por otro usuario (solo si se proporciona y es diferente)
      if (email && email !== user.email) {
        return res.status(400).json({
          msg: 'El email no se puede modificar una vez creada la cuenta'
        });
      }

      // Verificar que el nuevo username no esté en uso por otro usuario
      if (username && username !== user.username) {
        const usernameExists = await User.findOne({ 
          where: { 
            username,
            id: { [Op.ne]: id }
          } 
        });
        if (usernameExists) {
          return res.status(400).json({
            msg: 'Ya existe otro usuario con ese nombre de usuario'
          });
        }
      }
      
      // Prevenir que el admin se quite permisos a sí mismo
      if (req.user.id === id && role !== 'admin') {
        return res.status(400).json({
          msg: 'No puedes quitarte permisos de administrador a ti mismo'
        });
      }
      
      // Preparar datos de actualización
      const updateData = {};
      if (username !== undefined) updateData.username = username;
      // El email no se actualiza por seguridad
      // if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // Construir fullName si se proporcionan nombre y apellidos
      if (nombre !== undefined || apellidos !== undefined) {
        const currentName = user.fullName ? user.fullName.split(' ') : ['', ''];
        const newNombre = nombre !== undefined ? nombre : (currentName[0] || '');
        const newApellidos = apellidos !== undefined ? apellidos : (currentName.slice(1).join(' ') || '');
        updateData.fullName = `${newNombre} ${newApellidos}`.trim();
      }
      
      // Si se proporciona nueva contraseña, se manejará automáticamente en el hook beforeUpdate
      if (password) {
        updateData.password = password;
      }
      
      await user.update(updateData);
      
      // Obtener usuario actualizado sin contraseña
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
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
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          msg: 'Usuario no encontrado'
        });
      }
      
      // Prevenir que el admin se elimine a sí mismo
      if (req.user.id === id) {
        return res.status(400).json({
          msg: 'No puedes eliminar tu propia cuenta'
        });
      }
      
      // Verificar si es el único administrador
      if (user.role === 'admin') {
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount <= 1) {
          return res.status(400).json({
            msg: 'No se puede eliminar el último administrador del sistema'
          });
        }
      }
      
      await user.destroy();
      
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
      
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          msg: 'Usuario no encontrado'
        });
      }
      
      // Prevenir desactivar al admin actual
      if (req.user.id === id) {
        return res.status(400).json({
          msg: 'No puedes desactivar tu propia cuenta'
        });
      }
      
      await user.update({ isActive: !user.isActive });
      
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
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
      
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const inactiveUsers = await User.count({ where: { isActive: false } });
      const adminUsers = await User.count({ where: { role: 'admin' } });
      const regularUsers = await User.count({ where: { role: { [Op.ne]: 'admin' } } });
      
      // Usuarios creados en los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUsers = await User.count({
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo }
        }
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
