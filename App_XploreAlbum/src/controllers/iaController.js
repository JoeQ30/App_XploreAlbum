const roboflowService = require('../services/roboflowService');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const predictLandmark = async (req, res, next) => {
  try {
    console.log('Starting image prediction...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log(`Processing image: ${req.file.size} bytes, type: ${req.file.mimetype}`);

    // 1. Validate image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'El archivo debe ser una imagen válida' });
    }

    if (req.file.size > 5 * 1024 * 1024) { // 5MB limit
      return res.status(413).json({ error: 'La imagen es demasiado grande (máximo 5MB)' });
    }

    const roboflowService = require('./services/roboflowService.js');

    async function testRoboflow() {
      const result = await roboflowService.testConnection();
      console.log('Test result:', result);
    }

    testRoboflow();
    

    // 2. Process image with Roboflow
    console.log('Calling Roboflow service...');
    const prediction = await roboflowService.predictFromBuffer(req.file.buffer);
    
    if (!prediction.success) {
      console.log('Roboflow prediction failed:', prediction.message);
      return res.status(404).json({ 
        error: prediction.message || 'No se pudo identificar el lugar en la imagen'
      });
    }

    console.log(`Prediction successful: ${prediction.bestPrediction.class} (${(prediction.bestPrediction.confidence * 100).toFixed(1)}%)`);

    // 3. Search for place in database with improved matching
    const searchTerms = [
      prediction.bestPrediction.class,
      prediction.bestPrediction.class.replace(/[-_]/g, ' '),
      prediction.bestPrediction.class.toLowerCase(),
      prediction.bestPrediction.class.toUpperCase()
    ];

    let lugar = null;
    for (const term of searchTerms) {
      const result = await db.db.query(
        `SELECT * FROM lugares 
         WHERE LOWER(nombre) LIKE LOWER($1) 
         OR LOWER(nombre) LIKE LOWER($2)
         LIMIT 1`,
        [`%${term}%`, `%${term.replace(/\s+/g, '%')}%`]
      );
      
      if (result.rows[0]) {
        lugar = result.rows[0];
        break;
      }
    }

    if (!lugar) {
      console.log(`Place not found in database for: ${prediction.bestPrediction.class}`);
      return res.status(404).json({ 
        error: `Lugar identificado como "${prediction.bestPrediction.class}" pero no está disponible en tu región. ¿Quizás tomaste la foto en otro lugar?`,
        prediction: prediction.bestPrediction,
        detectedClass: prediction.bestPrediction.class
      });
    }

    console.log(`Place found in database: ${lugar.nombre}`);

    // 4. Prepare successful response
    const responseData = {
      success: true,
      lugar: lugar,
      prediction: prediction.bestPrediction,
      message: `¡Lugar identificado: ${lugar.nombre}!`
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error in predictLandmark:', error);
    
    // Handle specific error types
    if (error.message.includes('Límite de API excedido')) {
      return res.status(503).json({ 
        error: 'Servicio temporalmente no disponible. Intenta de nuevo más tarde.' 
      });
    } else if (error.message.includes('Timeout')) {
      return res.status(408).json({ 
        error: 'La imagen tardó demasiado en procesarse. Intenta con una imagen más pequeña.' 
      });
    } else if (error.message.includes('no válida')) {
      return res.status(400).json({ 
        error: 'Imagen no válida. Asegúrate de que sea una foto clara del lugar.' 
      });
    }
    
    next(error);
  }
};

const saveCollection = async (req, res, next) => {
  try {
    console.log('Starting collection save...');
    
    const { lugarId, imageBase64 } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!lugarId) {
      return res.status(400).json({ error: 'ID de lugar requerido' });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    console.log(`Saving collection for user ${req.user.id_usuario}, place ${lugarId}`);

    // 1. Verify place exists
    const lugar = await db.db.query(
      'SELECT * FROM lugares WHERE id_lugar = $1',
      [lugarId]
    );

    if (!lugar.rows[0]) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    // 2. Check if user already has this collectible
    const existingCollection = await db.db.query(
      `SELECT f.* FROM fotos f 
       WHERE f.id_usuario = $1 AND f.id_lugar = $2 AND f.id_estado = 1
       LIMIT 1`,
      [req.user.id_usuario, lugar.rows[0].id_lugar]
    );

    if (existingCollection.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Ya tienes este coleccionable desbloqueado',
        alreadyUnlocked: true
      });
    }

    // 3. Save image to filesystem
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${uuidv4()}.jpg`;
    const filepath = path.join(uploadDir, filename);
    
    try {
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`Image saved: ${filename}`);
    } catch (imageError) {
      console.error('Error saving image:', imageError);
      return res.status(400).json({ error: 'Error al procesar la imagen' });
    }

    // 4. Insert photo record in database
    const fotoInsert = await db.db.query(
      `INSERT INTO fotos (
        ruta_imagen,
        id_usuario,
        id_lugar,
        id_estado,
        fecha_subida,
        propuesta_album_oficial
      ) VALUES ($1, $2, $3, 1, NOW(), TRUE) RETURNING *`,
      [filename, req.user.id_usuario, lugar.rows[0].id_lugar]
    );

    console.log(`Photo record created with ID: ${fotoInsert.rows[0].id_foto}`);

    // 5. Check and unlock collectibles for this place
    let coleccionablesDesbloqueados = [];
    const coleccionables = await db.db.query(
      `SELECT c.* FROM coleccionables c
       LEFT JOIN usuario_coleccionables uc ON c.id_coleccionable = uc.id_coleccionable AND uc.id_usuario = $1
       WHERE c.id_lugar = $2 AND uc.id_usuario IS NULL`,
      [req.user.id_usuario, lugar.rows[0].id_lugar]
    );

    console.log(`Found ${coleccionables.rows.length} new collectibles to unlock`);

    if (coleccionables.rows.length > 0) {
      for (const coleccionable of coleccionables.rows) {
        await db.db.query(
          `INSERT INTO usuario_coleccionables (id_usuario, id_coleccionable, fecha_desbloqueo)
           VALUES ($1, $2, NOW())`,
          [req.user.id_usuario, coleccionable.id_coleccionable]
        );
      }
      coleccionablesDesbloqueados = coleccionables.rows;
    }

    console.log('Collection save completed successfully');

    res.json({
      success: true,
      foto: fotoInsert.rows[0],
      nuevosColeccionables: coleccionablesDesbloqueados,
      lugar: lugar.rows[0],
      message: `¡Coleccionable de ${lugar.rows[0].nombre} desbloqueado!`
    });

  } catch (error) {
    console.error('Error in saveCollection:', error);
    
    // Clean up file if it was created but database operation failed
    if (req.body.imageBase64) {
      try {
        const uploadDir = path.join(__dirname, '../../uploads');
        const filename = `${uuidv4()}.jpg`;
        const filepath = path.join(uploadDir, filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    next(error);
  }
};

const getLandmarkInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log(`Getting landmark info for ID: ${id}`);
    
    const lugar = await db.db.query(
      `SELECT l.*, c.nombre as categoria_nombre 
       FROM lugares l
       LEFT JOIN categorias c ON l.id_categoria = c.id_categoria
       WHERE l.id_lugar = $1`,
      [id]
    );

    if (!lugar.rows[0]) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    // Get additional info in parallel for better performance
    const [horarios, datosHistoricos, fotos] = await Promise.all([
      db.db.query(
        'SELECT * FROM horarios_lugar WHERE id_lugar = $1 ORDER BY dia_semana',
        [id]
      ),
      db.db.query(
        'SELECT * FROM datos_historicos_lugar WHERE id_lugar = $1',
        [id]
      ),
      db.db.query(
        `SELECT f.*, u.nombre as usuario_nombre 
         FROM fotos f
         LEFT JOIN usuarios u ON f.id_usuario = u.id_usuario
         WHERE f.id_lugar = $1 AND f.id_estado = 1
         ORDER BY f.fecha_subida DESC
         LIMIT 10`,
        [id]
      )
    ]);

    console.log(`Retrieved info for: ${lugar.rows[0].nombre}`);

    res.json({
      lugar: lugar.rows[0],
      horarios: horarios.rows,
      datosHistoricos: datosHistoricos.rows,
      fotos: fotos.rows
    });

  } catch (error) {
    console.error('Error in getLandmarkInfo:', error);
    next(error);
  }
};

module.exports = {
  predictLandmark,
  saveCollection,
  getLandmarkInfo
};