const express = require('express');
const { pool } = require('./config/db');
const app = express();

app.get('/restaurantes', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM restaurante');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar restaurantes:', error);
        res.status(500).json({ erro: 'Erro ao consultar produtos', detalhes: error.message });
    }
});

app.get('/alimentos/:categoria', async (req, res) => {
    const categoriaAlimento = req.params.categoria;
    try {
        const[rows] = await pool.execute('SELECT * FROM alimento WHERE categoria = ?', [categoriaAlimento]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao consultar produto:', error);
    res.status(500).json({ error: 'Erro ao consultar produto', details: error.message });
  }
});

app.get('/clientes', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM cliente');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar clientes: ', error);
        res.status(500).json({error: 'Erro ao consultar produto', details: error.message});
    }
});


app.get('/pedidos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM pedidos');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar clientes: ', error);
        res.status(500).json({error: 'Erro ao consultar produto', details: error.message});
    }
});

module.exports = app;