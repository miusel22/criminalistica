const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const invitationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxLength: 120
  },
  role: {
    type: String,
    enum: ['administrator', 'editor', 'viewer'],
    default: 'viewer',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
invitationCodeSchema.index({ code: 1 });
invitationCodeSchema.index({ email: 1 });
invitationCodeSchema.index({ expiresAt: 1 });
invitationCodeSchema.index({ isUsed: 1 });

// Instance methods
invitationCodeSchema.methods.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

invitationCodeSchema.methods.markAsUsed = function(userId) {
  this.isUsed = true;
  this.usedBy = userId;
  this.usedAt = new Date();
  return this.save();
};

invitationCodeSchema.methods.markEmailSent = function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// Transform output
invitationCodeSchema.methods.toJSON = function() {
  const invitation = this.toObject();
  delete invitation.__v;
  return invitation;
};

module.exports = mongoose.model('InvitationCode', invitationCodeSchema);
