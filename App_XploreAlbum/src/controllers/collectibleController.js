const db = require('../db'); 

const list = async (req, res, next) => {
    try {
        const coleccionables = await db.listarColeccionables(); 
        return res.json(coleccionables);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    list,
};