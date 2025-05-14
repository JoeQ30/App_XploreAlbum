const db = require('../db'); 

const registerUser = async (req, res) => {
    try {
        const { nombre, email, password, foto_perfil, biografia } = req.body;
        const result = await db.insertarUsuario(
            nombre,
            email,
            password,
            foto_perfil || null,
            biografia || null
        );
        const usuarios = await db.listarUsuarios(); 
        console.log(usuarios);

        return res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const result = await db.insertarUsuario(
            nombre,
            email,
            password
        );
        const usuarios = await db.listarUsuarios();
        console.log(usuarios);

        return res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};




module.exports = {
    registerUser,
    registerAdmin,
};