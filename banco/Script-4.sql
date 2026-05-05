-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS exemplos;
USE exemplos;

-- Criação da tabela pessoa
CREATE TABLE IF NOT EXISTS pessoa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_razao_social VARCHAR(255) NOT NULL,
    nome_social_fantasia VARCHAR(255),
    cep CHAR(8),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),
    pais VARCHAR(50) DEFAULT 'Brasil',
    documento VARCHAR(14) NOT NULL,
    tipo ENUM('CPF', 'CNPJ') NOT NULL,
    email VARCHAR(150),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (documento)
);