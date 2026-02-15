const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET---------------------------------------------------------
router.get('/completo', async (req, res) => {
    try {
        const queryRelatorio = `
            SELECT
                p.idPedido,
                c.nome AS Cliente,
                r.nome AS Restaurante,
                a.nome AS Alimento,
                p.quantidade,
                a.preco AS Preco_Unitario,
                (p.quantidade * a.preco) AS Valor_Total_Pedido,
                p.formaPagamento,
                p.stats AS Status_Entrega
            FROM pedidos p
            INNER JOIN cliente c ON p.idCliente = c.idCliente
            INNER JOIN restaurante r ON p.idRestaurante = r.idRestaurante
            INNER JOIN alimento a ON p.idAlimento = a.idAlimento
            ORDER BY p.idPedido DESC
        `;

        const [rows] = await pool.execute(queryRelatorio);

        if (rows.length === 0) {
            return res.status(404).json({ mensagem: 'Nenhum pedido encontrado para o relatório.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar relatório: ', error);
        res.status(500).json({ erro: 'Erro ao consultar relatório', detalhes: error.message });
    }
});

// --------------------------------------DELETE------------------------------------------------------
// Não a necessidade...

// --------------------------------------POST--------------------------------------------------------
// Não a necessidade...

// --------------------------------------PUT---------------------------------------------------------
// Não a necessidade...

module.exports = router;