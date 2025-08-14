require('dotenv').config();
const connectDB = require('./src/db');
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}/graphql`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err.message);
    process.exit(1);
  }
})();
