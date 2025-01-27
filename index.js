require('dotenv').config();
require('colors');
require('./helper/changeCase');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routerIndex = require('./routes/index.js');
const { logReqRes } = require('./middleware/index.js');
const { connectDB, syncIndexes } = require('./mongoDB/config.js');
const models = require('./models/index.js'); // Adjust path to your models directory

const app = express();

app.use(express.json());

// Fix CORS error
app.use(cors({
  origin: process.env.FRONT_APP,
}));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logReqRes('log.txt'));

// Routes  
app.use('/api', routerIndex); // Use the consolidated router

// App server connection
const port = process.env.APP_SERVER_PORT || 3000;

// Connect to MongoDB and sync indexes
const startServer = async () => {
  await connectDB(); // Connect to MongoDB
  await syncIndexes(models); // Sync indexes
  app.listen(port, () => {
    console.log(`Express Server Running on port ${port} for NodeJs-Express-MongoDB-API @tMb`.rainbow.italic.bgWhite.bold);
  });
};

startServer();
