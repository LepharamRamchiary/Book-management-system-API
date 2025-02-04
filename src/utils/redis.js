import Redis from 'ioredis';
import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

const redisClient = new Redis({
  host: process.env.REDIS_HOST ,
  port: process.env.REDIS_PORT ,
  password: process.env.REDIS_PASSWORD
});

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Utility function to cache data
export const cacheData = async (key, data, expiration = 3600) => {
  try {
    await redisClient.setex(key, expiration, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

// Utility function to get cached data
export const getCachedData = async (key) => {
  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
};

// Utility function to delete cache
export const deleteCacheKey = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Error deleting cache key:', error);
  }
};

export default redisClient;