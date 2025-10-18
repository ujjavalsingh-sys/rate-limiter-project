require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    service: process.env.SERVICE_NAME || 'Unknown',
    message: `Hello from ${process.env.SERVICE_NAME || 'Unknown'}`
  });
});

app.listen(PORT, () => {
  console.log(`${process.env.SERVICE_NAME} running on port ${PORT}`);
});