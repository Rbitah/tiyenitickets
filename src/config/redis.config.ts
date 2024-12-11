import Redis from 'ioredis';

export const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

// Example usage
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});
