const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { param, validationResult } = require('express-validator');
const { User, Indiciado } = require('../models/sequelize');
const authMiddleware = require('../middleware/auth');
const { canRead, canWrite } = require('../middleware/permissions');

// Importar configuración de Cloudinary
const { documentStorage } = require('../config/cloudinary');

const router = express.Router();

// Helper function to get user (real user or default admin)
async function getEffectiveUser(req) {
  if (req.user) {
    return req.user;
  }
  
  // If no user, find the first admin user as default
  const defaultUser = await User.findOne({ 
    where: { role: 'admin' }
  });
  if (!defaultUser) {
    throw new Error('No hay usuarios administradores disponibles');
  }
  
  return defaultUser;
}

const fileFilter = (req, file, cb) => {
  // Permitir varios tipos de documentos
  const allowedTypes = [
    'application/pdf',
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Se aceptan: PDF, imágenes, Word, Excel, texto plano'), false);
  }
};

const upload = multer({
  storage: documentStorage, // Usar Cloudinary storage
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB por archivo (Cloudinary maneja archivos más grandes)
    files: 5 // Máximo 5 archivos por vez
  }
});

// POST /api/indiciados/:id/documentos - Subir documentos para un indiciado
router.post('/:id/documentos', 
  authMiddleware, 
  canWrite,
  upload.array('documentos', 5), // Permitir hasta 5 archivos
  [param('id').isUUID().withMessage('ID debe ser un UUID válido')],
  async (req, res) => {
    try {
      console.log('📎 Subiendo documentos para indiciado:', req.params.id);
      console.log('📁 Archivos recibidos:', req.files?.length || 0);

      // Validar parámetros
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Los archivos ya están en Cloudinary, no necesitamos limpiar
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          msg: 'No se proporcionaron archivos' 
        });
      }

      const effectiveUser = await getEffectiveUser(req);

      // Verificar que el indiciado existe y el usuario tiene acceso
      let whereCondition = {
        id: req.params.id,
        activo: true
      };

      if (effectiveUser.role !== 'admin') {
        whereCondition.ownerId = effectiveUser.id;
      }

      const indiciado = await Indiciado.findOne({
        where: whereCondition
      });

      if (!indiciado) {
        // Los archivos ya están en Cloudinary
        return res.status(404).json({
          msg: 'Indiciado no encontrado o no tienes permisos para modificarlo'
        });
      }

      // Procesar archivos subidos (Cloudinary)
      const nuevosDocumentos = req.files.map(file => ({
        id: uuidv4(),
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path, // Cloudinary URL
        url: file.path, // Cloudinary URL pública
        publicId: file.filename, // ID público de Cloudinary para eliminar
        fechaSubida: new Date(),
        descripcion: req.body.descripcion || '',
        tipo: req.body.tipo || 'General'
      }));

      // Obtener documentos existentes
      const documentosExistentes = indiciado.documentosRelacionados || [];
      
      // Combinar documentos existentes con nuevos
      const todosLosDocumentos = [...documentosExistentes, ...nuevosDocumentos];

      // FIX: Forzar detección de cambios en Sequelize para campos JSONB
      indiciado.changed('documentosRelacionados', true);
      
      // Actualizar el indiciado con los nuevos documentos
      await indiciado.update({
        documentosRelacionados: todosLosDocumentos
      });

      console.log('✅ Documentos subidos exitosamente:', nuevosDocumentos.length);

      res.status(201).json({
        msg: `${nuevosDocumentos.length} documento(s) subido(s) exitosamente`,
        documentos: nuevosDocumentos.map(doc => ({
          ...doc,
          url: doc.url // URL de Cloudinary
        }))
      });

    } catch (error) {
      // Los archivos ya están en Cloudinary, no necesitamos limpiar
      console.error('❌ Error subiendo documentos:', error);
      res.status(500).json({
        error: 'Error del servidor al subir documentos',
        message: error.message
      });
    }
  }
);

