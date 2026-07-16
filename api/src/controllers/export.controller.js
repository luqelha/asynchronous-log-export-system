const generateJobId = require('../utils/jobGenerator');
const rabbitmq = require('../config/rabbitmq');
const redis = require('../config/redis');
const JOB_STATUS = require('../constants/jobStatus');

exports.exportLogs = async (req, res, next) => {
  try {
    const channel = rabbitmq.getChannel();
    const jobId = generateJobId();

    await redis.client.set(
      jobId,
      JSON.stringify({
        status: JOB_STATUS.PENDING,
        progress: 0,
        createdAt: new Date(),
      }),
      {
        EX: 86400,
      },
    );

    const job = {
      jobId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      createdAt: new Date().toISOString(),
      status: JOB_STATUS.PENDING,
    };

    const success = channel.sendToQueue(process.env.QUEUE_NAME, Buffer.from(JSON.stringify(job)), {
      persistent: true,
    });

    if (!success) {
      throw new Error('Failed publish job!');
    }

    return res.status(202).json({
      success: true,
      message: 'The job was successfully sent to RabbitMQ.',
      data: {
        jobId,
        status: JOB_STATUS.PENDING,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const status = await redis.client.get(jobId);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Job not found!',
      });
    }

    return res.json({
      success: true,
      message: 'Job status retrieved successfully.',
      data: JSON.parse(status),
    });
  } catch (err) {
    next(err);
  }
};
