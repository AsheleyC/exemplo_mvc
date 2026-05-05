const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root', // Alterar para o usuário correspondente
    password: '', // Alterar para a senha correspondente
    database: 'exemplos'
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
app.get('/pessoas', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM pessoas');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota POST - Criar
app.post('/pessoas', async (req, res) => {
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
app.put('/pessoas/:id', async (req, res) => {
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
app.delete('/pessoas/:id', async (req, res) => {
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

app.post('/addProdutos', async (req, res) => {
    try {
        const { nome, descricao, preco, estoque, categoria } = req.body;

        const sql = `INSERT INTO produtos (nome, descricao, preco, estoque, categoria) VALUES (?,?,?,?,?)`
        const [resultado] = await pool.query(sql, [nome, descricao, preco, estoque, categoria]);
        if (resultado.affectedRows == 1) {
            return {
                resposta: "Produto adicionado com sucesso!"
            }
        } else {
            return {
                resposta: "Não foi possível adicionar o produto"
            }
        }

    } catch (error) {
        console.log(`O erro foi: ${error}`)
    }
})

app.put('/editProdutos', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, estoque, categoria } = req.body;

        const sql = `UPDATE produtos set nome = ?, descricao=?, preco=?, estoque=? categoria=? WHERE id= ?`;
        const [resultado] = await pool.query(sql, [nome, descricao, preco, estoque, categoria]);
        if (resultado.affectedRows == 1) {
            return{
                resposta: "Produto atualizado"
            }
        } else {
            return{
                resposta: "Erro ao atualizar o produto"
            }
        };
    } catch (error) {
        console.log(`O erro foi: ${error}`)
    }
})

// Inicialização
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});