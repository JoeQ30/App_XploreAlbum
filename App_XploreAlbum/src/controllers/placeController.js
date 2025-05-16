const db = require('../db'); 

const list = async (req, res, next) => {
    try {
        const lugares = await db.listarLugares(); 
        return res.json(lugares);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    list,
};