const db = require('../db'); 

const list = async (req, res) => {
    try {
        const lugares = await db.listarLugares(); 
        return res.json(lugares);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los lugares' });
    }
}

module.exports = {
    list,
};