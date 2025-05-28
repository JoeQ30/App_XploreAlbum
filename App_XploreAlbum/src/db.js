const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuración de la conexión a la base de datos
const db = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
})

// Funcines para listar datos de las tablas de la BD
const listarUsuarios = async () => {
    const res = await db.query('SELECT * FROM usuarios WHERE activo = TRUE');
    return res.rows;
};

const listarLugares = async () => {
    const res = await db.query('SELECT * FROM lugares WHERE activo = TRUE');
    return res.rows;
};

const listarLogros = async () => {
    const res = await db.query('SELECT * FROM logros WHERE activo = TRUE');
    return res.rows;
};

const listarColeccionables = async () => {
    const res = await db.query('SELECT * FROM coleccionables WHERE activo = TRUE');
    return res.rows;
};

const ListarLogrosById = async (id) => {
    const res = await db.query(`
      SELECT 
          l.id_logro,
          l.nombre,
          l.descripcion,
          l.puntos,
          l.criterio,
          l.icono,
          COALESCE(pl.completado, false) AS completado
      FROM logros l
      LEFT JOIN progreso_logros pl 
        ON l.id_logro = pl.id_logro AND pl.id_usuario = $1
      ORDER BY l.id_logro;
    `, [id]);

    return res.rows;
};


const insertarUsuario = async (nombre, email, password, foto_perfil, biografia) => {
    console.log({ nombre, email, password, foto_perfil, biografia });
    const res = await db.query(
            `INSERT INTO usuarios (
                nombre,
                correo,
                password_hash,
                foto_perfil,
                biografia,
                fecha_registro,
                tipo_usuario,         
                ultima_conexion
            ) VALUES (
                $1, $2, $3, $4, $5, NOW(), 'turista', NULL
            ) RETURNING *`,
            [nombre, email, password, foto_perfil || null, biografia || null]
        );

    return res.rows;
};

const insertarAdmin = async (nombre, email, password) => {
    console.log({ nombre, email, password });
    const res = await db.query(
            `INSERT INTO usuarios (
                nombre,
                correo,
                password_hash,
                foto_perfil,
                biografia,
                fecha_registro,
                tipo_usuario,         
                ultima_conexion
            ) VALUES (
                $1, $2, $3, NULL, NULL, NOW(), 'admin', NULL
            ) RETURNING *`,
            [nombre, email, password, foto_perfil || null, biografia || null]
        );

    return res.rows;
};

const eliminarUsuarioByID = async (id) => {
    const res = await db.query(
        'UPDATE usuarios SET activo = FALSE WHERE id_usuario = $1 RETURNING *',
        [id]
    );

    return res;
}

const eliminarUsuarioByNombre = async (nombre) => {
    const res = await db.query(
        'UPDATE usuarios SET activo = FALSE WHERE nombre = $1 RETURNING *',
        [nombre]
    );

    return res;
}

const getUsuarioByID = async (id) => {
    const res = await db.query(
        'SELECT * FROM usuarios WHERE id_usuario = $1 AND activo = TRUE;',
        [id]
    );
    return res.rows[0];
};

const getUsuarioByNombre = async (name) => {
    const res = await db.query(
        'SELECT * FROM usuarios WHERE LOWER(nombre) LIKE LOWER($1) AND activo = TRUE;',
        [`%${name}%`]
    );
    return res.rows[0];
};

const getUsuarioByCorreo = async (email) => {
    const res = await db.query(
        'SELECT * FROM usuarios WHERE correo LIKE $1 AND activo = TRUE;',
        [email]
    );
    return res.rows[0];
};

const setUltimaConexion = async (id) => {
  const res = await db.query(
    'UPDATE usuarios SET ultima_conexion = CURRENT_DATE WHERE id_usuario = $1 RETURNING *',
    [id]
  );

  return res.rows[0];
}


const updateUsuario = async (id, nombre, email, foto_perfil, biografia, visibilidad_perfil) => {
    const res = await db.query(
        `UPDATE usuarios SET 
            nombre = $1,
            correo = $2,
            foto_perfil = $3,
            biografia = $4,
            visibilidad_perfil = $5
        WHERE id_usuario = $6 RETURNING *`,
        [nombre, email, foto_perfil || null, biografia || null, visibilidad_perfil, id]
    );

    return res.rows;
};




