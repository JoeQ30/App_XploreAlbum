const db = require('../db');

const validateLocation = async (req, res, next) => {
    try {
        const { lat, lon, id_lugar } = req.body;
        const valid = await db.validarProximidad(lat, lon, id_lugar);
        return res.json({ cerca: valid });
    } catch (error) {
        next(error);
    }
};

const registerVisit = async (req, res, next) => {
    try {
        const { id } = req.params; // id_lugar
        const { id_usuario } = req.body;
        const visita = await db.registrarVisita(id_usuario, id);
        return res.status(201).json(visita);
    } catch (error) {
        next(error);
    }
};

const getUserVisits = async (req, res, next) => {
    try {
        const { id } = req.params;
        const visitas = await db.getVisitasUsuario(id);
        return res.json(visitas);
    } catch (error) {
        next(error);
    }
};

module.exports = { validateLocation, registerVisit, getUserVisits };
