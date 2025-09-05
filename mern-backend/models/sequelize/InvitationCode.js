const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../../config/database');

const InvitationCode = sequelize.define('InvitationCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
    defaultValue: () => uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: {
      isEmail: true,
      len: [1, 120]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'editor', 'viewer'),
    allowNull: false,
    defaultValue: 'viewer'
  },
  invitedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'invited_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_used'
  },
  usedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'used_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'used_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    field: 'expires_at'
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'email_sent'
  },
  emailSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'email_sent_at'
  }
}, {
  tableName: 'invitation_codes',
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['email'] },
    { fields: ['expires_at'] },
    { fields: ['is_used'] },
    { fields: ['invited_by'] },
    { fields: ['used_by'] }
  ]
});

// Métodos de instancia
InvitationCode.prototype.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

InvitationCode.prototype.markAsUsed = async function(userId) {
  this.isUsed = true;
  this.usedBy = userId;
  this.usedAt = new Date();
  return this.save();
};

InvitationCode.prototype.markEmailSent = async function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// Método para obtener el estado de la invitación
InvitationCode.prototype.getStatus = function() {
  if (this.isUsed) return 'used';
  if (this.expiresAt <= new Date()) return 'expired';
  return 'pending';
};

// Transform output
InvitationCode.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = InvitationCode;
