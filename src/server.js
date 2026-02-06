const express = require('express');
const { pool } = require('./config/db');
const app = express();

const restauranteRoutes = require('./routes/restaurantes');
const clienteRoutes = require('./routes/clientes');
const alimentoRoutes = require('./routes/alimentos');
const pedidosRoutes = require('./routes/pedidos');
const itensPedidosRoutes = require('./routes/itensPedidos');
const relatorioRoutes = require('./routes/relatorios');

app.use('/restaurantes', restauranteRoutes);
app.use('/clientes', clienteRoutes);
app.use('/alimentos', alimentoRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/itens-pedidos', itensPedidosRoutes);
app.use('/relatorios', relatorioRoutes);



module.exports = app;