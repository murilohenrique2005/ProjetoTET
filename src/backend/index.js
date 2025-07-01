const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
 
const app = express();
const port = 3000;
 
app.use(cors());
app.use(express.json()); // Para ler JSON no body
 
// Configuração da conexão MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'projetoLogin',
});
 
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});
 
// Rota POST para cadastrar cliente
app.post('/logins', (req, res) => {
  console.log('Requisição recebida com body:', req.body);
 
  const { nome, email, senha, telefone, foto_perfil, tipo } = req.body;
 
  if (!nome || !email || !senha || !telefone) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
 
  const query = 'INSERT INTO logins (nome, email, senha, telefone, foto_perfil, tipo) VALUES (?, ?, ?, ?, ?, ?)';
  const fotoBuffer = foto_perfil ? Buffer.from(foto_perfil, 'base64') : null;
  const tipoUsuario = tipo || 'usuario';
 
  db.query(query, [nome, email, senha, telefone, fotoBuffer, tipoUsuario], (error, results) => {
    if (error) {
      console.error('Erro ao inserir no MySQL:', error);
      return res.status(500).json({ message: 'Erro ao cadastrar cliente.' });
    }
 
    console.log('Cliente cadastrado com sucesso:', results);
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });
  });
});
 
// Rota POST para login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
 
  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }
 
  const query = 'SELECT nome, email FROM logins WHERE email = ? AND senha = ? LIMIT 1';
 
  db.query(query, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro ao consultar MySQL:', err);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }
 
    if (results.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }
 
    // Usuário encontrado
    const user = results[0];
    return res.json({ user });
  });
});
 
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

app.post('/cadastrar-projeto', (req, res) => {
  const {
    nome,
    descricao,
    valor,
    telefone,
    numeroPessoas,
  } = req.body;

  // Validações básicas
  if (!nome || !descricao || !valor || !telefone) {
    return res.status(400).json({ message: 'Campos obrigatórios estão faltando.' });
  }

  const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
  const qtdPessoas = parseInt(numeroPessoas || '1'); // padrão 1 se vazio

  const query = `
    INSERT INTO projetos (
      nome_projeto,
      descricao,
      valor,
      data_criacao,
      telefone,
      qtd_pessoas
    ) VALUES (?, ?, ?, NOW(), ?, ?)
  `;

  db.query(
    query,
    [nome, descricao, valorNumerico, telefone, qtdPessoas],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir projeto:', err);
        return res.status(500).json({ message: 'Erro ao cadastrar projeto.' });
      }

      console.log('Projeto cadastrado com sucesso:', result);
      res.status(201).json({ message: 'Projeto cadastrado com sucesso!' });
    }
  );
});


 