// GET /api/indiciados/:id/documentos - Obtener documentos de un indiciado
router.get('/:id/documentos', 
  authMiddleware,
  canRead,
  [param('id').isUUID().withMessage('ID debe ser un UUID válido')],
  async (req, res) => {
    try {
      console.log('📄 === OBTENIENDO DOCUMENTOS ===');
      console.log('📄 IndiciadoId:', req.params.id);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const effectiveUser = await getEffectiveUser(req);
      console.log('👤 Usuario efectivo:', effectiveUser.id, effectiveUser.role);

      let whereCondition = {
        id: req.params.id,
        activo: true
      };

      if (effectiveUser.role !== 'admin') {
        whereCondition.ownerId = effectiveUser.id;
      }

      console.log('🔍 Buscando indiciado con condición:', whereCondition);
      const indiciado = await Indiciado.findOne({
        where: whereCondition
      });

      if (!indiciado) {
        console.log('❌ Indiciado no encontrado');
        return res.status(404).json({
          msg: 'Indiciado no encontrado'
        });
      }

      console.log('✅ Indiciado encontrado');
      const documentosRaw = indiciado.documentosRelacionados || [];
      console.log('📄 Documentos en BD (raw):', documentosRaw.length);
      console.log('📄 IDs en BD:', documentosRaw.map(d => d.id));
      
      const documentos = indiciado.getDocumentosRelacionadosUrls();
      console.log('📄 Documentos con URLs:', documentos.length);
      console.log('📄 IDs con URLs:', documentos.map(d => d.id));

      console.log('✅ Devolviendo', documentos.length, 'documentos al frontend');
      res.json({
        documentos
      });

    } catch (error) {
      console.error('❌ Error obteniendo documentos:', error);
      res.status(500).json({
        error: 'Error del servidor al obtener documentos',
        message: error.message
      });
    }
  }
);

// DELETE /api/indiciados/:id/documentos/:documentoId - Eliminar un documento específico
router.delete('/:id/documentos/:documentoId',
  authMiddleware,
  canWrite,
  [
    param('id').isUUID().withMessage('ID del indiciado debe ser un UUID válido'),
    param('documentoId').notEmpty().withMessage('ID del documento es requerido')
  ],
  async (req, res) => {
    try {
      console.log('🗑️ === ELIMINANDO DOCUMENTO ===');
      console.log('🗑️ IndiciadoId:', req.params.id);
      console.log('🗑️ DocumentoId:', req.params.documentoId);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Errores de validación:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const effectiveUser = await getEffectiveUser(req);
      console.log('👤 Usuario efectivo:', effectiveUser.id, effectiveUser.role);

      let whereCondition = {
        id: req.params.id,
        activo: true
      };

      if (effectiveUser.role !== 'admin') {
        whereCondition.ownerId = effectiveUser.id;
      }

      console.log('🔍 Buscando indiciado con condición:', whereCondition);
      const indiciado = await Indiciado.findOne({
        where: whereCondition
      });

      if (!indiciado) {
        console.log('❌ Indiciado no encontrado');
        return res.status(404).json({
          msg: 'Indiciado no encontrado'
        });
      }

      console.log('✅ Indiciado encontrado');
      const documentos = indiciado.documentosRelacionados || [];
      console.log('📄 Documentos actuales:', documentos.length);
      console.log('📄 IDs de documentos:', documentos.map(d => d.id));
      
      const documentoIndex = documentos.findIndex(doc => doc.id === req.params.documentoId);
      console.log('🔍 Índice del documento a eliminar:', documentoIndex);

      if (documentoIndex === -1) {
        console.log('❌ Documento no encontrado en el array');
        return res.status(404).json({
          msg: 'Documento no encontrado'
        });
      }

      const documento = documentos[documentoIndex];
      console.log('📎 Documento a eliminar:', { id: documento.id, filename: documento.filename });

      // Eliminar archivo físico
      if (documento.filename) {
        const filePath = path.join(__dirname, '../uploads/documentos', documento.filename);
        console.log('🗂️ Eliminando archivo físico:', filePath);
        fs.unlink(filePath).catch(err => {
          console.error('⚠️ Error eliminando archivo físico:', err.message);
        });
      }

      // Remover documento del array
      console.log('📝 Removiendo documento del array...');
      documentos.splice(documentoIndex, 1);
      console.log('📄 Documentos después de eliminar:', documentos.length);

      // Actualizar indiciado
      console.log('💾 Actualizando base de datos...');
      
      // FIX: Forzar detección de cambios en Sequelize para campos JSONB
      indiciado.changed('documentosRelacionados', true);
      
      await indiciado.update({
        documentosRelacionados: documentos
      });

      console.log('✅ Documento eliminado exitosamente del backend');
      res.json({
        msg: 'Documento eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error eliminando documento:', error);
      res.status(500).json({
        error: 'Error del servidor al eliminar documento',
        message: error.message
      });
    }
  }
);

module.exports = router;
