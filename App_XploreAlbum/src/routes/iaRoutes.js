const express = require('express');
const router = express.Router();
const multer = require('multer');

const iaController = require('../controllers/iaController');

// Configuración de Multer para manejar la carga de imágenes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Ruta para reconocimiento de imágenes
router.post('/recognize', upload.single('image'), iaController.predictLandmark);

// Ruta para obtener información detallada de un lugar
router.get('/landmark/:id', iaController.getLandmarkInfo);

module.exports = router;