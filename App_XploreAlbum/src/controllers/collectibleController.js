const db = require('../db'); 

const list = async (req, res) => {
    try {
        const coleccionables = await db.listarColeccionables(); 
        return res.json(coleccionables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los coleccionables' });
    }
}

module.exports = {
    list,
};