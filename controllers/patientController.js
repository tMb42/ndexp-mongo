const Patient = require('../models/patient');
const User = require('../models/user');
const Role = require('../models/role');

exports.createAppointment = async (req, res) => {
    try {
      const { patientId, doctorId, appointmentDate, reason } = req.body;
  
      const patient = await User.findById(patientId);
  
      if (!patient) {
        return res.status(404).json({
          success: 0,
          message: 'Patient not found!',
        });
      }
  
      // Create new appointment
      const newAppointment = {
        userId: patientId,
        appointmentDate,
        reason,
        status: 'scheduled', // Default status
        doctorId: patientId,
      };
  
      // Add appointment to the patient's appointments array
      patient.appointments.push(newAppointment);
      await patient.save();
  
      return res.status(201).json({
        success: 1,
        message: 'Appointment scheduled successfully!',
        data: patient,
      });
    } 
    catch (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({
        success: 0,
        message: 'An error occurred while scheduling the appointment.',
      });
    }
};
  
exports.updateAppointmentStatus = async (req, res) => {
    try {
      const { patientId, appointmentId, status } = req.body;
  
      // Validate status
      if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: 0,
          message: 'Invalid status value!',
        });
      }
  
      const patient = await Patient.findById(patientId);
  
      if (!patient) {
        return res.status(404).json({
          success: 0,
          message: 'Patient not found!',
        });
      }
  
      // Find and update the appointment
      const appointment = patient.appointments.id(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: 0,
          message: 'Appointment not found!',
        });
      }
  
      appointment.status = status; // Update the appointment's status
      await patient.save();
  
      return res.status(200).json({
        success: 1,
        message: 'Appointment status updated successfully!',
        data: appointment,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return res.status(500).json({
        success: 0,
        message: 'An error occurred while updating the appointment status.',
      });
    }
};

exports.getAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).populate('appointments.doctorId', 'name email mobile_no');

    if (!patient) {
      return res.status(404).json({
        success: 0,
        message: 'Patient not found!',
      });
    }

    return res.status(200).json({
      success: 1,
      data: patient.appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while fetching appointments.',
    });
  }
};
  
exports.getPatientDetails = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Fetch patient with populated doctor information
        const patient = await Patient.findById(patientId)
            .populate('userId', 'name dob gender mobile_no') // Populate patient details
            .populate('visitHistory.doctorId', 'name email mobile_no'); // Populate doctor details in visitHistory

        if (!patient) {
            return res.status(404).json({
                success: 0,
                message: 'Patient not found!',
            });
        }
        console.log('Patient details:', patient);
        
        return res.status(200).json({
            success: 1,
            data: patient,
        });
    } catch (error) {
        console.error('Error fetching patient details:', error);
        return res.status(500).json({
            success: 0,
            message: 'An error occurred while fetching patient details.',
        });
    }
};

exports.getAllDoctors = async (req, res) => {
  try {
    // Find the role ID for "users having role as doctor"
    const doctorRole = await Role.findOne({ name: 'doctor' });

    if (!doctorRole) {
      return res.status(404).json({
        success: 0,
        message: 'Doctor role not found.',
      });
    }
    // Find all users with the "doctor" role
    const doctors = await User.find({ roles: doctorRole._id });
      const doctorsData = doctors.map((dr) => ({
        id: dr._id,
        doctor_name: dr.name, 
        display: dr.display, 
        inforce: dr.inforce, 
        remarks: dr.remarks,  
        created_at: dr.created_at,  
        updated_at: dr.updated_at, 
      }));
    

    return res.status(200).json({
      success: 1,
      doctorsData: doctorsData,
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while fetching doctors.',
    });
  }
};
