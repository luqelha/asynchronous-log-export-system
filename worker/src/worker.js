require('dotenv').config();

const rabbitmq = require('./config/rabbitmq');
const redis = require('./config/redis');
const compressLogs = require('./services/compressionService');
const JOB_STATUS = require('./constants/jobStatus');
const logger = require('./utils/logger');

async function startWorker() {
  try {
    const channel = await rabbitmq.connectRabbitMQ();
    await redis.connectRedis();

    logger.info('==================================');
    logger.info('Worker Service Started');
    logger.info(`Queue: ${process.env.QUEUE_NAME}`);
    logger.info('Waiting for jobs...');
    logger.info('==================================');

    channel.prefetch(1);

    channel.consume(
      process.env.QUEUE_NAME,
      async message => {
        if (!message) return;

        const job = JSON.parse(message.content.toString());

        logger.info(`Processing Job: ${job.jobId}`);

        await redis.client.set(
          job.jobId,
          JSON.stringify({
            status: JOB_STATUS.PROCESSING,
            progress: 20,
          }),
          {
            KEEPTTL: true,
          },
        );

        try {
          const result = await compressLogs(job.jobId);

          await redis.client.set(
            job.jobId,
            JSON.stringify({
              status: JOB_STATUS.COMPLETED,
              progress: 100,
              filename: result.zipName,
              completedAt: new Date(),
            }),
            {
              KEEPTTL: true,
            },
          );

          logger.info(`ZIP created: ${result.zipName}`);
          logger.info(`Job ${job.jobId} completed successfully.`);

          channel.ack(message);

          logger.info(`Message acknowledged for Job ${job.jobId}`);
        } catch (err) {
          await redis.client.set(
            job.jobId,
            JSON.stringify({
              status: JOB_STATUS.FAILED,
              progress: 0,
              error: err.message,
            }),
            {
              KEEPTTL: true,
            },
          );

          logger.error(`Job ${job.jobId} failed: ${err.message}`);

          channel.nack(message, false, true);
        }
      },

      {
        noAck: false,
      },
    );
  } catch (err) {
    logger.error(`Worker failed to start: ${err.message}`);
    process.exit(1);
  }
}

startWorker();
