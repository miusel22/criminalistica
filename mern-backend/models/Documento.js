const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  originalFilename: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  indiciadoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indiciado',
    required: true
  }
}, {
  timestamps: true
});

// Instance method to get download URL
documentoSchema.methods.getDownloadUrl = function() {
  return `/uploads/documentos/${this.filename}`;
};

// Instance method to convert to dictionary format similar to Flask
documentoSchema.methods.toDict = function() {
  return {
    id: this._id,
    filename: this.originalFilename,
    upload_date: this.uploadDate.toISOString(),
    url: this.getDownloadUrl()
  };
};

// Transform output
documentoSchema.methods.toJSON = function() {
  const documento = this.toObject();
  delete documento.__v;
  return documento;
};

module.exports = mongoose.model('Documento', documentoSchema);
