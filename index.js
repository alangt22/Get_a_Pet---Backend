const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors({
  origin: 'https://get-a-pet-aln.netlify.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
}));


app.use(express.json());


app.use(express.static('public'));

// Rotas
const UserRoutes = require('./routes/UserRoutes');
const PetRoutes = require('./routes/PetRoutes');

app.use('/users', UserRoutes);
app.use('/pets', PetRoutes);


app.options('*', cors()); 

app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000');
});

module.exports = app;
