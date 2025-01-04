require('dotenv').config();
require('colors');

const mongoose = require('mongoose');
const countrySeeder = require('./countrySeeder');

const mongoURL = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}`;

const runSeeders = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log('Connected to MongoDB');

    // Run individual seeders
    console.log('Running Country Seeder...');
    await countrySeeder();
   

    console.log('All seeders executed successfully.'.bgWhite.green.bold);
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    mongoose.connection.close();
  }

};

runSeeders();
