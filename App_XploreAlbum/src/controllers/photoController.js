const db = require('../db');

const upload = async (req, res, next) => {
    try {
        const { ruta_imagen, thumbnail, resolucion, peso_kb, id_usuario, id_lugar } = req.body;
        const foto = await db.subirFoto(ruta_imagen, thumbnail, resolucion, peso_kb, id_usuario, id_lugar);
        return res.status(201).json(foto);
    } catch (error) {
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const foto = await db.getFotoByID(id);
        return res.json(foto);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.eliminarFoto(id);
        return res.status(200).json({ message: 'Foto eliminada' });
    } catch (error) {
        next(error);
    }
};

const getByUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const fotos = await db.getFotosByUsuario(id);
        return res.json(fotos);
    } catch (error) {
        next(error);
    }
};

const getByPlace = async (req, res, next) => {
    try {
        const { id } = req.params;
        const fotos = await db.getFotosByLugar(id);
        return res.json(fotos);
    } catch (error) {
        next(error);
    }
};

module.exports = { upload, get, remove, getByUser, getByPlace };
