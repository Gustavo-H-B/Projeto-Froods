const express = require('express');
const { cnpj } = require('cpf-cnpj-validator');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET---------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM restaurante');
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar restaurantes:', error);
        res.status(500).json({ erro: 'Erro ao consultar produtos', detalhes: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const idRestaurante = req.params.id;
    try {
        const[rows] = await pool.execute('SELECT * FROM restaurante WHERE idRestaurante = ?', [idRestaurante]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Restaurante não encontrado' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Erro ao consultar o restaurante:', error);
    res.status(500).json({ erro: 'Erro ao consultar o restaurante', detalhes: error.message });
  }
});

// --------------------------------------DELETE------------------------------------------------------
router.delete('/:id/deletar', async (req, res) => {
  const restauranteId = req.params.id;
  
  // Primeiro verifica se o restaurante existe
  try {
    const [restaurante] = await pool.execute('SELECT * FROM restaurante WHERE idRestaurante = ?', [restauranteId]);
    if (restaurante.length === 0) {
      return res.status(404).json({ erro: 'Restaurante não encontrado' });
    }

    // Checa se existem registros na tabela pedidos vinculados ao restaurante
    const [movimentacoes] = await pool.execute('SELECT COUNT(*) as total FROM pedidos WHERE idRestaurante = ?', [restauranteId]);
    
    if (movimentacoes[0].total > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível excluir permanentemente o Restaurante',
        message: `Existem ${movimentacoes[0].total} pedidos vinculados a este restaurante no sistema. Para segurança dos dados, a exclusão foi bloqueada.`
      });
    }

    // Se não há pedidos vinculados, procede com a exclusão permanente
    const [result] = await pool.execute('DELETE FROM restaurante WHERE idRestaurante = ?', [restauranteId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Restaurante não encontrado' });
    }

    // Mensagem de sucesso com o aviso de irreversibilidade
    res.json({ 
      mensagem: 'Restaurante excluído permanentemente com sucesso',
      restaurante: restaurante[0].nome,
      id: restauranteId,
      AVISO: 'Esta ação é irreversível'
    });

  } catch (error) {
    console.error('Erro ao excluir permanentemente o restaurante:', error);
    res.status(500).json({ erro: 'Erro ao excluir permanentemente o restaurante', detalhes: error.message });
  }
});

