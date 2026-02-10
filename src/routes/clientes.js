const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM cliente');
    if (rows.length === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
    }
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar clientes: ', error);
        res.status(500).json({erro: 'Erro ao consultar produto', detalhes: error.message});
    }
});

// --------------------------------------DELETE------------------------------------------------------
router.delete('/:id/permanente', async (req, res) => {
  const clienteId = req.params.id;
  
  try {
    // Primeiro verifica se o produto existe
    const [cliente] = await pool.execute('SELECT * FROM cliente WHERE idCliente = ?', [clienteId]);
    if (cliente.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    // Verifica se existem movimentações vinculadas
    const [movimentacoes] = await pool.execute('SELECT COUNT(*) as total FROM itensPedido WHERE idCliente = ?', [clienteId]);
    if (movimentacoes[0].total > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível excluir permanentemente o cliente',
        message: `Existem ${movimentacoes[0].total} pedidos vinculados a este cliente. Use a rota de desativação (soft delete) em vez da exclusão permanente.`
      });
    }

    // Se não há movimentações, procede com a exclusão permanente
    const [result] = await pool.execute('DELETE FROM cliente WHERE idCliente = ?', [clienteId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json({ 
      mensagem: 'Cliente excluído permanentemente com sucesso',
      cliente: cliente[0].nome,
      id: clienteId,
      AVISO: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir permanentemente o cliente:', error);
    res.status(500).json({ erro: 'Erro ao excluir permanentemente o cliente', detalhes: error.message });
  }
});

// --------------------------------------shsrjr------------------------------------------------------


module.exports = router;