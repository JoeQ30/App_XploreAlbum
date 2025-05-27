const db = require('../db');

const getPendingPhotos = async (req, res, next) => {
    try {
        const fotos = await db.getFotosPendientes();
        return res.json(fotos);
    } catch (error) {
        next(error);
    }
};

const reviewPhoto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // id_estado
        const foto = await db.actualizarEstadoFoto(id, estado);
        return res.json(foto);
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const usuarios = await db.getUsuariosAdmin();
        return res.json(usuarios);
    } catch (error) {
        next(error);
    }
};

const removeUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.eliminarUsuarioByID(id);
        return res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPendingPhotos, reviewPhoto, getUsers, removeUser };
