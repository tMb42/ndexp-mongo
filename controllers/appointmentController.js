const Appointment = require('../models/appointment');
const User = require('../models/user');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, time, reason, notes } = req.body;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    console.log("patient", patient);
    if (!patient) {
      return res.status(404).json({
        success: 0,
        message: 'Patient not found!',
      });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: 0,
        message: 'Doctor not found!',
      });
    }

    const newAppointment = new Appointment({
      patientId,
      appointmentDate,
      appointmentTime: time,
      status: 'scheduled', // Default status
      doctorId,
      reasonForVisit: sentenceCase(reason),
      notes: sentenceCase(notes)
    });

    const savedAppointment = await newAppointment.save();

    return res.status(201).json({
      success: 1,
      message: 'Appointment created successfully',
      data: savedAppointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while creating the appointment',
    });
  }
};
