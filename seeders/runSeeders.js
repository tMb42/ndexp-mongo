// SuperindendingEngineereded/seeders/runSeeders.js

require('dotenv').config();
require('colors');
const mongoose = require('mongoose');
const { getMongoURL } = require('../mongoDB/config'); // Adjust the path based on your file structure
const countrySeeder = require('./countrySeeder');
const roleSeeder = require('./roleSeeder');

const runSeeders = async () => {
  const mongoURL = getMongoURL(); // Get the mongoURL dynamically

  try {
    await mongoose.connect(mongoURL);
    console.log(`Connected to MongoDB at ${mongoURL}`);

    // Run individual seeders
    console.log('Running Country Seeder...');
    await countrySeeder();
    console.log('Running Role Seeder...');
    await roleSeeder();

    console.log('All seeders executed successfully.'.bgWhite.green.bold);
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    mongoose.connection.close();
  }
};

runSeeders();
