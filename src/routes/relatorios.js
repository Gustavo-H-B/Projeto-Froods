const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET---------------------------------------------------------
router.get('/completo', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                c.nome AS Cliente,
                r.nome AS Restaurante,
                p.idPedido,
                a.nome AS Alimento,
                ip.quantidade,
                ip.precoUnitario,
                p.stats AS Status_Entrega
            FROM pedidos p
            INNER JOIN cliente c ON p.idCliente = c.idCliente
            INNER JOIN itensPedido ip ON p.idPedido = ip.idPedido
            INNER JOIN alimento a ON ip.idAlimento = a.idAlimento
            INNER JOIN restaurante r ON p.idRestaurante = r.idRestaurante
        `);
    if (rows.length === 0) {
        return res.status(404).json({ erro: 'Relatorio não encontrado' });
    }
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar relatorio: ', error);
        res.status(500).json({erro: 'Erro ao consultar relatorio', detalhes: error.message});
    }
});

// --------------------------------------DELETE------------------------------------------------------
// Não a necessidade...

// --------------------------------------POST--------------------------------------------------------
// Não a necessidade...

// --------------------------------------PUT---------------------------------------------------------
// Não a necessidade...

module.exports = router;