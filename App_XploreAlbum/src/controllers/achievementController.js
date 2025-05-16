const db = require('../db'); 

const list = async (req, res, next) => {
    try {
        const logros = await db.listarLogros(); 
        return res.json(logros);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    list,
};