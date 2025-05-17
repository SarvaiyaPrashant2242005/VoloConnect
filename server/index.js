const express = require('express');
const cors = require('cors');
const app = require('./app');
require('dotenv').config();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://voloconnect-client.onrender.com'] 
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'user-id'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});