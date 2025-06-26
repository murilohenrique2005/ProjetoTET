const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'projetoLogin'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL');
});

// Rota para cadastrar na tabela `login`
app.post('/cadastrar', (req, res) => {
  const { nome, email, senha, telefone } = req.body;

  if (!nome || !email || !senha || !telefone) {
    return res.status(400).send('Todos os campos são obrigatórios');
  }

  const sql = 'INSERT INTO login (nome, email, senha, telefone) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, email, senha, telefone], (err, result) => {
    if (err) {
      console.error('Erro ao inserir no banco:', err);
      return res.status(500).send('Erro ao salvar no banco de dados');
    }

    return res.status(200).send('Usuário cadastrado com sucesso');
  });
});

// Iniciar servidor
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor rodando em http://10.133.47.48:3000');
  });
  

