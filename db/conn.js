const mongoose = require('mongoose')

async function main() {
  await mongoose.connect('mongodb+srv://alan28:123@cluster0.ra1hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  console.log('Conectou com Mongoose!')
}

main().catch((err) => console.log(err))

module.exports = mongoose

