const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET---------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM pedidos');
    if (rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar clientes: ', error);
        res.status(500).json({erro: 'Erro ao consultar produto', detalhes: error.message});
    }
});

router.get('/:id', async (req, res) => {
    const idPedidos = req.params.id;
    try {
        const[rows] = await pool.execute('SELECT * FROM pedidos WHERE idPedido = ?', [idPedidos]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Erro ao consultar o pedido:', error);
    res.status(500).json({ erro: 'Erro ao consultar o pedido', detalhes: error.message });
  }
});

// --------------------------------------DELETE------------------------------------------------------
router.delete('/:id/deletar', async (req, res) => {
  const pedidoId = req.params.id;

  // Primeiro verifica se o pedido existe e busca os dados dele
  try {
    const [pedido] = await pool.execute(`SELECT p.idPedido, c.nome as nomeCliente FROM pedidos p JOIN cliente c ON p.idCliente = c.idCliente WHERE p.idPedido = ?`, [pedidoId]);

    if (pedido.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // Continua com a exclusão
    const [result] = await pool.execute('DELETE FROM pedidos WHERE idPedido = ?', [pedidoId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // Mensagem de sucesso completa
    res.json({ 
      mensagem: 'Pedido removido do sistema com sucesso',
      id: pedidoId,
      cliente: pedido[0].nomeCliente,
      AVISO: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    res.status(500).json({ erro: 'Erro ao excluir o pedido', detalhes: error.message });
  }
});

// --------------------------------------POST--------------------------------------------------------
router.post('/fazer', async (req, res) => {
  const { 
    idAlimento, 
    quantidade, 
    formaPagamento, 
    stats, 
    idCliente, 
    idRestaurante 
  } = req.body;

  // Validações básicas
  if (!idAlimento || isNaN(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: 'Alimento e quantidade (maior que 0) são obrigatórios' });
  }

  if (!formaPagamento || !stats) {
    return res.status(400).json({ erro: 'Forma de pagamento e status são obrigatórios' });
  }

  try {
    // Verifica Alimento
    const [alimento] = await pool.execute('SELECT idAlimento FROM alimento WHERE idAlimento = ?', [idAlimento]);
    if (alimento.length === 0) return res.status(404).json({ erro: 'Alimento não encontrado' });

    // Verifica Cliente
    const [cliente] = await pool.execute('SELECT idCliente FROM cliente WHERE idCliente = ?', [idCliente]);
    if (cliente.length === 0) return res.status(404).json({ erro: 'Cliente não encontrado' });

    // Verifica Restaurante
    const [restaurante] = await pool.execute('SELECT idRestaurante FROM restaurante WHERE idRestaurante = ?', [idRestaurante]);
    if (restaurante.length === 0) return res.status(404).json({ erro: 'Restaurante não encontrado' });

    // Insere o Pedido
    const queryInsert = `
      INSERT INTO pedidos (idAlimento, quantidade, formaPagamento, stats, idCliente, idRestaurante) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(queryInsert, [idAlimento, quantidade, formaPagamento.trim(), stats.trim(), idCliente, idRestaurante]);

    // Busca os dados completos para o retorno
    const queryBusca = `
      SELECT 
        p.idPedido,
        p.quantidade,
        p.formaPagamento,
        p.stats,
        a.nome AS nomeAlimento,
        a.preco AS precoUnitario,
        (p.quantidade * a.preco) AS valorTotalPedido, -- Cálculo automático!
        c.nome AS nomeCliente,
        r.nome AS nomeRestaurante
      FROM pedidos p
      JOIN alimento a ON p.idAlimento = a.idAlimento
      JOIN cliente c ON p.idCliente = c.idCliente
      JOIN restaurante r ON p.idRestaurante = r.idRestaurante
      WHERE p.idPedido = ?
    `;
    const [novoPedido] = await pool.execute(queryBusca, [result.insertId]);

    res.status(201).json({
      mensagem: 'Pedido criado com sucesso',
      pedido: novoPedido[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao processar pedido', detalhes: error.message });
  }
});

// --------------------------------------PUT---------------------------------------------------------
// sem sentido criar, afinal caso tenha feito terá que cancelar e fazer outro...

module.exports = router;