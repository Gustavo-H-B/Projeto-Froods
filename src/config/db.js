const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return { sucess: true, message: "Conexão com o banco de dados bem-sucedida"}
    } catch (error) {
        return { sucess: false, message: `Falha na conexão: ${error.message}` };
    }
}

module.exports = { pool, testConnection };