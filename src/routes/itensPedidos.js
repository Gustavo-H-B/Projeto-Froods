const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET---------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const[rows] = await pool.execute('SELECT * FROM itensPedido');
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Erro ao consultar produto:', error);
    res.status(500).json({ erro: 'Erro ao consultar produto', detalhes: error.message });
  }
});

// --------------------------------------DELETE------------------------------------------------------
// Não a necessidade...

// --------------------------------------POST--------------------------------------------------------
// Não a necessidade...

// --------------------------------------PUT---------------------------------------------------------
// Não a necessidade...

module.exports = router;