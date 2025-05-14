const db = require('../db'); 

const list = async (req, res) => {
    try {
        const usuarios = await db.listarUsuarios(); 
        return res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
}

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.eliminarUsuarioByID(id);
        const usuarios = await db.listarUsuarios();
        console.log(usuarios);

        return res.status(200).json({ message: 'El usuario ha sido removido con éxito...' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
}

const deleteUserByName = async (req, res) => {
    try {
        const { nombre } = req.body;
        const result = await db.eliminarUsuarioByNombre(nombre);
        const usuarios = await db.listarUsuarios();
        console.log(usuarios);

        return res.status(200).json({ message: 'El usuario ha sido removido con éxito...' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
}

module.exports = {
    list,
    deleteUserById,
    deleteUserByName
};