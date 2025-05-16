const db = require('../db'); 

const list = async (req, res, next) => {
    try {
        const usuarios = await db.listarUsuarios(); 
        return res.json(usuarios);
    } catch (error) {
        next(error);
    }
}

const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.eliminarUsuarioByID(id);
        const usuarios = await db.listarUsuarios();
        console.log(usuarios);

        return res.status(200).json({ message: 'El usuario ha sido removido con éxito...' });
    } catch (error) {
        next(error);
    }
}

const deleteUserByName = async (req, res, next) => {
    try {
        const { nombre } = req.body;
        const res = await db.eliminarUsuarioByNombre(nombre);
        const usuarios = await db.listarUsuarios();
        console.log(usuarios);

        return res.status(200).json({ message: 'El usuario ha sido removido con éxito...' });
    } catch (error) {
        next(error);
    }
}

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuario = await db.getUsuarioByID(id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        return res.json(usuario);
    } catch (error) {
        next(error);
    }
}

const getUserByName = async (req, res, next) => {
    try {
        const { name } = req.params;
        const usuario = await db.getUsuarioByNombre(name);
        if (!usuario) {
            return res.status(404).json({ error: 'No se encontraron coincidencias' });
        }
        return res.json(usuario);
    } catch (error) {
        next(error);
    }
}

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, correo, password, foto_perfil, biografia, visibilidad_perfil } = req.body;

        const usuario = await db.updateUsuario(
            id, 
            nombre, 
            correo, 
            password, 
            foto_perfil, 
            biografia, 
            visibilidad_perfil // solo dos estados -> 'publico' o 'solo_seguidores'
        );
        if (!usuario) {
            return res.status(404).json({ error: 'No se encontró al usuario a actualizar' });
        }
        return res.json(usuario);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    list,
    deleteUserById,
    deleteUserByName,
    getUserById,
    getUserByName,
    updateUser
};