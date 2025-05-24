const db = require('../db'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res, next) => {
    try {
        const { nombre, email, password, foto_perfil, biografia } = req.body;

        console.log({ nombre, email, password, foto_perfil, biografia });

        // Encriptado de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await db.insertarUsuario(
            nombre,
            email,
            hashedPassword,
            foto_perfil || null,
            biografia || null
        );

        const usuario = result[0];

        return res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
};

const registerAdmin = async (req, res, next) => {
    try {
        const { nombre, email, password } = req.body;

        console.log({ nombre, email, password, foto_perfil, biografia });

        // Encriptado de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await db.insertarUsuario(
            nombre,
            email,
            hashedPassword
        );

        return res.status(200).json(res.rows);
    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    console.log('BODY: ', req.body);
    const { email, password } = req.body;

    console.log({ email, password });

    try {
        const usuario = await db.getUsuarioByCorreo(email);

        console.log('Usuario encontrado:', usuario);

        if (!usuario) {
            return res.status(401).json({ error: 'Correo no encontrado o usuario inactivo' });
        }

        console.log(usuario.password_hash);

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Si pasa la validación, se genera un token
        const token = jwt.sign(
            { id: usuario.id_usuario, tipo: usuario.tipo_usuario },
            process.env.JWT_SECRET || 'clave_secreta_temporal',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                tipo_usuario: usuario.tipo_usuario,
            }
        });
    } catch (error) {
        next(error);
    }
};



const logout = (req, res, next) => {
    try {
        // Respuesta al cliente para eliminar el token del lado del cliente        
        res.status(200).json({ mensaje: 'Logout exitoso' });
    } catch (error) {
        next(error);
    }
};





module.exports = {
    registerUser,
    registerAdmin,
    login,
    logout
};