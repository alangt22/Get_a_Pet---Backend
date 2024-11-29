const mongoose = require("mongoose");

async function main() {
    try {
        mongoose.set("strictQuery", true);


        const uri = "mongodb+srv://alan28:123@cluster0.ra1hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

        await mongoose.connect(uri);

        console.log("Conectado ao banco de dados com sucesso");
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error.message);
    }
}

module.exports = main;




