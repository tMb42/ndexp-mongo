const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User collection (Patient)
    required: true,
  },
  medicalHistory: {
    type: [String], // An array of strings to store medical history of lab test report
    default: [],
  },
  notes: {
    type: String, // Additional patient-specific notes
  },
  addlInfo: {
    type: [
      {
        type: mongoose.Schema.Types.Mixed, // Flexible structure for symptoms
      },
    ],
    required: false,
    validate: {
      validator: function (value) {
        return Array.isArray(value) && value.every((item) => typeof item === 'object');
      },
      message: 'Symptoms must be an array of objects.',
    },
  },
  visitHistory: [
    {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User collection (Doctor)
        required: false,
      },
      visitDate: {
        type: Date,
        required: false,
      },
      reason: {
        type: String, // Reason for the visit
      },
      prescription: {
        type: String, // Details about any prescribed medication or treatment
      },
    },
  ],
  nextAppointment: {
    type: Date, // Scheduled date for the next appointment
  }
},
{
  timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  collection: 'patients', // Collection name in the database 
});

// Virtual for populating Appointments
patientSchema.virtual('appointments', {
  ref: 'Appointment', // The model to populate
  localField: 'userId', // Field in Patient (userId)
  foreignField: 'patientId', // Field in Appointment (patientId)
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
