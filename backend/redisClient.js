// Redis client initialization for Agile Voting backend

const redis = require('redis');

// Create and connect Redis client
const redisClient = redis.createClient();
redisClient.connect();

module.exports = redisClient; 