const express = require('express');
const router = express.Router();
const multer = require('multer');
const roboflowService = require('../services/roboflowService');

// Configure multer for handling multipart/form-data
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /ia/recognize - Analyze image with Roboflow
router.post('/recognize', upload.single('image'), async (req, res) => {
  try {
    console.log('=== Image Recognition Request ===');
    
    // Validate image file
    if (!req.file) {
      console.log('No image file provided in request');
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ninguna imagen' 
      });
    }

    console.log('Image received:');
    console.log('- Original name:', req.file.originalname);
    console.log('- MIME type:', req.file.mimetype);
    console.log('- Size:', req.file.size, 'bytes');
    console.log('- Buffer length:', req.file.buffer.length);

    // Validate image buffer
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.log('Empty image buffer received');
      return res.status(400).json({
        success: false,
        message: 'Imagen vacía o corrupta'
      });
    }

    console.log('Calling Roboflow service...');
    
    // Call Roboflow service with image buffer
    const result = await roboflowService.predictFromBuffer(req.file.buffer);
    
    console.log('Roboflow service result:', result.success ? 'SUCCESS' : 'FAILED');
    if (result.success) {
      console.log('Best prediction:', result.bestPrediction?.class, 
                  'confidence:', result.bestPrediction?.confidence);
    }
    
    // Return result to frontend
    res.json(result);
    
  } catch (error) {
    console.error('Error in /ia/recognize endpoint:', {
      message: error.message,
      stack: error.stack
    });
    
    // Return structured error response
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
});

// GET /ia/test - Test Roboflow service connection (DEFINITIVO)
router.get('/test', async (req, res) => {
  try {
    console.log('Testing Roboflow service connection...');
    
    // Test básico con imagen JPEG válida
    const basicTest = await roboflowService.testConnection();
    
    // Test alternativo con buffer si el básico falla
    let bufferTest = null;
    if (!basicTest.success && roboflowService.testConnectionWithFile) {
      console.log('Basic test failed, trying with buffer image...');
      bufferTest = await roboflowService.testConnectionWithFile();
    }
    
    // Determinar el resultado final
    const finalSuccess = basicTest.success || (bufferTest && bufferTest.success);
    
    // Preparar respuesta completa
    const response = {
      basicTest,
      bufferTest,
      overall: {
        success: finalSuccess,
        message: finalSuccess ? 'Conexión funcionando correctamente' : 'Error de conexión - revisar configuración',
        recommendation: !finalSuccess ? 'Verifica tu API key, proyecto y versión en Roboflow' : 'API lista para usar'
      },
      environment: {
        hasApiKey: !!process.env.ROBOFLOW_API_KEY,
        hasProject: !!process.env.ROBOFLOW_PROJECT,
        hasVersion: !!process.env.ROBOFLOW_VERSION,
        project: process.env.ROBOFLOW_PROJECT,
        version: process.env.ROBOFLOW_VERSION,
        constructedUrl: `https://detect.roboflow.com/${process.env.ROBOFLOW_PROJECT}/${process.env.ROBOFLOW_VERSION}`
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      suggestion: 'Verifica las variables de entorno de Roboflow'
    });
  }
});

// GET /ia/test-simple - Test simplificado que solo verifica configuración
router.get('/test-simple', (req, res) => {
  const config = {
    hasApiKey: !!process.env.ROBOFLOW_API_KEY,
    hasProject: !!process.env.ROBOFLOW_PROJECT,
    hasVersion: !!process.env.ROBOFLOW_VERSION,
    project: process.env.ROBOFLOW_PROJECT || 'NOT_SET',
    version: process.env.ROBOFLOW_VERSION || 'NOT_SET',
    workspace: process.env.ROBOFLOW_WORKSPACE || 'NOT_SET'
  };
  
  const allConfigured = config.hasApiKey && config.hasProject && config.hasVersion;
  
  res.json({
    success: allConfigured,
    message: allConfigured ? 'Configuración completa' : 'Faltan variables de entorno',
    config,
    missingVars: [
      !config.hasApiKey && 'ROBOFLOW_API_KEY',
      !config.hasProject && 'ROBOFLOW_PROJECT', 
      !config.hasVersion && 'ROBOFLOW_VERSION'
    ].filter(Boolean)
  });
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'La imagen es demasiado grande. Máximo 10MB.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Solo se permiten archivos de imagen.'
    });
  }
  
  console.error('Multer error:', error);
  res.status(500).json({
    success: false,
    message: 'Error procesando la imagen'
  });
});

module.exports = router;