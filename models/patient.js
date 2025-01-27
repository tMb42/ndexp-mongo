const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference the User collection (Patient)
    required: true,
  },
  medicalHistory: {
    type: [String], // An array of strings to store medical history
    default: [],
  },
  notes: {
    type: String, // Additional patient-specific notes
  },
  visitHistory: [
    {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User collection (Doctor)
        required: [true, 'Doctor ID is required'],
      },
      visitDate: {
        type: Date,
        required: [true, 'Visit date is required'],
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
  },
},
{
  timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  collection: 'patients', // Collection name in the database
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
