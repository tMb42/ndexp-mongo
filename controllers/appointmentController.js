const Appointment = require('../models/appointment');
const User = require('../models/user');
const Role = require('../models/role'); 
const PatientResource = require('../resources/PatientResource');
const { formatDate, formatOnlyDate, calculateAge } = require('../helper/dateHelper');


exports.searchBookingDetails = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const regexQuery = new RegExp(query, 'i');

    const results = await Appointment.aggregate([
      // 🔹 Lookup Patient Data (Ensures user data is fetched)
      {
        $lookup: {
          from: 'users', 
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient',
        },
      },
      { 
        $unwind: { 
          path: '$patient', 
          preserveNullAndEmptyArrays: true 
        } 
      },

      // 🔹 Lookup Doctor Data
      {
        $lookup: {
          from: 'users', 
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { 
        $unwind: { 
          path: '$doctor', 
          preserveNullAndEmptyArrays: true 
        } 
      },
      // 🔹 Filter Matching Fields
      {
        $match: {
          $or: [
            { reasonForVisit: regexQuery },
            { status: regexQuery },
            { appointmentDate: regexQuery },
            { appointmentTime: regexQuery },

            // 🔹 Search in Patient Details
            { 'patient.name': regexQuery },
            { 'patient.dob': regexQuery },
            { 'patient.gender': regexQuery },
            { 'patient.mobile_no': regexQuery },
            { 'patient.email': regexQuery },

            // 🔹 Search in Doctor Details
            { 'doctor.name': regexQuery },
            { 'doctor.dob': regexQuery },
            { 'doctor.gender': regexQuery },
            { 'doctor.mobile_no': regexQuery },
            { 'doctor.email': regexQuery },
          ],
        },
      },

    ]);

    if (!results.length) {
      return res.status(404).json({ error: 'No appointments found matching the query.' });
    }
    // Initialize an array to hold the formatted results
    const formattedResults = [];

    // Loop through each appointment and format the data using PatientResource
    for (const appointment of results) {
      // Define the common fields for both patient and doctor
      const userFields = [
        '_id', 'name', 'dob', 'gender', 'mobile_no', 'email', 'created_at', 'updated_at', 'display', 'inforce', 'remarks', 'aboutMe'
      ];

      // Format the patient and doctor data dynamically using the userFields array
      const formattedPatient = {};
      userFields.forEach(field => {
        formattedPatient[`patient${capitalizeWords(field)}`] = appointment.patient[field];
      });

      const formattedDoctor = {};
      userFields.forEach(field => {
        formattedDoctor[`doctor${capitalizeWords(field)}`] = appointment.doctor[field];
      });
      // Concatenate appointmentDate and appointmentTime
      const createdAt = `${formatDate(appointment.createdAt)}`;
      const updatedAt = `${formatDate(appointment.updatedAt)}`;
      const appointmentDateTime = `${formatOnlyDate(appointment.appointmentDate)} ${appointment.appointmentTime}`;
      const patientNameAge = `${appointment.patient.name} (${calculateAge(appointment.patient.dob)})`;

      // Merge formatted patient and doctor data with the appointment
      const formattedAppointment = {
        _id: appointment._id,
        appointmentDateTime: appointmentDateTime,  // Concatenated date and time
        reasonForVisit: appointment.reasonForVisit,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: createdAt,
        updatedAt: updatedAt,
        patientId: appointment.patient._id,
        doctorId: appointment.doctor._id,
        patientNameAge: patientNameAge,
        ...formattedPatient,
        ...formattedDoctor,
      };
      formattedResults.push(formattedAppointment);
    }
    res.status(200).json({
      success: 1,
      searchAppointments: formattedResults,
    });
  } catch (error) {
    console.error('Error searching for appointments:', error);
    res.status(500).json({ error: 'An error occurred while searching for appointments.' });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const { page, per_page, orderBy, sort_by } = req.query;
    
    // Convert to integers
    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(per_page);

    // Calculate the number of documents to skip based on the page number and limit
    const skip = (pageNumber - 1) * itemsPerPage;
    
    const patientRole = await Role.findOne({ name: 'patient' });

    if (!patientRole) {
      return res.status(404).json({
        success: 0,
        message: 'Patient role not found.',
      });
    }

    const patients = await User.find({ roles: patientRole._id }).select('_id name');

    if (!patients || patients.length === 0) {
      return res.status(404).json({
        success: 0,
        message: 'No patients found.',
      });
    }

    const appointments = await Appointment.find({ patientId: { $in: patients.map(pt => pt._id) } })
      .populate({
        path: 'patientId',
        select: 'name gender dob mobile_no created_at updated_at display inforce remarks aboutMe',
      })
      .populate({
        path: 'doctorId',
        select: 'name email mobile_no photo',
      })
      .sort({ [sort_by]: orderBy === 'asc' ? 1 : -1 }) // Sorting
      .skip(skip)
      .limit(itemsPerPage);

    // Count total appointments
    const total_appointments = await Appointment.countDocuments({ patientId: { $in: patients.map(pt => pt._id) } });
    const total_pages = Math.ceil(total_appointments / itemsPerPage);

    console.log(appointments.map(x => new PatientResource(x).toJSON()));
    
    // Response
    return res.status(200).json({
      success: 1,
      dataAppointments: appointments.map(x => new PatientResource(x).toJSON()),
      total_appointments,
      total_pages,
      current_page: pageNumber,
      itemsPerPage,
    });
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while fetching appointments.',
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, time, reason, notes } = req.body;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: 0,
        message: "Patient not found!",
      });
    }
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: 0,
        message: "Doctor not found!",
      });
    }
    // Check if the patient already has an appointment with status other than "completed"
    const existingAppointment = await Appointment.findOne({
      patientId,
      status: { $eq: "scheduled" },
      doctorId: {$eq: doctorId }
    });
    
    if (existingAppointment) {
      const scheduledAppointment = await Appointment.findById({_id: existingAppointment._id});
      return res.status(409).json({
        success: 0,
        message: `Appointment already scheduled with Dr. ${doctor.name} on ${formatOnlyDate(scheduledAppointment.appointmentDate)} at ${scheduledAppointment.appointmentTime}.`,
        data: scheduledAppointment,
      });

    } else{

      try {
         // If there is no active appointment, update the user role
        const patientRole = await Role.findOne({ name: "patient" });
        const userRole = await Role.findOne({ name: "user" });
      
        if (patientRole) {
          if (userRole && patient.roles.length === 1 && patient.roles.includes(userRole._id)) {
            patient.roles = [patientRole._id];
          } else if (!patient.roles.includes(patientRole._id)) {
            patient.roles.push(patientRole._id); // Add "Patient" role if not already present
          }
          await patient.save(); // Save updated user roles
          console.log("Updated User Roles:", patient.roles);
        }
        // Create new appointment
        const newAppointment = new Appointment({
          patientId,
          appointmentDate,
          appointmentTime: time,
          status: "scheduled",
          doctorId,
          reasonForVisit: sentenceCase(reason),
          notes: sentenceCase(notes),
        });
        const savedAppointment = await newAppointment.save();
        return res.status(201).json({
          success: 1,
          message: "Appointment created successfully",
          data: savedAppointment,
        });
        
        } catch (error) {
          console.error("Error creating appointment:", error);
          return res.status(500).json({
            success: 0,
            message: "An error occurred while creating the appointment",
          });
        } 
    }

  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({
      success: 0,
      message: "An error occurred while creating the appointment",
    });
  } 

};

exports.getBookedTimeSlot = async (req, res) => {
  const { doctorId, appointmentDate } = req.body;

  try {
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate,
      status: "scheduled",
    }).select("appointmentTime"); // Fetch only the time slots

    const bookedTimes = bookedAppointments.map(appt => appt.appointmentTime);

    res.json({ bookedTimes });
  } catch (error) {
    res.status(500).json({ success: 0, message: "Error fetching booked times" });
  }
};
