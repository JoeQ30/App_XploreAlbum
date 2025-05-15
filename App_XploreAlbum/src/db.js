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

const insertarUsuario = async (nombre, email, password, foto_perfil, biografia) => {
    console.log({ nombre, email, password, foto_perfil, biografia });
    const res = await db.query(
            `INSERT INTO usuarios (
                nombre,
                correo,
                contraseña_hash,
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
                contraseña_hash,
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

const buscarUsuarioByID = async (id) => {
    const res = await db.query(
        'SELECT * FROM usuarios WHERE id_usuario = $1 AND activo = TRUE;',
        [id]
    );
    return res.rows;
};

const buscarUsuarioByNombre = async (name) => {
    const res = await db.query(
        'SELECT * FROM usuarios WHERE LOWER(nombre) LIKE LOWER($1) AND activo = TRUE;',
        [`%${name}%`]
    );
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
    buscarUsuarioByID,
    buscarUsuarioByNombre,
    db,
};
