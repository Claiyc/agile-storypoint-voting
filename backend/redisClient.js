// Redis client initialization for Agile Voting backend

const { createClient } = require('redis');

// Read Redis connection options from environment variables
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
  },
  password: redisPassword,
});

redisClient.on('error', (err) => {
  console.error('[REDIS ERROR]', err);
});
redisClient.on('connect', () => {
  console.log(`[REDIS CONNECT] Connecting to redis://${redisHost}:${redisPort}`);
});
redisClient.on('ready', () => {
  console.log('[REDIS READY] Redis client is ready.');
});

redisClient.connect();

module.exports = redisClient; 