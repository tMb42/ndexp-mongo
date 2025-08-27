const Patient = require('../models/patient');
const User = require('../models/user');
const Role = require('../models/role');
const Appointment = require('../models/appointment');
const CaseHistory = require('../models/casehistory');
const PatientResource = require('../resources/PatientResource');
const UserResource = require('../resources/UserResource');
const { getDateRange } = require('../helper/dateHelper');
const { Symptom } = require('../models');


// Save a new patient's information
exports.createPatient = async (req, res) => {
  try {
    const {
      userId,
      medicalHistory,
      notes,
      addlInfo,
      visitHistory,
      nextAppointment,
    } = req.body;

    // Validate required fields
    if (!userId || !addlInfo) {
      return res.status(400).json({ message: 'userId and addInfo are required.' });
    }
    // Parse addlInfo if it's a JSON string
    let parsedAddlInfo = addlInfo;
    if (typeof addlInfo === 'string') {
      try {
        parsedAddlInfo = JSON.parse(addlInfo);
      } catch (error) {
        return res.status(400).json({
          success: 0,
          message: 'Invalid JSON format for addlInfo!',
        });
      }
    }
    // Ensure symptoms is an array
    if (!Array.isArray(parsedAddlInfo)) {
      return res.status(400).json({
        success: 0,
        message: 'Additional Information must be an array.',
      });
    }
    // Create a new Patient document
    const newPatient = new Patient({
      userId,
      medicalHistory,
      notes,
      addlInfo: parsedAddlInfo, // Save parsed addlInfo,
      visitHistory,
      nextAppointment,
    });

    // Save to the database
    const savedPatient = await newPatient.save();

    res.status(201).json({ message: 'Patient created successfully', data: savedPatient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update or create a patient's information
exports.editPatientInformation = async (req, res) => {
  try {
    const { userId, addlInfo } = req.body;

    // Validate required fields
    if (!userId || !addlInfo) {
      return res.status(400).json({
        success: 0,
        message: 'userId and addlInfo are required.',
      });
    }

    // Parse `addlInfo` if it is a JSON string
    let parsedAddlInfo = addlInfo;
    if (typeof addlInfo === 'string') {
      try {
        parsedAddlInfo = JSON.parse(addlInfo);
      } catch (error) {
        return res.status(400).json({
          success: 0,
          message: 'Invalid JSON format for addlInfo!',
        });
      }
    }

    // Validate `addlInfo` to ensure it is an array of objects
    if (
      !Array.isArray(parsedAddlInfo) ||
      !parsedAddlInfo.every((item) => typeof item === 'object' && item !== null)
    ) {
      return res.status(400).json({
        success: 0,
        message: 'addlInfo must be an array of objects.',
      });
    }

    // Find the patient by userId
    let patient = await Patient.findOne({ userId });

    if (patient) {
      // Merge new `addlInfo` with existing `addlInfo`
      const existingAddlInfo = patient.addlInfo || [];

      // Create a map of existing addlInfo by a unique key (e.g., id or field)
      const addlInfoMap = new Map(
        existingAddlInfo.map((info) => [info.uniqueKey || info.id, info])
      );

      // Update or add new entries
      parsedAddlInfo.forEach((newInfo) => {
        const key = newInfo.uniqueKey || newInfo.id;
        if (addlInfoMap.has(key)) {
          // Update the existing entry
          addlInfoMap.set(key, { ...addlInfoMap.get(key), ...newInfo });
        } else {
          // Add the new entry
          addlInfoMap.set(key, newInfo);
        }
      });

      // Convert the map back to an array
      patient.addlInfo = Array.from(addlInfoMap.values());
      patient.updatedAt = new Date(); // Update the timestamp

      const updatedPatient = await patient.save();

      return res.status(200).json({
        success: 1,
        message: 'Patient information updated successfully',
        data: updatedPatient,
      });
    } else {
      // If patient does not exist, insert a new record
      const newPatient = new Patient({
        userId,
        addlInfo: parsedAddlInfo,
        medicalHistory: [], // Default empty fields
        notes: '',
        visitHistory: [],
        nextAppointment: null,
      });

      const savedPatient = await newPatient.save();

      return res.status(201).json({
        success: 1,
        message: 'New patient created successfully',
        data: savedPatient,
      });
    }
  } catch (error) {
    console.error('Error while updating or creating patient information:', error);

    // Handle server errors
    res.status(500).json({
      success: 0,
      message: 'Server error',
      error: error.message,
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

exports.getNeverAppointedPatients = async (req, res) => {
  try {
    // Find the role ID for "patient"
    const patientRole = await Role.findOne({ name: 'patient' });

    if (!patientRole) {
      return res.status(404).json({
        success: 0,
        message: 'Patient role not found.',
      });
    }
    // Fetch all patients with the "patient" role
    const allPatients = await User.find({ roles: patientRole._id }).select('_id');
    const allPatientIds = allPatients.map((patient) => patient._id);

    // Find patient IDs who have had any appointments
    const patientsWithAppointments = await Appointment.distinct('patientId');

    // Filter out patients who have never been appointed
    const patientsWithAppointmentsSet = new Set(
      patientsWithAppointments.map((id) => id.toString())
    );
    const neverAppointedPatientIds = allPatientIds.filter(
      (patientId) => !patientsWithAppointmentsSet.has(patientId.toString())
    );
    
    // Fetch detailed information for patients who have never been appointed
    const neverAppointedPatients = await User.find({
      _id: { $in: neverAppointedPatientIds },
    })
    .populate('roles', 'name') // Populate the 'roles' field with the 'name' property
    .populate('patients'); // Populate additional patient details

    // Format the response
    const formattedPatients = neverAppointedPatients.map((x) => {
      return new UserResource(
        x, // User details
        x.patients || [], // Additional patient details
        [] // No appointments
      ).toJSON();
    });
   
    res.json({
      success: 1,
      patientsData: formattedPatients,
    });
  } catch (error) {
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while fetching patient data.',
    });
  }
};

// exports.getAllNonScheduledPatients = async (req, res) => {
//   try {
//     const { doctorId, currentDate } = req.body; // Extract `doctorId` and `date`
    
//     console.log('Parsed Date2:', currentDate);
//     // Convert the currentDate (ISO string) to a Date object
//     const date = new Date(currentDate);

//     // Get the date range for the specified date
//     const { start, end } = getDateRange(date || new Date());

//     // Adjust start and end to UTC (if you need to handle time in UTC)
//     const startUTC = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
//     const endUTC = new Date(end.getTime() - end.getTimezoneOffset() * 60000);

//     // Step 1: Find all patients who have **any** appointment (past or today)
//     const allAppointments = await Appointment.find({
//       doctorId: doctorId,
//     }).distinct("patientId"); // Get distinct patient IDs

//     // Step 2: Find patients who have a **scheduled** appointment today
//     const scheduledPatientsToday = await Appointment.find({
//       doctorId: doctorId,
//       appointmentDate: { $gte: startUTC, $lte: endUTC },
//       status: "scheduled",
//     }).distinct("patientId"); // Get distinct patient IDs

//     // Step 3: Filter out patients who **do not have a scheduled appointment today**
//     const nonScheduledPatients = allAppointments.filter(
//       (patientId) => !scheduledPatientsToday.includes(patientId.toString())
//     );

//     //  Fetch all related patient details from the `Patient` collection
//     const patientsData = await Patient.find({
//       userId: { $in: nonScheduledPatients },
//     });

//     // Step 4: Fetch non-scheduled patient details
//     const patients = await User.find({ _id: { $in: nonScheduledPatients } });

//     // Step 5: Format patient data using UserResource
//     const patientsNonScheduledData = patients.map((x) => {
//       return new UserResource(
//         x.toObject() || {}, // Convert patient details to plain object
//         patientsData.filter((p) => p.userId.toString() === x._id.toString()), // Related patient data
//         [] // No current appointment
//       ).toJSON();
//     });


//     res.json({
//       success: 1,
//       patientsNonScheduledData,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: 0,
//       message: "An error occurred while fetching non-scheduled patient data.",
//     });
//   }
// };

exports.getAllNonScheduledPatients = async (req, res) => {
  try {
    const { doctorId, currentDate } = req.body;

    const date = new Date(currentDate);
    const { start, end } = getDateRange(date || new Date());

    // Convert to UTC to match appointment date stored in UTC
    const startUTC = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
    const endUTC = new Date(end.getTime() - end.getTimezoneOffset() * 60000);

    // Step 1: Get all patients who have any appointment with this doctor
    const allAppointmentPatientIds = await Appointment.find({
      doctorId: doctorId,
    }).distinct("patientId");

    // Step 2: Get patients who already have scheduled appointments for today
    const scheduledTodayPatientIds = await Appointment.find({
      doctorId: doctorId,
      appointmentDate: { $gte: startUTC, $lte: endUTC },
      status: "scheduled",
    }).distinct("patientId");

    // Step 3: Filter out patients who are not scheduled today
    const nonScheduledPatientIds = allAppointmentPatientIds.filter(
      (id) => !scheduledTodayPatientIds.includes(id.toString())
    );

    // Step 4: Fetch user (basic) and patient (extended) info
    const [users, patientDetails] = await Promise.all([
      User.find({ _id: { $in: nonScheduledPatientIds } }),
      Patient.find({ userId: { $in: nonScheduledPatientIds } }),
    ]);

    // Step 5: Format data into resource
    const patientsNonScheduledData = users.map((user) => {
      const patientDetail = patientDetails.filter(
        (p) => p.userId.toString() === user._id.toString()
      );
      return new UserResource(user.toObject(), patientDetail, []).toJSON();
    });

    res.json({
      success: 1,
      patientsNonScheduledData,
    });
  } catch (error) {
    console.error("Error fetching non-scheduled patients:", error);
    return res.status(500).json({
      success: 0,
      message: "An error occurred while fetching non-scheduled patient data.",
    });
  }
};

exports.getAllScheduledPatients = async (req, res) => {
  try {
    const { doctorId, currentDate } = req.body; // Assume doctor ID and visit date are passed as query parameters
            
    // Convert the currentDate (ISO string) to a Date object
    const date = new Date(currentDate);
    
    // Convert doctorId to ObjectId
    // const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    // Get the date range for the specified date
    const { start, end } = getDateRange(date || new Date());
    
    // Adjust start and end to UTC (if you need to handle time in UTC)
    const startUTC = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
    const endUTC = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
    
    const appointments = await Appointment.find({
      doctorId: doctorId, // ← Use this, not the string
      appointmentDate: { $gte: startUTC, $lte: endUTC },
      status: "scheduled",
    })
    .populate({
      path: 'patientId',
      model: 'User',
      populate: { path: 'roles', model: 'Role' },
    });
    console.log(('Appointments:', appointments));

    const patientIds = appointments.map((a) => a.patientId._id);
    // Fetch all related patient details from the `Patient` collection

    const patientsData = await Patient.find({
      userId: { $in: patientIds },
    }); // Fetch all fields for the matched patients



    // Map each appointment to a formatted patient schedule data
    const patientsScheduledData = appointments.map((x) => {
      return new UserResource(
        x.patientId?.toObject() || {}, // Convert patient details to plain object
        patientsData.filter((p) => p.userId.toString() === x.patientId?._id.toString()), // Related patient data
        [x] // Current appointment
      ).toJSON();
    });
  
    res.json({
      success: 1,
      patientsScheduledData: patientsScheduledData  
    });
  
  } 
  catch (error) {
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
    return res.status(400).json({ 
      success: 0,
      message: 'Patient ID is required' 
    });
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

exports.getAllPatientSymptoms = async (req, res) => {
  try {
    const { page, per_page, orderBy, sort_by } = req.query;
    
    // Convert to integers
    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(per_page);

     // Calculate the number of documents to skip based on the page number and limit
     const skip = (pageNumber - 1) * itemsPerPage;

    // Fetch sorted and paginated data
    const symptoms = await Symptom.find()
      .sort({ [sort_by]: orderBy === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(itemsPerPage);

    // Total count
    const total_symptoms = await Symptom.countDocuments();

    // Calculate total pages
    const total_pages = Math.ceil(total_symptoms / itemsPerPage);

    res.status(200).json({
      success: 1,
      dataSymptom: symptoms,
      total_symptoms,
      total_pages,
      current_page: page,
      itemsPerPage,
    });
  } catch (error) {
    res.status(500).json({ success: 0,  message: error, });
  }
};

exports.savePatientsSymptoms = async (req, res) => {
  try {
    const { 
      name,
      descriptions,
      inforce,
      display,
      remarks 
    } = req.body;
     
    // Function to split values by commas and capitalize each value
    const splitByCommaAndCapitalize = (field) => {
      if (field && typeof field === 'string') {
        return field.split(',').map(item => capitalizeWords(item.trim())); // Split by comma and capitalize each word
      }
      return field ? [capitalizeWords(field)] : []; // If not a string or empty, return as a single-item array with capitalized value
    };

    // Ensure all fields are arrays and apply sentenceCase
    const newSymptoms = new Symptom({
      name: capitalizeWords(name),
      descriptions: splitByCommaAndCapitalize(descriptions), 
      inforce: inforce ? parseInt(inforce) : 1, // Default to 1 if not provided
      display: display ? parseInt(display) : 1, // Default to 1 if not provided
      remarks: remarks ? sentenceCase(remarks) : null, 
    });

    const savedSymptoms = await newSymptoms.save();
    
    return res.status(201).json({
      success: 1,
      message: 'Symptoms saved successfully',
      dataSymptoms: savedSymptoms,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while creating the appointment',
    });
  }
  
};

exports.saveSymptomsType = async (req, res) => {
  try {
    const { 
      descriptions, 
      category 
    } = req.body;

    // Validate required fields
    if (!descriptions || !category) {
      return res.status(400).json({
        success: 0,
        message: 'Category and descriptions are required.',
      });
    }

    const newSymptomsType = new Symptom({
      category: capitalizeWords(category),
      descriptions: sentenceCase(descriptions),
    });

    const savedSymptomsType = await newSymptomsType.save();

    return res.status(201).json({
      success: 1,
      message: 'Symptoms Type saved successfully',
      dataSympType: savedSymptomsType,
    });
  } catch (error) {
    console.error('Error saving symptom type:', error.message);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while saving the symptom type',
      error: error.message,
    });
  }
};

