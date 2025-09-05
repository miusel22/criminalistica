const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const invitationRoutes = require('./routes/invitations');
const carpetasRoutes = require('./routes/carpetas');
const indiciadosRoutes = require('./routes/indiciados');
const indiciadoDocumentosRoutes = require('./routes/indiciadoDocumentos');
const documentosRoutes = require('./routes/documentos');
const sectoresRoutes = require('./routes/sectores');
const vehiculosRoutes = require('./routes/vehiculos');
const colombiaRoutes = require('./routes/colombia');
const usersRoutes = require('./routes/users');

const app = express();

// CORS - Configurar ANTES de helmet para evitar conflictos
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Security middleware - Configurar después de CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http://localhost:3000", "http://localhost:5001"],
    },
  },
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(path.join(uploadsDir, 'documentos'));
fs.ensureDirSync(path.join(uploadsDir, 'vehiculos'));

// Static file serving - ANTES del rate limiting para excluir archivos estáticos
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
}));

// Rate limiting - SOLO para rutas API, NO para archivos estáticos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => {
    // Excluir archivos estáticos del rate limiting
    return req.path.startsWith('/uploads/');
  }
});
app.use('/api', limiter); // Aplicar SOLO a rutas API

console.log('📂 Sirviendo archivos estáticos desde:', uploadsDir);
console.log('🌐 Ruta de uploads disponible en: /uploads');

// Ruta de debug para verificar archivos
app.get('/debug/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      directory: uploadsDir,
      files: files.filter(f => !f.startsWith('.')),
      total: files.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/criminalistica_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/carpetas', carpetasRoutes);
app.use('/api/indiciados', indiciadosRoutes);
app.use('/api/indiciados', indiciadoDocumentosRoutes); // Rutas de documentos de indiciados
app.use('/api/documentos', documentosRoutes);
app.use('/api/sectores', sectoresRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/colombia', colombiaRoutes);
app.use('/api/users', usersRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
