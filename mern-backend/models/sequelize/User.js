const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  fullName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'full_name'
  },
  role: {
    type: DataTypes.ENUM('admin', 'editor', 'viewer'),
    allowNull: false,
    defaultValue: 'viewer'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  // Campos adicionales del modelo original
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // Configuración de notificaciones
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_notifications'
  },
  // Metadatos
  invitedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'invited_by'
  },
  invitationAcceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'invitation_accepted_at'
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['username'] },
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['is_active'] }
  ],
  hooks: {
    // Hash password before saving
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Métodos de instancia
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save();
};

User.prototype.toSafeObject = function() {
  const user = this.toJSON();
  delete user.password;
  return user;
};

// Métodos estáticos
User.findByCredentials = async function(username, password) {
  // Buscar por username o email
  const user = await this.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { username },
        { email: username }
      ],
      isActive: true
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Contraseña incorrecta');
  }

  return user;
};

User.createWithHashedPassword = async function(userData) {
  return this.create(userData);
};

// Método para verificar si es admin
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// Método para verificar si puede editar
User.prototype.canEdit = function() {
  return ['admin', 'editor'].includes(this.role);
};

// Método para verificar si puede leer
User.prototype.canRead = function() {
  return ['admin', 'editor', 'viewer'].includes(this.role);
};

module.exports = User;
