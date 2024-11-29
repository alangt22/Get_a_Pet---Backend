const express = require('express');
const cors = require('cors');

const app = express();

// Configuração do CORS para permitir origens específicas
app.use(cors({
  origin: 'https://get-a-pet-aln.netlify.app/', // Substitua pelo seu frontend de produção, se necessário
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



// Configuração para resposta em JSON
app.use(express.json());

// Servindo arquivos estáticos
app.use(express.static('public'));

// Rotas
const UserRoutes = require('./routes/UserRoutes');
const PetRoutes = require('./routes/PetRoutes');

app.use('/users', UserRoutes);
app.use('/pets', PetRoutes);

// Iniciar o servidor
app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000');
});

module.exports = app;
