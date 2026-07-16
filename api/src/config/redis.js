const { createClient } = require('redis');
const logger = require('../utils/logger');

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.on('error', err => {
  logger.error(err);
});

async function connectRedis() {
  await client.connect();
  logger.info('Redis Connected');
}

module.exports = {
  client,
  connectRedis,
};
