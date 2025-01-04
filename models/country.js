const mongoose = require('mongoose');

// Define the country schema
const countrySchema = new mongoose.Schema({
  country_name: {
    type: String,
    required: true,
    unique: true  // Ensures the country_name is unique
  },
  flag: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  display: {
    type: Number,
    required: true,
    default: 1 // equivalent to DataTypes.TINYINT with defaultValue: 1 in Sequelize
  },
  inforce: {
    type: Number,
    required: true,
    default: 1 // equivalent to DataTypes.TINYINT with defaultValue: 1 in Sequelize
  },
  remarks: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Country model
const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
