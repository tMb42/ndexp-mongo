const mongoose = require('mongoose');

const caseHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient', // Assuming you have a 'Patient' model for general patient details
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User collection (Role: doctor)
      required: true,
    },
    visitDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    symptoms: {
      type: [
        {
          type: mongoose.Schema.Types.Mixed, // Flexible structure for symptoms
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.every((item) => typeof item === 'object');
        },
        message: 'Symptoms must be an array of objects.',
      },
    },
    diagnosis: {
      type: String,
      required: false,
    },
    treatment: {
      type: String,
      required: false,
    },
    prescription: {
      type: [String], // List of prescribed medications
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    followUpDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'casehistories', // This is the name of the collection in the database
  }
);

const CaseHistory = mongoose.model('CaseHistory', caseHistorySchema);

module.exports = CaseHistory;
