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

const getFollowingCount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const count = await db.getSeguidosCount(id);
        return res.json({ count });
    } catch (error) {
        next(error);
    }
};

const getFollowersCount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const count = await db.getSeguidoresCount(id);
        return res.json({ count });
    } catch (error) {
        next(error);
    }
}

const isFollowing = async (req, res, next) => {
  try {
    const { id } = req.params; // id del usuario seguido
    const { id_seguidor } = req.query; // id del que pregunta si sigue

    if (!id_seguidor) {
      return res.status(400).json({ error: 'Falta id_seguidor en query params' });
    }

    const result = await db.isFollowing(id_seguidor, id);
    return res.json({ isFollowing: result });
  } catch (error) {
    next(error);
  }
};



module.exports = { follow, unfollow, getFollowers, getFollowing, getFollowingCount, getFollowersCount, isFollowing };
