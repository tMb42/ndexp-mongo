const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    medName: {
      type: String,
      unique: true,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    kingdom: {
      type: [String],
      trim: true,
      default: null,
    },
    family: {
      type: [String],
      trim: true,
      default: null,
    },
    miasm: {
      type: [String],
      trim: true,
      default: null,
    },
    temperament: {
      type: [String],
      trim: true,
      default: null,
    },
    diathisis: {
      type: [String],
      trim: true,
      default: null,
    },
    thermalReaction: {
      type: [String],
      trim: true,
      default: null,
    },
    personility: {
      type: [String],
      trim: true,
      default: null,
    },
    mind: {
      type: [String],
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'medications', // This is the name of the collection in the database
  }
);
// Middleware to update `updated_at`
medicationSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Create and export the Medication model
const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;