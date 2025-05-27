const db = require('../db');

const list = async (req, res, next) => {
    try {
        const lugares = await db.listarLugares();
        return res.json(lugares);
    } catch (error) {
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const lugar = await db.getLugarByID(id);
        return res.json(lugar);
    } catch (error) {
        next(error);
    }
};

const getHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const historia = await db.getDatosHistoricos(id);
        return res.json(historia);
    } catch (error) {
        next(error);
    }
};

const getSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const horarios = await db.getHorariosLugar(id);
        return res.json(horarios);
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categorias = await db.getCategorias();
        return res.json(categorias);
    } catch (error) {
        next(error);
    }
};



module.exports = { list, get, getHistory, getSchedule, getCategories };
