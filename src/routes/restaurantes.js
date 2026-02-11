const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET---------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM restaurante');
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar restaurantes:', error);
        res.status(500).json({ erro: 'Erro ao consultar produtos', detalhes: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const idRestaurante = req.params.id;
    try {
        const[rows] = await pool.execute('SELECT * FROM restaurante WHERE idRestaurante = ?', [idRestaurante]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Restaurante não encontrado' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Erro ao consultar o restaurante:', error);
    res.status(500).json({ erro: 'Erro ao consultar o restaurante', detalhes: error.message });
  }
});

// --------------------------------------DELETE------------------------------------------------------



// --------------------------------------shsrjr------------------------------------------------------


module.exports = router;