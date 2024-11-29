const express = require('express');
const cors = require('cors');
const app = express();

// Configuração do CORS para permitir origens específicas
app.use(cors({
  origin: 'https://get-a-pet-aln.netlify.app', // Seu frontend de produção
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Caso precise enviar cookies ou autenticação via headers
}));

// Configuração para resposta em JSON
app.use(express.json());

// Servindo arquivos estáticos (se necessário)
app.use(express.static('public'));

// Rotas
const UserRoutes = require('./routes/UserRoutes');
const PetRoutes = require('./routes/PetRoutes');

app.use('/users', UserRoutes);
app.use('/pets', PetRoutes);

// Configuração do método OPTIONS para permitir pré-solicitações CORS
// Isso é importante para que o preflight de CORS seja bem-sucedido
app.options('*', cors()); // Permite preflight para todos os endpoints

// Iniciar o servidor
app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000');
});

module.exports = app;
