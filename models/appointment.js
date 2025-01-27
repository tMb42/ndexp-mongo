const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the Patient collection
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User collection (Role: doctor)
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    reasonForVisit: {
      type: String,
      required: [true, 'Reason for visit is required'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'], // Add all valid status values
      default: 'scheduled',
    },
    notes: {
      type: String, // Additional notes related to the appointment
    },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
    collection: 'appointments', // Collection name in the database
  }
);

// Middleware to update `updated_at`
appointmentSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
