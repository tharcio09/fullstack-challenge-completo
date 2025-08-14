// src/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const connect = async () => {
    try {
      mongoose.set('strictQuery', true);

      await mongoose.connect(process.env.MONGO_URI);

      console.log('MongoDB conectado com sucesso');
    } catch (err) {
      console.error('Erro ao conectar no MongoDB:', err.message);
      console.log('Tentando reconectar em 5 segundos...');
      setTimeout(connect, 5000);
    }
  };

  // Primeira tentativa
  connect();

  // Eventos do Mongoose
  mongoose.connection.on('connected', () => {
    console.log('Conexão com MongoDB estabelecida');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Erro na conexão com MongoDB: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Conexão com MongoDB perdida. Tentando reconectar...');
    connect();
  });
};

module.exports = connectDB;
