const express = require('express');
const cors = require('cors');

const app = express();

// Configuração do CORS para permitir origens específicas
app.use(cors({
  credentials: true,
  origin: ['https://get-a-pet-aln.netlify.app', 'http://localhost:5136']  // Permite tanto a origem de produção quanto o localhost
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
