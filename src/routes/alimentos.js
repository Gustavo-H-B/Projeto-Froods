const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET------------------------------------------------------
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
          a.nome AS nomeAlimento, 
          a.preco, 
          a.categoria,
          r.idRestaurante, 
          r.nome AS nomeRestaurante
          FROM alimento a
          INNER JOIN restaurante r ON a.idRestaurante = r.idRestaurante
          ORDER BY a.categoria ASC, a.nome ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar clientes: ', error);
        res.status(500).json({erro: 'Erro ao consultar produto', detalhes: error.message});
    }
});

// --------------------------------------DELETE------------------------------------------------------
router.delete('/:id/permanente', async (req, res) => {
  const alimentoId = req.params.id;
  
  try {
    // Primeiro verifica se o produto existe
    const [alimento] = await pool.execute('SELECT * FROM alimento WHERE idAlimento = ?', [alimentoId]);
    if (alimento.length === 0) {
      return res.status(404).json({ erro: 'Alimento não encontrado' });
    }

    // Verifica se existem movimentações vinculadas
    const [movimentacoes] = await pool.execute('SELECT COUNT(*) as total FROM itensPedido WHERE idAlimento = ?', [alimentoId]);
    if (movimentacoes[0].total > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível excluir permanentemente o produto',
        message: `Existem ${movimentacoes[0].total} pedidos vinculados a este produto. Use a rota de desativação (soft delete) em vez da exclusão permanente.`
      });
    }

    // Se não há movimentações, procede com a exclusão permanente
    const [result] = await pool.execute('DELETE FROM alimento WHERE idAlimento = ?', [alimentoId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Alimento não encontrado' });
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

// --------------------------------------POST------------------------------------------------------

router.post('/adicionar', async (req, res) => {
  const { 
    nome, 
    preco, 
    categoria, 
    idRestaurante 
  } = req.body;

  // Validação de dados obrigatórios
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ 
      erro: 'Nome do alimento é obrigatório',
      messagem: 'Forneça um nome válido para o alimento'
    });
  }

  if (!categoria || categoria.trim() === '') {
    return res.status(400).json({ 
      erro: 'Categoria do alimento é obrigatório',
      messagem: 'Forneça uma categoria válida para o alimento'
    });
  }

  // Valida dados opcionais
  const nomeAlimento = nome.trim();
  if (nomeAlimento.length > 200) {
    return res.status(400).json({ 
      erro: 'Nome muito longo',
      messagem: 'O nome do alimento deve ter no máximo 200 caracteres'
    });
  }

  const categoriaAlimento = categoria.trim();
  if (categoriaAlimento.length > 50 ) {
    return res.status(400).json({ 
      erro: 'Categoria muito longo',
      messagem: 'A categoria do alimento deve ter no máximo 50 caracteres'
    });
  }

  const precoAlimento = preco;
  if (isNaN(precoAlimento) || precoAlimento <= 0 || precoAlimento > 999999.99) {
    return res.status(400).json({ 
      erro: 'O preço deve ser no máximo 999999,99',
      messagem: 'A categoria do alimento deve ter no máximo 50 caracteres'
    });
  }

  try {
    // Verifica se a restauranteProvedor existe (se foi fornecida)
    if (restauranteProvedor) {
      const [restauranteProvedor] = await pool.execute('SELECT * FROM restaurante WHERE idRestaurante = ?', [restauranteProvedor]);
      if (restauranteProvedor.length === 0) {
        return res.status(404).json({ 
          error: 'Restaurante não encontrado',
          messagem: `Não existe o restaurante com o ID ${restauranteProvedor}`
        });
      }
    }

    // Verifica se já existe um produto com este nome
    const [alimentoExistente] = await pool.execute('SELECT * FROM alimento WHERE nome = ?', [nomeAlimento]);
    if (alimentoExistente.length > 0) {
      return res.status(409).json({ 
        error: 'Alimento já existe',
        message: `Já existe um alimento com o nome "${nomeAlimento}"`
      });
    }

    // Insere o novo produto
    const query = `
      INSERT INTO produtos 
      (nome, preco, categoria, idRestaurante,) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      nomeAlimento,
      preco,
      categoria,
      idRestaurante,
    ]);
    
    // Busca o produto inserido com informações da restauranteProvedor para retornar os dados completos
    const queryAlimento = `
      SELECT 
      a.*, 
      r.nome AS nomeRestaurante
      FROM alimento a
      LEFT JOIN restaurante r ON a.idRestaurante = r.idRestaurante
      WHERE a.idAlimento = ?
    `;
    const [novoAlimento] = await pool.execute(queryAlimento, [result.insertId]);

    res.status(201).json({
      message: 'Alimento criado com sucesso',
      produto: novoAlimento[0]
    });

  } catch (error) {
    console.error('Erro ao criar alimento:', error);
    res.status(500).json({ erro: 'Erro ao criar o alimento', detalhes: error.message });
  }
});

module.exports = router;