const getLogrosByUsuario = async (id_usuario) => {
    const res = await db.query(`
        SELECT l.* FROM logros l
        JOIN progreso_logros p ON l.id_logro = p.id_logro
        WHERE p.id_usuario = $1`, [id_usuario]);
    return res.rows;
};

const insertarLogro = async (nombre, descripcion, puntos, criterio, icono) => {
    const res = await db.query(`
        INSERT INTO logros (nombre, descripcion, puntos, criterio, icono)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nombre, descripcion, puntos, criterio, icono]);
    return res.rows[0];
};

const actualizarLogro = async (id, nombre, descripcion, puntos, criterio, icono) => {
    const res = await db.query(`
        UPDATE logros SET nombre=$1, descripcion=$2, puntos=$3, criterio=$4, icono=$5
        WHERE id_logro=$6 RETURNING *`,
        [nombre, descripcion, puntos, criterio, icono, id]);
    return res.rows[0];
};

const eliminarLogro = async (id) => {
    await db.query(`DELETE FROM logros WHERE id_logro=$1`, [id]);
};

const getFotosPendientes = async () => {
    const res = await db.query(`SELECT * FROM fotos WHERE id_estado IS NULL`);
    return res.rows;
};

const actualizarEstadoFoto = async (id_foto, id_estado) => {
    const res = await db.query(`
        UPDATE fotos SET id_estado = $1 WHERE id_foto = $2 RETURNING *`,
        [id_estado, id_foto]);
    return res.rows[0];
};

const getUsuariosAdmin = async () => {
    const res = await db.query(`
        SELECT * FROM usuarios WHERE tipo_usuario = 'admin' AND activo = TRUE`);
    return res.rows;
};

const insertarAlbum = async (nombre, descripcion, visibilidad, id_tipo, id_usuario) => {
    const res = await db.query(`
        INSERT INTO albumes (nombre, descripcion, visibilidad, id_tipo, id_usuario)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nombre, descripcion, visibilidad, id_tipo, id_usuario]);
    return res.rows[0];
};

const getAlbumByID = async (id) => {
    const res = await db.query(`SELECT * FROM albumes WHERE id_album = $1`, [id]);
    return res.rows[0];
};

const actualizarAlbum = async (id, nombre, descripcion, visibilidad) => {
    const res = await db.query(`
        UPDATE albumes SET nombre=$1, descripcion=$2, visibilidad=$3
        WHERE id_album=$4 RETURNING *`,
        [nombre, descripcion, visibilidad, id]);
    return res.rows[0];
};

const eliminarAlbum = async (id) => {
    await db.query(`DELETE FROM albumes WHERE id_album = $1`, [id]);
};

const agregarFotoAlbum = async (id_album, id_foto, orden) => {
    const res = await db.query(`
        INSERT INTO album_fotos (id_album, id_foto, orden)
        VALUES ($1, $2, $3) RETURNING *`,
        [id_album, id_foto, orden]);
    return res.rows[0];
};

const eliminarFotoAlbum = async (id_album, id_foto) => {
    await db.query(`DELETE FROM album_fotos WHERE id_album=$1 AND id_foto=$2`, [id_album, id_foto]);
};

const getAlbumsByUsuario = async (id_usuario) => {
    const res = await db.query(`
        SELECT * FROM albumes WHERE id_usuario = $1`, [id_usuario]);
    return res.rows;
};

const getColeccionablesByUsuario = async (id_usuario) => {
    const res = await db.query(`
        SELECT c.* FROM coleccionables c
        JOIN usuario_coleccionables u ON c.id_coleccionable = u.id_coleccionable
        WHERE u.id_usuario = $1`, [id_usuario]);
    return res.rows;
};

const seguirUsuario = async (id_seguidor, id_seguido) => {
    const res = await db.query(`
        INSERT INTO seguimientos (id_seguidor, id_seguido)
        VALUES ($1, $2) RETURNING *`,
        [id_seguidor, id_seguido]);
    return res.rows[0];
};

const dejarDeSeguir = async (id_seguidor, id_seguido) => {
    await db.query(`
        DELETE FROM seguimientos WHERE id_seguidor = $1 AND id_seguido = $2`,
        [id_seguidor, id_seguido]);
};

const getSeguidores = async (id_usuario) => {
    const res = await db.query(`
        SELECT u.* FROM usuarios u
        JOIN seguimientos s ON u.id_usuario = s.id_seguidor
        WHERE s.id_seguido = $1`, [id_usuario]);
    return res.rows;
};

