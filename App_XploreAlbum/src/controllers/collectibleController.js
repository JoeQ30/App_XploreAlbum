const db = require('../db');

const list = async (req, res, next) => {
    try {
        const coleccionables = await db.listarColeccionables();
        return res.json(coleccionables);
    } catch (error) {
        next(error);
    }
};

const getByUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const items = await db.getColeccionablesByUsuario(id);
        return res.json(items);
    } catch (error) {
        next(error);
    }
};

const getCantColeccionablesDesbloqueados = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cantidad = await db.getCantidadColeccionablesDesbloqueados(id);
        return res.json({ cantidad });
    } catch (error) {
        next(error);
    }
};

module.exports = { list, getByUser, getCantColeccionablesDesbloqueados };
