// aqui ficam as configurações da aplicação, como rotas e middlewares

const express = require('express'); // importação do express
const app = express(); // atribuição do express à variável app

//middlewares globais - executados em todas as requisições
//middleware funções que interceptam requisições/respostas para adicionar funcionalidades
app.use(express.json()); // para interpretar JSON no corpo das requisições

// rota padrão
app.get('/', (req, res) => res.send(
    { 
        status: 'ok', 
        message: 'API funcionando'
    }
)); // rota de teste

// exemplo de rota com parâmetro 'hello' após a url padrão
app.get('/hello', (req, res) => // req: requisição, res: resposta
    res.send(
        {
        message:'Hello, World!'
        }
    ) // resposta com mensagens simples (string)
);

app.get('/professores', (req, res) =>
    res.send(
        {
            nome: 'Lucas Sasse',
            disciplinas: ['Programação de Aplicativos', 'Modelagem de Sistemas']
        }
    ) // respostas com informações em arrey simples
);

// rota para obter lsta de alunos de determinada disciplina
app.get('/alunos/programacao-de-aplicativos', (req, res) =>
    res.send(
        { 
            alunos: ['Joao', 'Luan', 'Lucas'] 
        }
    )
);

app.get('/alunos/programacao-de-aplicativos/notas', (req, res) => 
    res.send({
        alunos: [
            {nome: 'Daniel', nota: 8.5},
            {nome: 'Joao', nota: 9.0},
            {nome: 'Luan', nota: 9.0},
            {nome: 'Lucas', nota: 8.0},
        ]
    })
);

// aqui abaixo, podem ser adicionadas outras rotas conforme necessário

// middleware de tratamento de erro simples
app.use((err, req, res, next) => {
    console.error(err); // log do erro no console - para fins de depuração
    res.status(err.status || 500).json({error: err.message || 'Erro interno' });
});

module.exports = app;