const express = require("express");
const cors = require("cors");
const app = express();

// Configuração do CORS
app.use(cors({
  credentials: true,
  origin: "https://getapet-backend-production.up.railway.app/"
}));

// Configuração para resposta em JSON
app.use(express.json());

// Conexão com o banco de dados
// Se você tiver uma função de conexão com banco de dados, pode colocá-la aqui, por exemplo:
// const conn = require("./db/conn.js");
// conn();

// Rotas
const UserRoutes = require("./routes/UserRoutes");
const PetRoutes = require("./routes/PetRoutes");

app.use("/users", UserRoutes);
app.use("/pets", PetRoutes);

// Configuração da porta
const PORT = process.env.PORT || 5136;

app.listen(PORT, function() {
  console.log(`Servidor Online na porta ${PORT}!`);
});

module.exports = app;
