const db = require('../db');

const follow = async (req, res, next) => {
    try {
        const { id } = req.params; // id_seguido
        const { id_seguidor } = req.body;
        const result = await db.seguirUsuario(id_seguidor, id);
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const unfollow = async (req, res, next) => {
    try {
        const { id } = req.params; // id_seguido
        const { id_seguidor } = req.body;
        await db.dejarDeSeguir(id_seguidor, id);
        return res.status(200).json({ message: 'Dejó de seguir con éxito' });
    } catch (error) {
        next(error);
    }
};

const getFollowers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const seguidores = await db.getSeguidores(id);
        return res.json(seguidores);
    } catch (error) {
        next(error);
    }
};

const getFollowing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const seguidos = await db.getSeguidos(id);
        return res.json(seguidos);
    } catch (error) {
        next(error);
    }
};

module.exports = { follow, unfollow, getFollowers, getFollowing };
