const db = require('../db');

const list = async (req, res, next) => {
    try {
        const logros = await db.listarLogros();
        return res.json(logros);
    } catch (error) {
        next(error);
    }
};

const getByUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const logros = await db.getLogrosByUsuario(id);
        return res.json(logros);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const { nombre, descripcion, puntos, criterio, icono } = req.body;
        const logro = await db.insertarLogro(nombre, descripcion, puntos, criterio, icono);
        return res.status(201).json(logro);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, puntos, criterio, icono } = req.body;
        const logro = await db.actualizarLogro(id, nombre, descripcion, puntos, criterio, icono);
        return res.json(logro);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.eliminarLogro(id);
        return res.status(200).json({ message: 'Logro eliminado' });
    } catch (error) {
        next(error);
    }
};

module.exports = { list, getByUser, create, update, remove };
