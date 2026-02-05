const express = require('express');
const app = express();
const { testConnection } = require('./config/db');
const serverRoutes = require('./server');

app.use(express.json());
app.get('/', (req, res) => res.send({ status: 'ok', message: 'API funcionando'}
)); // rota de teste

// uso das rotas definidas em sever.js
app.use('/', serverRoutes);

async function verificarDB() {
    const resultado = await testConnection();
    console.log(`Sucesso? ${resultado.sucess} e Menssagem: ${resultado.message}`)
}
verificarDB();

module.exports = app;