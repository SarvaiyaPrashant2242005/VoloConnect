// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database

const db = require("./config/database")
const connection = require("./models")
connection.syncDB()

// Routes
const routes = require('./routes');
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Database connection and server start
const PORT = process.env.PORT || 3001;

app.get("/" , (req,res) => {
    res.send("Welcome to the Volo - Connect");
})

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});



// sequelize.authenticate()
//   .then(() => {
//     console.log('Database connection established successfully.');
//     return sequelize.sync({ force: true }); // Set force: true to drop tables and recreate (for development)
//   })
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//       console.log(`API available at http://localhost:${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//     process.exit(1);
//   });
