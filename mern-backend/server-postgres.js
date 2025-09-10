const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Import PostgreSQL configuration and models
const { testConnection, syncDatabase } = require('./models/sequelize');

// Import routes
const authRoutes = require('./routes/auth');
const invitationRoutes = require('./routes/invitations-postgres');
const usersRoutes = require('./routes/users-postgres');
// const carpetasRoutes = require('./routes/carpetas'); // Temporalmente deshabilitado - usa MongoDB
const indiciadosRoutes = require('./routes/indiciadosPostgres');
const indiciadoDocumentosRoutes = require('./routes/indiciadoDocumentos');
const vehiculoDocumentosRoutes = require('./routes/vehiculoDocumentos');
// const documentosRoutes = require('./routes/documentos'); // Temporalmente deshabilitado - usa MongoDB
const sectoresRoutes = require('./routes/sectores');
const subsectoresRoutes = require('./routes/subsectores');
const vehiculosRoutes = require('./routes/vehiculos-simple');
const colombiaRoutes = require('./routes/colombia');

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Debug middleware - Log todas las peticiones
app.use((req, res, next) => {
  console.log(`\n🌐 ${req.method} ${req.originalUrl}`);
  console.log('📋 Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? '[PRESENTE]' : '[AUSENTE]'
  });
  if (Object.keys(req.body || {}).length > 0) {
    console.log('📦 Body:', req.body);
  }
  if (Object.keys(req.params || {}).length > 0) {
    console.log('🔗 Params:', req.params);
  }
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(path.join(uploadsDir, 'documentos'));
fs.ensureDirSync(path.join(uploadsDir, 'vehiculos'));
fs.ensureDirSync(path.join(uploadsDir, 'vehiculos', 'documentos'));

// Static file serving
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
}));

console.log('📂 Sirviendo archivos estáticos desde:', uploadsDir);
console.log('🌐 Ruta de uploads disponible en: /uploads');

// Debug route para verificar archivos
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

// Database connection and sync
const initializeDatabase = async () => {
  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a PostgreSQL');
    }
    
    // Sync database (crear tablas si no existen)
    await syncDatabase(false); // force: false para no eliminar datos existentes
    
    console.log('🎉 PostgreSQL inicializado exitosamente');
  } catch (error) {
    console.error('💥 Error inicializando PostgreSQL:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/users', usersRoutes);
// app.use('/api/carpetas', carpetasRoutes); // Temporalmente deshabilitado - usa MongoDB
app.use('/api/indiciados', indiciadosRoutes);
app.use('/api/indiciados', indiciadoDocumentosRoutes);
app.use('/api/vehiculos', vehiculoDocumentosRoutes);
// app.use('/api/documentos', documentosRoutes); // Temporalmente deshabilitado - usa MongoDB
app.use('/api/sectores', sectoresRoutes);
app.use('/api/subsectores', subsectoresRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/colombia', colombiaRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'PostgreSQL'
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

const PORT = process.env.POSTGRES_SERVER_PORT || 5004;

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🐘 Database: PostgreSQL`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
