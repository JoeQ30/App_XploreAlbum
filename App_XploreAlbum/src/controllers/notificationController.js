const db = require('../db');

const getAll = async (req, res, next) => {
    try {
        const { id } = req.query;
        const notificaciones = await db.getNotificaciones(id);
        return res.json(notificaciones);
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.marcarNotificacionLeida(id);
        return res.status(200).json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAll, markAsRead };
