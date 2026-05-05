const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

require('dotenv').config()

const server = express();

server.use(cors());
server.use(express.json());

// Configuração do banco de dados
const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then(connection => {
        console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release(); // Libera a conexão de volta para o pool
    })
    .catch(error => {
        console.error('❌ Falha ao conectar ao banco de dados MySQL:');
        console.error(error.message);
    });

// Rota GET - Listar todos
server.get('/pessoas', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM pessoas');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota POST - Criar
server.post('/pessoas', async (req, res) => {
    const {
        nome_razao_social, nome_social_fantasia, cep, endereco,
        numero, bairro, cidade, estado, pais, documento, tipo, email
    } = req.body;

    const query = `
        INSERT INTO pessoas 
        (nome_razao_social, nome_social_fantasia, cep, endereco, numero, bairro, cidade, estado, pais, documento, tipo, email) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        nome_razao_social,
        nome_social_fantasia || null,
        cep || null,
        endereco || null,
        numero || null,
        bairro || null,
        cidade || null,
        estado || null,
        pais || 'Brasil',
        documento,
        tipo,
        email || null
    ];

    try {
        const [result] = await pool.execute(query, values);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota PUT - Atualizar
server.put('/pessoas/:id', async (req, res) => {
    const { id } = req.params;
    const {
        nome_razao_social, nome_social_fantasia, cep, endereco,
        numero, bairro, cidade, estado, pais, documento, tipo, email
    } = req.body;

    const query = `
        UPDATE pessoas 
        SET nome_razao_social = ?, nome_social_fantasia = ?, cep = ?, endereco = ?, 
            numero = ?, bairro = ?, cidade = ?, estado = ?, pais = ?, documento = ?, 
            tipo = ?, email = ? 
        WHERE id = ?
    `;

    const values = [
        nome_razao_social, nome_social_fantasia || null, cep || null, endereco || null,
        numero || null, bairro || null, cidade || null, estado || null, pais || 'Brasil',
        documento, tipo, email || null, id
    ];

    try {
        const [result] = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota DELETE - Remover
server.delete('/pessoas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM pessoas WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//-------------------- Inicialização --------------------
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});


//-------------------- PRODUTOS --------------------


//Get - ver
server.get('/produtos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


//post - adicionar
server.post('/produtos', async (req, res) => {
    const {
        nome, descricao, preco, estoque, categoria
    } = req.body;

    const query = `
        INSERT INTO produtos 
        (nome, descricao, preco, estoque, categoria) 
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        nome,
        descricao,
        preco || null,
        estoque,
        categoria || null
    ];

    try {
        const [result] = await pool.execute(query, values);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


//put - atualizar
server.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const {
        nome, descricao, preco, estoque, categoria
    } = req.body;

    const query = `
        UPDATE produtos 
        SET nome = ?, descricao = ?, preco = ?, estoque = ?, 
            categoria = ?
        WHERE id = ?
    `;

    const values = [
        nome,
        descricao,
        preco || null,
        estoque,
        categoria || null,
        id
    ];

    try {
        const [result] = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }
        res.json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//delete - deletar
server.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM produtos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro não encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});