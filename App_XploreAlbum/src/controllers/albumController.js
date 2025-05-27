const db = require('../db');

const create = async (req, res, next) => {
    try {
        const { nombre, descripcion, visibilidad, id_tipo, id_usuario } = req.body;
        const album = await db.insertarAlbum(nombre, descripcion, visibilidad, id_tipo, id_usuario);
        return res.status(201).json(album);
    } catch (error) {
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const album = await db.getAlbumByID(id);
        return res.json(album);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, visibilidad } = req.body;
        const album = await db.actualizarAlbum(id, nombre, descripcion, visibilidad);
        return res.json(album);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.eliminarAlbum(id);
        return res.json({ message: 'Álbum eliminado' });
    } catch (error) {
        next(error);
    }
};

const addPhoto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { id_foto, orden } = req.body;
        const result = await db.agregarFotoAlbum(id, id_foto, orden);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const removePhoto = async (req, res, next) => {
    try {
        const { id, pid } = req.params;
        await db.eliminarFotoAlbum(id, pid);
        return res.json({ message: 'Foto removida del álbum' });
    } catch (error) {
        next(error);
    }
};

const getByUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const albums = await db.getAlbumsByUsuario(id);
        return res.json(albums);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create, get, update, remove, addPhoto, removePhoto, getByUser
};
