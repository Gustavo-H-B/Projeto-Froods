const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET------------------------------------------------------
router.get('/:id', async (req, res) => {
    const idAlimento = req.params.id;
    try {
        const[rows] = await pool.execute('SELECT * FROM alimento WHERE idAlimento = ?', [idAlimento]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'alimento não encontrado' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Erro ao consultar alimento:', error);
    res.status(500).json({ erro: 'Erro ao consultar alimento', detalhes: error.message });
  }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
          SELECT
          a.idAlimento,
          a.nome AS nomeAlimento, 
          a.preco, 
          a.categoria,
          r.idRestaurante, 
          r.nome AS nomeRestaurante
          FROM alimento a
          INNER JOIN restaurante r ON a.idRestaurante = r.idRestaurante`
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar o alimento: ', error);
        res.status(500).json({erro: 'Erro ao consultar o alimento', detalhes: error.message});
    }
});

// --------------------------------------DELETE------------------------------------------------------
router.delete('/:id/deletar', async (req, res) => {
  const alimentoId = req.params.id;

  // Primeiro verifica se o alimento existe
  try {
    const [alimento] = await pool.execute('SELECT * FROM alimento WHERE idAlimento = ?', [alimentoId]);
    if (alimento.length === 0) {
      return res.status(404).json({ erro: 'Alimento não encontrado' });
    }

    //  Checa se existem pedidos vinculados a este alimento
    const [movimentacoes] = await pool.execute('SELECT COUNT(*) as total FROM pedidos WHERE idAlimento = ?', [alimentoId]);
    
    if (movimentacoes[0].total > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível excluir permanentemente o alimento',
        message: `Existem ${movimentacoes[0].total} pedidos vinculados a este alimento no sistema. Para não quebrar o histórico de vendas, a exclusão foi bloqueada.`
      });
    }

    // Se não há pedidos, procede com a exclusão permanente
    const [result] = await pool.execute('DELETE FROM alimento WHERE idAlimento = ?', [alimentoId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Alimento não encontrado' });
    }

    // Retorna uma mensagem depois do BAN!
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

  // Valida se possui o nome do alimento
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ 
      erro: 'Nome do alimento é obrigatório',
      messagem: 'Forneça um nome válido para o alimento'
    });
  }

  // Valida se possui nome a categoria
  if (!categoria || categoria.trim() === '') {
    return res.status(400).json({ 
      erro: 'Categoria do alimento é obrigatório',
      messagem: 'Forneça uma categoria válida para o alimento'
    });
  }

  // Valida o tamanho do nome
  const nomeAlimento = nome.trim();
  if (nomeAlimento.length > 200) {
    return res.status(400).json({ 
      erro: 'Nome muito longo',
      messagem: 'O nome do alimento deve ter no máximo 200 caracteres'
    });
  }

  // Valida o tamanho da categoria
  const categoriaAlimento = categoria.trim();
  if (categoriaAlimento.length > 50 ) {
    return res.status(400).json({ 
      erro: 'Categoria muito longo',
      messagem: 'A categoria do alimento deve ter no máximo 50 caracteres'
    });
  }

    // Valida o preço do alimento
  const precoAlimento = preco;
  if (isNaN(precoAlimento) || precoAlimento <= 0 || precoAlimento > 999999.99) {
    return res.status(400).json({ 
      erro: 'O preço deve ser no máximo 999999,99',
      messagem: 'A categoria do alimento deve ter no máximo 50 caracteres'
    });
  }

  try {
    // Verifica se o restaurante existe
    if (idRestaurante) {
      const [restauranteProvedor] = await pool.execute('SELECT * FROM restaurante WHERE idRestaurante = ?', [idRestaurante]);
      if (restauranteProvedor.length === 0) {
        return res.status(404).json({ 
          error: 'Restaurante não encontrado',
          messagem: `Não existe o restaurante com o ID ${idRestaurante}`
        });
      }
    }

    // Verifica se já existe um alimento com este nome
    const [alimentoExistente] = await pool.execute('SELECT * FROM alimento WHERE nome = ?', [nomeAlimento]);
    if (alimentoExistente.length > 0) {
      return res.status(409).json({ 
        error: 'Alimento já existe',
        message: `Já existe um alimento com o nome "${nomeAlimento}"`
      });
    }

    // Insere o novo alimento
    const query = `
      INSERT INTO alimento
      (nome, preco, categoria, idRestaurante) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      nomeAlimento,
      preco,
      categoria,
      idRestaurante
    ]);
    
    // Busca o alimento inserido com informações do restaurante para retornar os dados completos
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
      messagem: 'Alimento criado com sucesso',
      alimento: novoAlimento[0]
    });

  } catch (error) {
    console.error('Erro ao criar alimento:', error);
    res.status(500).json({ erro: 'Erro ao criar o alimento', detalhes: error.message });
  }
});

