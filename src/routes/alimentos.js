const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

router.get('/:idAlimento', async (req, res) => {
    const idAlimento = req.params.idAlimento;
    try {
        const[rows] = await pool.execute('SELECT * FROM alimento WHERE idAlimento = ?', [idAlimento]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Erro ao consultar produto:', error);
    res.status(500).json({ erro: 'Erro ao consultar produto', detalhes: error.message });
  }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                a.nome, 
                a.preco, 
                a.categoria, 
                r.nome AS nomeRestaurante
            FROM alimento a
            INNER JOIN restaurante r ON a.idRestaurante = r.idRestaurante
            ORDER BY a.categoria ASC, a.nome ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar clientes: ', error);
        res.status(500).json({error: 'Erro ao consultar produto', details: error.message});
    }
});

router.delete('/:id/permanente', async (req, res) => {
  const alimentoId = req.params.id;
  
  try {
    // Primeiro verifica se o produto existe
    const [alimento] = await pool.execute('SELECT * FROM produtos WHERE id_produto = ?', [alimentoId]);
    if (alimento.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Verifica se existem movimentações vinculadas
    const [movimentacoes] = await pool.execute('SELECT COUNT(*) as total FROM movimentacoes WHERE id_produto = ?', [alimentoId]);
    if (movimentacoes[0].total > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir permanentemente o produto',
        message: `Existem ${movimentacoes[0].total} movimentação(ões) vinculada(s) a este produto. Use a rota de desativação (soft delete) em vez da exclusão permanente.`
      });
    }

    // Se não há movimentações, procede com a exclusão permanente
    const [result] = await pool.execute('DELETE FROM produtos WHERE id_produto = ?', [alimentoId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alimento não encontrado' });
    }

    res.json({ 
      mensagem: 'Alimento excluído permanentemente com sucesso',
      alimento: alimento[0].nome,
      id: alimentoId,
      AVISO: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir permanentemente o alimento:', error);
    res.status(500).json({ erro: 'Erro ao excluir permanentemente o alimento', detalhes: error.message });
  }
});

module.exports = router;