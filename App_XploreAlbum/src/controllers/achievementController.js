const db = require('../db'); 

const list = async (req, res) => {
    try {
        const logros = await db.listarLogros(); 
        return res.json(logros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los logros' });
    }
}

module.exports = {
    list,
};