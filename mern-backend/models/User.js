const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define user roles enum
const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: 80
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxLength: 120
  },
  fullName: {
    type: String,
    trim: true,
    maxLength: 100
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.VIEWER,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for carpetas
userSchema.virtual('carpetas', {
  ref: 'Carpeta',
  localField: '_id',
  foreignField: 'ownerId'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.checkPassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Instance method to set password
userSchema.methods.setPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

// Role checking methods
userSchema.methods.isAdmin = function() {
  return this.role === USER_ROLES.ADMIN;
};

userSchema.methods.isAdministrator = function() {
  return this.role === USER_ROLES.ADMIN;
};

userSchema.methods.isEditor = function() {
  return this.role === USER_ROLES.EDITOR;
};

userSchema.methods.isViewer = function() {
  return this.role === USER_ROLES.VIEWER;
};

userSchema.methods.canSendInvitations = function() {
  return this.role === USER_ROLES.ADMIN;
};

// Transform output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);
User.USER_ROLES = USER_ROLES;

module.exports = User;
