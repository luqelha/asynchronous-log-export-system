require('dotenv').config();

const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect({
    protocol: 'amqp',
    hostname: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });

  channel = await connection.createChannel();

  await channel.assertQueue(process.env.QUEUE_NAME, {
    durable: true,
  });

  return channel;
}

function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel has not been initialized.');
  }

  return channel;
}

module.exports = {
  connectRabbitMQ,
  getChannel,
};
