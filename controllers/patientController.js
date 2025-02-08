const Patient = require('../models/patient');
const User = require('../models/user');
const Role = require('../models/role');
const CaseHistory = require('../models/casehistory');
const Appointment = require('../models/appointment');
const PatientResource = require('../resources/PatientResource');
const { formatDate, calculateAge } = require('../helper/dateHelper');
const UserResource = require('../resources/UserResource');
const UserCollection = require('../resources/UserCollection');

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

exports.getAllPatients = async (req, res) => {
  try {
    const patientRole = await Role.findOne({ name: 'patient' });

    if (!patientRole) {
      return res.status(404).json({
        success: 0,
        message: 'Patient role not found.',
      });
    }

    // Fetch patients and populate roles + appointments
    const patients = await User.find({ roles: patientRole._id })
    .populate('roles')
    .populate('appointments');
    
    // Map each patient with their respective appointments
    const formattedPatients = patients.map(patient => {
      return new UserResource(patient, patient.appointments).toJSON();
    });

    res.json({
      success: 1,
      patientsData: formattedPatients  
    });

  } catch (error) {
    console.error('Error fetching patient data:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while fetching patient data.',
    });
  }
};

exports.getAllSeduledPatients = async (req, res) => {
  try {
    const patientRole = await Role.findOne({ name: 'patient' });

    if (!patientRole) {
      return res.status(404).json({
        success: 0,
        message: 'Patient role not found.',
      });
    }

    // Fetch patients and populate roles + appointments
    const patients = await User.find({ roles: patientRole._id })
    .populate('roles')
    .populate('appointments');
    
    // Map each patient with their respective appointments
    const formattedPatients = patients.map(patient => {
      return new UserResource(patient, patient.appointments).toJSON();
    });

    res.json({
      success: 1,
      patientsData: formattedPatients  
    });

  } catch (error) {
    console.error('Error fetching patient data:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while fetching patient data.',
    });
  }
};


exports.getAllPatientDetails = async (req, res) => {
  try {
    const { page, per_page, orderBy, sort_by } = req.query;

    // Convert pagination values to integers
    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(per_page);

    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * itemsPerPage;

    // Fetch sorted and paginated patients
    const patients = await Patient.find()
      .populate({
        path: 'userId',  // Referencing the User collection
        select: 'name gender dob mobile_no email photo',
      })
      .sort({ [sort_by]: orderBy === 'asc' ? 1 : -1 })  // Sorting by the specified field
      .skip(skip)
      .limit(itemsPerPage);

    // Count total patients
    const total_patients = await Patient.countDocuments();
    const total_pages = Math.ceil(total_patients / itemsPerPage);

    // Response
    return res.status(200).json({
      success: 1,
      dataPatients: patients.map(x => new PatientResource(x).toJSON()),
      total_patients,
      total_pages,
      current_page: pageNumber,
      itemsPerPage,
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while fetching patients.',
    });
  }
};

exports.savePatientsCaseHistory = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      visitDate,
      symptoms,
      diagnosis,
      treatment,
      prescription,
      notes,
      followUpDate,
    } = req.body;

    // Parse symptoms if it's a JSON string
    let parsedSymptoms = symptoms;
    if (typeof symptoms === 'string') {
      try {
        parsedSymptoms = JSON.parse(symptoms);
      } catch (error) {
        return res.status(400).json({
          success: 0,
          message: 'Invalid JSON format for symptoms.',
        });
      }
    }

    // Ensure symptoms is an array
    if (!Array.isArray(parsedSymptoms)) {
      return res.status(400).json({
        success: 0,
        message: 'Symptoms must be an array.',
      });
    }

    // Create a new CaseHistory document
    const newCaseHistory = new CaseHistory({
      patientId,
      doctorId,
      visitDate: visitDate || Date.now(),
      symptoms: parsedSymptoms, // Save parsed symptoms
      diagnosis,
      treatment,
      prescription,
      notes,
      followUpDate,
    });

    // Save to MongoDB
    const savedCaseHistory = await newCaseHistory.save();
    
    const caseHistories = await CaseHistory.find({ patientId }) // Fetch case histories for the given patientId
      .populate('doctorId', 'name') // Populate doctor information
      .sort({ createdAt: -1 }); // Sort by date descending

    
    res.status(201).json({
      success: 1,
      message: 'Case history saved successfully.',
      CaseHistoryData: caseHistories,
    });
  } catch (error) {
    console.error('Error saving case history:', error);
    res.status(500).json({
      success: 0,
      message: 'Failed to save case history.',
      error: error.message,
    });
  }
};

exports.getPatientsAllCaseHistory = async (req, res) => {
  const { patientId } = req.body; // Extract patientId from the payload

  if (!patientId) {
    return res.status(400).json({ success: 0, message: 'Patient ID is required' });
  }

  try {
    const caseHistories = await CaseHistory.find({ patientId }) // Fetch case histories for the given patientId
      .populate('doctorId', 'name') // Populate doctor information
      .sort({ createdAt: -1 }); // Sort by date descending

    res.status(200).json({ 
      success: 1, 
      CaseHistoryData: caseHistories, // Return the array of case histories directly
    });
  } catch (error) {
    res.status(500).json({ 
      success: 0, 
      message: error.message 
    });
  }
};

// exports.getpatientsAllCaseHistory = async (req, res) => {

//   const { patientId } = req.body; // Extract patientId from the payload
//     if (!patientId) {
//       return res.status(400).json({ success: 0, message: 'Patient ID is required' });
//     }

//     try {
//       const caseHistories = await CaseHistory.find({ patientId }) // Fetch case histories for the given patientId
//         .populate('doctorId', 'name') // Assuming there's a doctorId reference
//         .sort({ createdAt: -1 }); // Sort by date descending

//       const groupedData = groupBy(caseHistories, (item) => {
//         const data = new Date(item.createdAt).toLocaleDateString();
//         return `${data}-${item.doctorId.name}`;
//       });

//       res.status(200).json({ 
//         success: 1, CaseHistoryData: groupedData 
//       });
//     } catch (error) {
//       res.status(500).json({ 
//         success: 0, 
//         message: error.message 
//       });
//     }
// }

// function groupBy(array, keyFunction) {
//   return array.reduce((result, item) => {
//     const key = keyFunction(item);
//     if (!result[key]) {
//       result[key] = [];
//     }
//     result[key].push(item);
//     return result;
//   }, {});

// }