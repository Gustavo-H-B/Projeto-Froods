const express = require('express');
const { cpf } = require('cpf-cnpj-validator');
const { pool } = require('../config/db');
const router = express.Router();

// --------------------------------------GET---------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM cliente');
    if (rows.length === 0) {
        return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
        res.json(rows);
    } catch (error) {
        console.error('Erro ao consultar clientes: ', error);
        res.status(500).json({erro: 'Erro ao consultar o cliente', detalhes: error.message});
    }
});

router.get('/:id', async (req, res) => {
    const idCliente = req.params.id;
    try {
        const[rows] = await pool.execute('SELECT * FROM cliente WHERE idCliente = ?', [idCliente]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Erro ao consultar o cliente:', error);
    res.status(500).json({ erro: 'Erro ao consultar o cliente', detalhes: error.message });
  }
});

// --------------------------------------DELETE------------------------------------------------------
router.delete('/:id/deletar', async (req, res) => {
  const clienteId = req.params.id;
  
  // Primeiro verifica se o cliente existe
  try {
    const [cliente] = await pool.execute('SELECT * FROM cliente WHERE idCliente = ?', [clienteId]);
    if (cliente.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    const [movimentacoes] = await pool.execute('SELECT COUNT(*) as total FROM pedidos WHERE idCliente = ?', [clienteId]);
    
    if (movimentacoes[0].total > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível excluir permanentemente o cliente',
        message: `Existem ${movimentacoes[0].total} pedidos vinculados a este cliente no sistema. Para segurança dos dados, a exclusão foi bloqueada.`
      });
    }

    // Se não há pedidos vinculados, procede com a exclusão permanente
    const [result] = await pool.execute('DELETE FROM cliente WHERE idCliente = ?', [clienteId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    // Retorna a mensagem de vitória com o seu aviso de irreversibilidade
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

// --------------------------------------POST--------------------------------------------------------
router.post('/adicionar', async (req, res) => {
    const { nome, enderecoCliente, telefone, cpf: cpfEnviado } = req.body || {};

    // Verifica se está vazio o nome e o tamanho
    if (nome !== undefined) {
      if (nome.trim() === '') {
        return res.status(400).json({ erro: 'O nome não pode ser vazio' });
      }
      if (nome.trim().length > 200) {
        return res.status(400).json({ erro: 'Nome muito longo (máx 200)' });
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

    // Verifica se tem algo e o tamanho da endereço
    if (enderecoCliente !== undefined) {
      if (enderecoCliente.trim() === '') {
        return res.status(400).json({ erro: 'O endereço não pode ser vazio' });
      }
      if (enderecoCliente.trim().length > 300) {
        return res.status(400).json({ erro: 'Endereço muito longa (máx 300)' });
      }
    }

    if (!cpf.isValid(cpfEnviado)) {
        return res.status(400).json({
            erro: 'cpf inválido',
            messagem: 'Por favor digite um cpf válido'
        });
    }

    try {
        const [clienteExiste] = await pool.execute('SELECT * FROM cliente WHERE cpf = ?', [cpfEnviado]);
        if (clienteExiste.length > 0) {
            return res.status(409).json({ erro: 'Cliente já existe com este CPF' });
        }

        const query = `
        INSERT INTO cliente (
        nome, 
        enderecoCliente, 
        telefone, 
        cpf
        ) 
        VALUES (?, ?, ?, ?)`;
        const [result] = await pool.execute(query, [nome.trim(), enderecoCliente, telefone, cpfEnviado]);


        res.status(201).json({ messagem: 'Cliente criado com sucesso', id: result.insertId });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar cliente', detalhes: error.message });
    }
});

// --------------------------------------PUT---------------------------------------------------------
router.put('/:id/atualizar', async (req, res) => {
  const clienteId = req.params.id;
  const {
    nome, 
    enderecoCliente, 
    telefone, 
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

  // Verifica se tem algo e o tamanho da endereço
  if (enderecoCliente !== undefined) {
    if (enderecoCliente.trim() === '') {
      return res.status(400).json({ erro: 'O endereço não pode ser vazio' });
    }
    if (enderecoCliente.trim().length > 300) {
      return res.status(400).json({ erro: 'Endereço muito longa (máx 300)' });
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

  try {
    // Verifica se o cliente existe
    if (clienteId) {
      const [restauranteProvedor] = await pool.execute('SELECT * FROM cliente WHERE idCliente = ?', [clienteId]);
      if (restauranteProvedor.length === 0) {
        return res.status(404).json({ 
          erro: 'Cliente não encontrado',
          messagem: `Não existe o cliente com o ID ${clienteId}`
        });
      }
    }
    
    // Constrói a quary de atualização dinamicamente baseado nos campos fornecidos
    const camposParaAtualizar = [];
    const valoresParaAtualizar = [];

    if (nome !== undefined) {
      camposParaAtualizar.push('nome = ?');
      valoresParaAtualizar.push(nome.trim());
    }
    if (enderecoCliente !== undefined) {
      camposParaAtualizar.push('enderecoCliente = ?');
      valoresParaAtualizar.push(enderecoCliente);
    }
    if (telefone !== undefined) {
      camposParaAtualizar.push('telefone = ?');
      valoresParaAtualizar.push(telefone);
    }
    
    // Caso nenhum campo foi fornecido para atualização: rejeitar
    if (camposParaAtualizar.length === 0) {
      return res.status(400).json({ 
        erro: 'Nenhum campo para atualizar',
        messagem: 'Forneça pelo menos um campo para ser atualizado'
      });
    }

    // Adiciona o ID do cliente no final dos valores
    valoresParaAtualizar.push(clienteId);

    // Executa a atualização
    const queryUpdate = `UPDATE cliente SET ${camposParaAtualizar.join(', ')} WHERE idCliente = ?`;
    const [result] = await pool.execute(queryUpdate, valoresParaAtualizar);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    // Busca o cliente atualizado com as informações
    const queryCliente = `
    SELECT 
        idCliente, 
        nome, 
        enderecoCliente, 
        telefone, 
        cpf 
    FROM cliente 
    WHERE idCliente = ?
`;

    const [clienteAtualizado] = await pool.execute(queryCliente, [clienteId]);

    // Menssagem de vitoria eu consegui!!!!!!
    res.json({
      messagem: 'Cliente atualizado com sucesso',
      cliente: clienteAtualizado[0],
      camposAtualizados: camposParaAtualizar.length
    });

  } catch (error) {
    console.error('Erro ao atualizar o cliente:', error);
    res.status(500).json({ erro: 'Erro ao atualizar o cliente', detalhes: error.message });
  }
});

module.exports = router;