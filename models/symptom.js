const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  category: {
    type: String, // "Mind", "Temperament", etc.
    required: true,
    unique: true,
    trim: true,
  },
  descriptions: {
    type: String, // No `unique` on arrays
    required: true,
  },
  display: {
    type: Number,
    required: true,
    default: 1,
  },
  inforce: {
    type: Number,
    required: true,
    default: 1,
  },
}, 
{
  timestamps: true,
  collection: 'symptoms',
});

const Symptom = mongoose.model('Symptom', symptomSchema);

module.exports = Symptom;
