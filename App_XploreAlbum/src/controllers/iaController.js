const roboflowService = require('../services/roboflowService');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const predictLandmark = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // 1. Procesar imagen con Roboflow
    const prediction = await roboflowService.predictFromBuffer(req.file.buffer);
    
    if (!prediction.success) {
      return res.status(404).json({ error: 'No se pudo identificar el lugar' });
    }

    // 2. Buscar lugar en la base de datos
    const lugar = await db.db.query(
      'SELECT * FROM lugares WHERE LOWER(nombre) LIKE LOWER($1) LIMIT 1',
      [`%${prediction.bestPrediction.class}%`]
    );

    if (!lugar.rows[0]) {
      return res.status(404).json({ 
        error: 'Lugar identificado pero no encontrado en la base de datos',
        prediction: prediction.bestPrediction 
      });
    }

    // 3. Preparar respuesta básica
    const responseData = {
      success: true,
      lugar: lugar.rows[0],
      prediction: prediction.bestPrediction,
      foto: null,
      nuevosColeccionables: []
    };

    res.json(responseData);

  } catch (error) {
    next(error);
  }
};

const saveCollection = async (req, res, next) => {
  try {
    const { lugarId, imageBase64 } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // 1. Buscar lugar en la base de datos
    const lugar = await db.db.query(
      'SELECT * FROM lugares WHERE id_lugar = $1',
      [lugarId]
    );

    if (!lugar.rows[0]) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    // 2. Guardar imagen en el sistema de archivos
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${uuidv4()}.jpg`;
    const filepath = path.join(uploadDir, filename);
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(filepath, imageBuffer);

    // 3. Insertar en base de datos
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

    // 4. Verificar y desbloquear coleccionables
    let coleccionablesDesbloqueados = [];
    const coleccionables = await db.db.query(
      `SELECT c.* FROM coleccionables c
       LEFT JOIN usuario_coleccionables uc ON c.id_coleccionable = uc.id_coleccionable AND uc.id_usuario = $1
       WHERE c.id_lugar = $2 AND uc.id_usuario IS NULL`,
      [req.user.id_usuario, lugar.rows[0].id_lugar]
    );

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

    res.json({
      success: true,
      foto: fotoInsert.rows[0],
      nuevosColeccionables: coleccionablesDesbloqueados
    });

  } catch (error) {
    next(error);
  }
};

const getLandmarkInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
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

    const horarios = await db.db.query(
      'SELECT * FROM horarios_lugar WHERE id_lugar = $1 ORDER BY dia_semana',
      [id]
    );

    const datosHistoricos = await db.db.query(
      'SELECT * FROM datos_historicos_lugar WHERE id_lugar = $1',
      [id]
    );

    const fotos = await db.db.query(
      `SELECT f.*, u.nombre as usuario_nombre 
       FROM fotos f
       LEFT JOIN usuarios u ON f.id_usuario = u.id_usuario
       WHERE f.id_lugar = $1 AND f.id_estado = 1
       ORDER BY f.fecha_subida DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      lugar: lugar.rows[0],
      horarios: horarios.rows,
      datosHistoricos: datosHistoricos.rows,
      fotos: fotos.rows
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  predictLandmark,
  saveCollection,
  getLandmarkInfo
};