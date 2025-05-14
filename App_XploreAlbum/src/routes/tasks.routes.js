const express = require('express');
const router = express.Router();
const db = require('../db');


//PRUEBA
router.get('/users', async (req, res) => {
    try {
        const usuarios = await db.listarUsuarios();
        console.log(res.json(usuarios));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});


module.exports = router;
