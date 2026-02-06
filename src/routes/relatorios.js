const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

router.get('/relatorio-completo', async (req, res) => {
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
            INNER JOIN restaurante r ON p.idRestaurante = r.idRestaurante`
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar clientes: ', error);
        res.status(500).json({erro: 'Erro ao consultar produto', detalhes: error.message});
    }
});

module.exports = router;