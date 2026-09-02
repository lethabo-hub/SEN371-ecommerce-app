const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./src/config/db');
const createApp = require('./src/app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`ShopWave API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

startServer();