const getSeguidos = async (id_usuario) => {
    const res = await db.query(`
        SELECT u.* FROM usuarios u
        JOIN seguimientos s ON u.id_usuario = s.id_seguido
        WHERE s.id_seguidor = $1`, [id_usuario]);
    return res.rows;
};

const validarProximidad = async (lat, lon, id_lugar) => {
    const res = await db.query(`
        SELECT ST_DWithin(ubicacion_gps, ST_MakePoint($1, $2)::geography, 50) AS cerca
        FROM lugares WHERE id_lugar = $3`, [lon, lat, id_lugar]);
    return res.rows[0]?.cerca;
};

const registrarVisita = async (id_usuario, id_lugar) => {
    const res = await db.query(`
        INSERT INTO visitas (id_usuario, id_lugar) VALUES ($1, $2) RETURNING *`,
        [id_usuario, id_lugar]);
    return res.rows[0];
};

const getVisitasUsuario = async (id) => {
    const res = await db.query(`
        SELECT * FROM visitas WHERE id_usuario = $1`, [id]);
    return res.rows;
};

const getNotificaciones = async (id_usuario) => {
    const res = await db.query(`
        SELECT * FROM notificaciones WHERE id_usuario = $1 ORDER BY fecha DESC`,
        [id_usuario]);
    return res.rows;
};

const marcarNotificacionLeida = async (id) => {
    await db.query(`UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = $1`, [id]);
};

const subirFoto = async (ruta, thumb, resol, peso, id_usuario, id_lugar) => {
    const res = await db.query(`
        INSERT INTO fotos (ruta_imagen, thumbnail, resolucion, peso_kb, id_usuario, id_lugar)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [ruta, thumb, resol, peso, id_usuario, id_lugar]);
    return res.rows[0];
};

const getFotoByID = async (id) => {
    const res = await db.query(`SELECT * FROM fotos WHERE id_foto = $1`, [id]);
    return res.rows[0];
};

const eliminarFoto = async (id) => {
    await db.query(`DELETE FROM fotos WHERE id_foto = $1`, [id]);
};

const getFotosByUsuario = async (id) => {
    const res = await db.query(`SELECT * FROM fotos WHERE id_usuario = $1`, [id]);
    return res.rows;
};

const getFotosByLugar = async (id) => {
    const res = await db.query(`SELECT * FROM fotos WHERE id_lugar = $1`, [id]);
    return res.rows;
};

const getLugarByID = async (id) => {
    const res = await db.query(`SELECT * FROM lugares WHERE id_lugar = $1`, [id]);
    return res.rows[0];
};

const getDatosHistoricos = async (id_lugar) => {
    const res = await db.query(`SELECT * FROM datos_historicos_lugar WHERE id_lugar = $1`, [id_lugar]);
    return res.rows;
};

const getHorariosLugar = async (id_lugar) => {
    const res = await db.query(`SELECT * FROM horarios_lugar WHERE id_lugar = $1`, [id_lugar]);
    return res.rows;
};

const getCategorias = async () => {
    const res = await db.query(`SELECT * FROM categorias`);
    return res.rows;
};


module.exports = {
    listarUsuarios,
    listarLugares,
    listarLogros,
    listarColeccionables,
    insertarUsuario,
    insertarAdmin,
    eliminarUsuarioByID,
    eliminarUsuarioByNombre,
    getUsuarioByID,
    getUsuarioByNombre,
    getUsuarioByCorreo,
    updateUsuario,
    getLogrosByUsuario,
    insertarLogro,
    actualizarLogro,
    eliminarLogro,
    getFotosPendientes,
    actualizarEstadoFoto,
    getUsuariosAdmin,
    insertarAlbum,
    getAlbumByID,
    actualizarAlbum,
    eliminarAlbum,
    agregarFotoAlbum,
    eliminarFotoAlbum,
    getAlbumsByUsuario,
    getColeccionablesByUsuario,
    seguirUsuario,
    dejarDeSeguir,
    getSeguidores,
    getSeguidos,
    validarProximidad,
    registrarVisita,
    getVisitasUsuario,
    getNotificaciones,
    marcarNotificacionLeida,
    subirFoto,
    getFotoByID,
    eliminarFoto,
    getFotosByUsuario,
    getFotosByLugar,
    getLugarByID,
    getDatosHistoricos,
    getHorariosLugar,
    getCategorias,
    setUltimaConexion,
    ListarLogrosById,
    db,
};