// --------------------------------------PUT------------------------------------------------------
router.put('/:id/atualizar', async (req, res) => {
  const alimentoId = req.params.id;
  const {
    nome, 
    preco, 
    categoria, 
    idRestaurante
  } = req.body;

  // Verifica se tem algo e o tamanho do nome
  if (nome !== undefined) {
    if (nome.trim() === '') {
      return res.status(400).json({ erro: 'O nome não pode ser vazio' });
    }
    if (nome.trim().length > 200) {
      return res.status(400).json({ erro: 'Nome muito longo (máx 200)' });
    }
  }

  // Verifica se tem algo e o tamanho da categoria
  if (categoria !== undefined) {
    if (categoria.trim() === '') {
      return res.status(400).json({ erro: 'A categoria não pode ser vazia' });
    }
    if (categoria.trim().length > 50) {
      return res.status(400).json({ erro: 'Categoria muito longa (máx 50)' });
    }
  }

  // Valida o preço do alimento
  const precoAlimento = preco;
  if (isNaN(precoAlimento) || precoAlimento <= 0 || precoAlimento > 999999.99) {
    return res.status(400).json({ 
      erro: 'O preço deve ser no máximo 999999,99',
      messagem: 'A categoria do alimento deve ter no máximo 50 caracteres'
    });
  }

  try {
    // Verifica se o restaurante existe
    if (idRestaurante) {
      const [restauranteProvedor] = await pool.execute('SELECT * FROM restaurante WHERE idRestaurante = ?', [idRestaurante]);
      if (restauranteProvedor.length === 0) {
        return res.status(404).json({ 
          erro: 'Restaurante não encontrado',
          messagem: `Não existe o restaurante com o ID ${idRestaurante}`
        });
      }
    }

    // Verifica se o alimento existe
    const [existeAlimento] = await pool.execute('SELECT * FROM alimento WHERE idAlimento = ?', [alimentoId]);
    if (existeAlimento.length === 0) {
      return res.status(404).json({ erro: 'Alimento não encontrado' });
    }
    
    // Constrói a quary de atualização dinamicamente baseado nos campos fornecidos
    const camposParaAtualizar = [];
    const valoresParaAtualizar = [];

    if (nome !== undefined) {
      camposParaAtualizar.push('nome = ?');
      valoresParaAtualizar.push(nome.trim());
    }
    if (preco !== undefined) {
      camposParaAtualizar.push('preco = ?');
      valoresParaAtualizar.push(preco);
    }
    if (categoria !== undefined) {
      camposParaAtualizar.push('categoria = ?');
      valoresParaAtualizar.push(categoria);
    }
    if (idRestaurante !== undefined) {
      camposParaAtualizar.push('idRestaurante = ?');
      valoresParaAtualizar.push(idRestaurante);
    }
    
    // Caso nenhum campo foi fornecido para atualização rejeitar
    if (camposParaAtualizar.length === 0) {
      return res.status(400).json({ 
        erro: 'Nenhum campo para atualizar',
        messagem: 'Forneça pelo menos um campo para ser atualizado'
      });
    }

    // Adiciona o ID do alimento no final dos valores
    valoresParaAtualizar.push(alimentoId);

    // Executa a atualização
    const queryUpdate = `UPDATE alimento SET ${camposParaAtualizar.join(', ')} WHERE idAlimento = ?`;
    const [result] = await pool.execute(queryUpdate, valoresParaAtualizar);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Alimento não encontrado' });
    }

    // Busca o alimento atualizado com informações da categoria
    const queryAlimento = `
      SELECT a.*, 
      r.nome AS nomeRestaurante
      FROM alimento a
      LEFT JOIN restaurante r ON a.idRestaurante = r.idRestaurante
      WHERE a.idAlimento = ?
    `;

    const [alimentoAtualizado] = await pool.execute(queryAlimento, [alimentoId]);

    // Menssagem de vitoria eu consegui!!!!!!
    res.json({
      messagem: 'Alimento atualizado com sucesso',
      alimento: alimentoAtualizado[0],
      camposAtualizados: camposParaAtualizar.length
    });

  } catch (error) {
    console.error('Erro ao atualizar alimento:', error);
    res.status(500).json({ erro: 'Erro ao atualizar alimento', detalhes: error.message });
  }
});

module.exports = router;