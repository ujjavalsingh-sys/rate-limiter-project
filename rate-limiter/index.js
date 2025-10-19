require('dotenv').config();
const express = require('express');
const redis = require('redis');
const app = express();

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});
redisClient.connect();

const PORT = process.env.PORT || 4000;
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT);
const WINDOW_SIZE = parseInt(process.env.WINDOW_SIZE);

app.use(express.json());

app.post('/check', async (req, res) => {
  const ip = req.ip;
  const key = `rate:${ip}`;
  const count = await redisClient.incr(key);

  if (count === 1) {
    await redisClient.expire(key, WINDOW_SIZE);
  }

  if (count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  res.status(200).json({ allowed: true });
});

app.listen(PORT, () => {
  console.log(`Rate limiter running on port ${PORT}`);
});