// --------------------------------------POST--------------------------------------------------------
router.post('/adicionar', async (req, res) => {
    const { nome, tipoRestaurante, enderecoRestaurante, telefone, cnpj: cnpjEnviado } = req.body || {};

    // Verifica se está vazio o nome e o tamanho
    if (nome !== undefined) {
      if (nome.trim() === '') {
        return res.status(400).json({ erro: 'O nome não pode ser vazio' });
      }
      if (nome.trim().length > 200) {
        return res.status(400).json({ erro: 'Nome muito longo (máx 200)' });
      }
    }

    // Verificar se tem endereço e o tamanho
    if (enderecoRestaurante !== undefined) {
      if (enderecoRestaurante.trim() === '') {
        return res.status(400).json({ erro: 'O endereço não pode ser vazio' });
      }
      if (enderecoRestaurante.trim().length > 300) {
        return res.status(400).json({ erro: 'Endereço muito longa (máx 300)' });
      }
    }

    // Verificar o se tem o tipo e o tamnho do tipo de restaurante
    if (tipoRestaurante !== undefined) {
      if (tipoRestaurante.trim() === '') {
        return res.status(400).json({ erro: 'O tipo do restaurante não pode ser vazio' });
      }
      if (tipoRestaurante.trim().length > 50) {
        return res.status(400).json({ erro: 'Tipo de restaurante muito longa (máx 50)' });
      }
    }

    // Verifica se tem telefone e o tamanho
  if (telefone !== undefined) {
    const tell = telefone.trim();
    if (tell === '') {
        return res.status(400).json({ erro: 'O telefone não pode ser vazio' });
    }
    if (tell.length < 8 || tell.length > 20) {
        return res.status(400).json({ 
            erro: 'Telefone inválido', 
            mensagem: 'O telefone deve ter entre 8 e 20 caracteres' 
        });
    }
  }

    // Validar cnpj
    if (!cnpj.isValid(cnpjEnviado)) {
        return res.status(400).json({
            erro: 'cnpj inválido',
            messagem: 'Por favor digite um cnpj válido'
        });
    }

    try {
        const [clienteExiste] = await pool.execute('SELECT * FROM restaurante WHERE cnpj = ?', [cnpjEnviado]);
        if (clienteExiste.length > 0) {
            return res.status(409).json({ erro: 'Restaurante já existe com este CNPJ' });
        }

        const query = `
        INSERT INTO restaurante (
        nome,
        tipoRestaurante,
        enderecoRestaurante, 
        telefone, 
        cnpj
        ) 
        VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.execute(query, [nome.trim(), tipoRestaurante.trim(), enderecoRestaurante, telefone, cnpjEnviado]);

        res.status(201).json({ messagem: 'Restaurante criado com sucesso', id: result.insertId });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar restaurante', detalhes: error.message });
    }
});

// --------------------------------------PUT---------------------------------------------------------
router.put('/:id/atualizar', async (req, res) => {
  const restauranteId = req.params.id;
  const {
    nome, 
    tipoRestaurante,
    enderecoRestaurante, 
    telefone 
  } = req.body;

  // Valida Nome
  if (nome !== undefined) {
    if (nome.trim() === '') {
      return res.status(400).json({ erro: 'O nome não pode ser vazio' });
    }
    if (nome.trim().length > 200) {
      return res.status(400).json({ erro: 'Nome muito longo (máx 200)' });
    }
  }

  // Valida Endereço
  if (enderecoRestaurante !== undefined) {
    if (enderecoRestaurante.trim() === '') {
      return res.status(400).json({ erro: 'O endereço não pode ser vazio' });
    }
    if (enderecoRestaurante.trim().length > 300) {
      return res.status(400).json({ erro: 'Endereço muito longo (máx 300)' });
    }
  }

  // Valida Tipo de Restaurante
  if (tipoRestaurante !== undefined) {
    if (tipoRestaurante.trim() === '') {
      return res.status(400).json({ erro: 'O tipo do restaurante não pode ser vazio' });
    }
    if (tipoRestaurante.trim().length > 50) {
      return res.status(400).json({ erro: 'Tipo de restaurante muito longo (máx 50)' });
    }
  }

  // Valida Telefone
  if (telefone !== undefined) {
    const tell = telefone.trim();
    if (tell === '') {
        return res.status(400).json({ erro: 'O telefone não pode ser vazio' });
    }
    if (tell.length < 8 || tell.length > 20) {
        return res.status(400).json({ 
            erro: 'Telefone inválido', 
            mensagem: 'O telefone deve ter entre 8 e 20 caracteres' 
        });
    }
  }

  try {
    // Verifica se o restaurante existe
    const [existeRestaurante] = await pool.execute('SELECT * FROM restaurante WHERE idRestaurante = ?', [restauranteId]);
    if (existeRestaurante.length === 0) {
      return res.status(404).json({ 
        erro: 'Restaurante não encontrado',
        mensagem: `Não existe restaurante com o ID ${restauranteId}`
      });
    }
    
    // Constrói a query dinamicamente
    const camposParaAtualizar = [];
    const valoresParaAtualizar = [];

    if (nome !== undefined) {
      camposParaAtualizar.push('nome = ?');
      valoresParaAtualizar.push(nome.trim());
    }
    if (tipoRestaurante !== undefined) {
      camposParaAtualizar.push('tipoRestaurante = ?');
      valoresParaAtualizar.push(tipoRestaurante.trim());
    }
    if (enderecoRestaurante !== undefined) {
      camposParaAtualizar.push('enderecoRestaurante = ?');
      valoresParaAtualizar.push(enderecoRestaurante.trim());
    }
    if (telefone !== undefined) {
      camposParaAtualizar.push('telefone = ?');
      valoresParaAtualizar.push(telefone.trim());
    }
    
    // Caso nenhum campo tenha sido enviado
    if (camposParaAtualizar.length === 0) {
      return res.status(400).json({ 
        erro: 'Nenhum campo para atualizar',
        mensagem: 'Forneça pelo menos um campo para ser atualizado'
      });
    }

    // Adiciona o ID no final
    valoresParaAtualizar.push(restauranteId);

    // Executa a atualização
    const queryUpdate = `UPDATE restaurante SET ${camposParaAtualizar.join(', ')} WHERE idRestaurante = ?`;
    await pool.execute(queryUpdate, valoresParaAtualizar);

    // Busca os dados atualizados para retornar
    const queryBusca = `SELECT 
    idRestaurante, 
    nome, 
    tipoRestaurante, 
    enderecoRestaurante, 
    telefone, 
    cnpj 
    FROM restaurante WHERE idRestaurante = ?`;
    const [restauranteAtualizado] = await pool.execute(queryBusca, [restauranteId]);

    res.json({
      mensagem: 'Restaurante atualizado com sucesso!',
      restaurante: restauranteAtualizado[0],
      camposAlterados: camposParaAtualizar.length
    });

  } catch (error) {
    console.error('Erro ao atualizar restaurante:', error);
    res.status(500).json({ erro: 'Erro interno no servidor', detalhes: error.message });
  }
});

module.exports = router;