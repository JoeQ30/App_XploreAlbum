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

const searchUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await db.buscarUsuarioByID(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        return res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar el usuario' });
    }
}

const searchUserByName = async (req, res) => {
    try {
        const { name } = req.params;
        const usuario = await db.buscarUsuarioByNombre(name);
        if (!usuario) {
            return res.status(404).json({ error: 'No se encontraron coincidencias' });
        }
        return res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar usuarios' });
    }
}

module.exports = {
    list,
    deleteUserById,
    deleteUserByName,
    searchUserById,
    searchUserByName
};