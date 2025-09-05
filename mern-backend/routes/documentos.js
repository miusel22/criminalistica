const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { param, validationResult } = require('express-validator');
const Documento = require('../models/Documento');
const Indiciado = require('../models/Indiciado');
const Carpeta = require('../models/Carpeta');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para subida de documentos
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentsDir = path.join(__dirname, '../uploads/documentos');
    fs.ensureDirSync(documentsDir);
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const uniqueName = uuidv4() + '_' + name + ext;
    cb(null, uniqueName);
  }
});

const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten documentos (PDF, DOC, DOCX, TXT, XLS, XLSX)'), false);
  }
};

const documentUpload = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
    files: 10 // máximo 10 archivos por vez
  }
});

// Helper function to check if user owns the indiciado
async function checkIndiciadoOwnership(indiciadoId, userId) {
  const indiciado = await Indiciado.findById(indiciadoId).populate('carpetaId');
  if (!indiciado || indiciado.carpetaId.ownerId.toString() !== userId.toString()) {
    return null;
  }
  return indiciado;
}

// Subir documentos para un indiciado
router.post('/indiciado/:id', authMiddleware, documentUpload.array('documentos'), [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Limpiar archivos subidos en caso de error de validación
      if (req.files) {
        req.files.forEach(file => {
          fs.unlink(file.path).catch(console.error);
        });
      }
      return res.status(400).json({
        msg: 'ID inválido',
        details: errors.array()
      });
    }

    const indiciadoId = req.params.id;

    // Verificar que el indiciado existe y pertenece al usuario
    const indiciado = await checkIndiciadoOwnership(indiciadoId, req.user._id);
    if (!indiciado) {
      if (req.files) {
        req.files.forEach(file => {
          fs.unlink(file.path).catch(console.error);
        });
      }
      return res.status(404).json({
        msg: 'Indiciado no encontrado o no tienes permiso'
      });
    }

    // Verificar que se subieron archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        msg: 'No se encontraron archivos en la solicitud'
      });
    }

    const uploadedDocs = [];

    // Procesar cada archivo
    for (const file of req.files) {
      try {
        const nuevoDocumento = new Documento({
          filename: file.filename,
          originalFilename: file.originalname,
          indiciadoId: indiciadoId
        });

        await nuevoDocumento.save();
        uploadedDocs.push(nuevoDocumento.toDict());
      } catch (error) {
        console.error('Error saving document:', error);
        // Eliminar el archivo físico si no se pudo guardar en la BD
        fs.unlink(file.path).catch(console.error);
      }
    }

    if (uploadedDocs.length === 0) {
      return res.status(500).json({
        msg: 'Error al procesar los documentos'
      });
    }

    res.status(201).json({
      msg: 'Documentos subidos exitosamente',
      documentos: uploadedDocs
    });
  } catch (error) {
    // Limpiar archivos subidos en caso de error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path).catch(console.error);
      });
    }
    console.error('Error uploading documents:', error);
    res.status(500).json({
      error: 'Server error uploading documents',
      message: error.message
    });
  }
});

// Eliminar documento
router.delete('/:id', authMiddleware, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'ID inválido',
        details: errors.array()
      });
    }

    const documentoId = req.params.id;

    // Buscar el documento y verificar permisos
    const documento = await Documento.findById(documentoId).populate({
      path: 'indiciadoId',
      populate: {
        path: 'carpetaId',
        model: 'Carpeta'
      }
    });

    if (!documento) {
      return res.status(404).json({
        msg: 'Documento no encontrado'
      });
    }

    // Verificar que el usuario es propietario
    if (documento.indiciadoId.carpetaId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        msg: 'Documento no encontrado o no tienes permiso'
      });
    }

    // Eliminar archivo físico
    const filePath = path.join(__dirname, '../uploads/documentos', documento.filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Error al eliminar el archivo físico:', fileError);
      // No retornamos error aquí porque queremos eliminar el registro de la BD de todos modos
    }

    // Eliminar registro de la base de datos
    await Documento.findByIdAndDelete(documentoId);

    res.json({
      msg: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      error: 'Server error deleting document',
      message: error.message
    });
  }
});

// Obtener documentos de un indiciado
router.get('/indiciado/:id', authMiddleware, [
  param('id').isMongoId().withMessage('ID debe ser un ObjectId válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'ID inválido',
        details: errors.array()
      });
    }

    const indiciadoId = req.params.id;

    // Verificar que el indiciado existe y pertenece al usuario
    const indiciado = await checkIndiciadoOwnership(indiciadoId, req.user._id);
    if (!indiciado) {
      return res.status(404).json({
        msg: 'Indiciado no encontrado o no tienes permiso'
      });
    }

    // Obtener documentos
    const documentos = await Documento.find({ indiciadoId }).sort({ uploadDate: -1 });
    
    const documentosDict = documentos.map(doc => doc.toDict());

    res.json({
      documentos: documentosDict
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      error: 'Server error fetching documents',
      message: error.message
    });
  }
});

module.exports = router;
