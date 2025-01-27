const mongoose = require('mongoose');
require('dotenv').config();
require('colors');

// Build the MongoDB connection string dynamically
const getMongoURL = () => {
  const dbName = process.env.MONGO_DB_NAME;
  if (process.env.NODE_ENV === 'production') {
    // Append the database name to the MongoDB Atlas connection string
    return `${process.env.MONGO_ATLAS_URI}/${dbName}?retryWrites=true&w=majority`;
  } else {
    // Use local MongoDB connection string for development
    return `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_DB_PORT}/${dbName}`;
  }
};
const mongoURL = getMongoURL();

// MongoDB connection function
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log(`Connected to MongoDB on Port ${process.env.MONGO_DB_PORT} successfully.`.bgYellow.green.bold);
  } catch (err) {
    console.error('Error connecting to MongoDB'.bgWhite.red.bold);
    console.error(err);
    process.exit(1); // Exit if the database connection fails
  }
};

// Function to sync indexes
const syncIndexes = async (models) => {
  try {
    for (const modelName in models) {
      if (models.hasOwnProperty(modelName)) {
        const model = models[modelName];
        await model.syncIndexes();
        console.log(`Indexes synced for model: ${modelName}`.bgCyan.black);
      }
    }
  } catch (err) {
    console.error('Error syncing indexes: '.bgRed.white, err.message);
  }
};

// Export the functions
module.exports = { connectDB, syncIndexes, getMongoURL };