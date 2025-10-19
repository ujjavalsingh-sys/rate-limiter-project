require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const axios = require('axios');

app.use(async (req, res, next) => {
  try {
    const response = await axios.post('http://rate-limiter:4000/check', {}, {
      headers: { 'X-Forwarded-For': req.ip }
    });

    if (response.status === 200 && response.data.allowed) {
      next();
    } else {
      res.status(429).json({ error: 'Rate limit exceeded' });
    }
  } catch (err) {
    console.error('Rate limiter error:', err.message);
    res.status(500).json({ error: 'Rate limiter unavailable' });
  }
});

app.get('/', (req, res) => {
  res.json({
    service: process.env.SERVICE_NAME || 'Unknown',
    message: `Hello from ${process.env.SERVICE_NAME || 'Unknown'}`
  });
});

app.listen(PORT, () => {
  console.log(`${process.env.SERVICE_NAME} running on port ${PORT}`);
});