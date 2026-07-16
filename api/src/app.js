require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');

const exportRoutes = require('./routes/export.routes');
const rabbitmq = require('./config/rabbitmq');
const redis = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/export', exportRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await rabbitmq.connectRabbitMQ();
    await redis.connectRedis();

    app.listen(PORT, () => {
      logger.info(`API Gateway running on port ${PORT}`);
    });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

start();
