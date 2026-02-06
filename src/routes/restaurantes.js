const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM restaurante');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar restaurantes:', error);
        res.status(500).json({ erro: 'Erro ao consultar produtos', detalhes: error.message });
    }
});

module.exports = router;