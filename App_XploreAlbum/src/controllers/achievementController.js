const db = require('../db'); 

const list = async (req, res, next) => {
    try {
        const logros = await db.listarLogros(); 
        return res.json(logros);
    } catch (error) {
        next(error);
    }
}

const getByUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        const logros = await db.ListarLogrosById(id);
        return res.json(logros);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    list,
    getByUser
};