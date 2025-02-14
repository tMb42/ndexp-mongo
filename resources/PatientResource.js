const { formatDate, formatOnlyDate, calculateAge } = require('../helper/dateHelper');

class PatientResource {
  constructor(appointment) {
    this.appointment = appointment;
  }

  toJSON() {
    const {
        _id,
        appointmentDate,
        appointmentTime,
        reasonForVisit,
        status,
        notes,
        createdAt,
        updatedAt,
        patientId,
        doctorId,
    } = this.appointment;

    if (!patientId) {
        console.warn(`Missing patientId for appointment ${_id}`);
        return {
            appointmentId: _id,
            appointmentDateTime: `${formatOnlyDate(appointmentDate)} ${appointmentTime}`,
            reasonForVisit,
            status: toUpperCase(status),
            notes: notes || null,
            createdAt: formatDate(createdAt),
            updatedAt: formatDate(updatedAt),
            patientId: null, // Explicitly set null instead of undefined
            doctorId: doctorId ? doctorId._id : null,
        };
    }

    // Flatten patient details
    const {
        name,
        first_name,
        middle_name,
        last_name,
        gender,
        dob,
        mobile_no,
        created_at,
        updated_at,
        display,
        inforce,
        remarks,
        aboutMe,
    } = patientId;

    const appointmentDateTime = `${formatOnlyDate(appointmentDate)} ${appointmentTime}`;
    const patientNameAge = `${name} (${calculateAge(dob)})`;

    return {
        appointmentId: _id,
        appointmentDateTime,
        reasonForVisit,
        status: toUpperCase(status),
        notes: notes || null,
        createdAt: formatDate(createdAt),
        updatedAt: formatDate(updatedAt),
        // Patient data
        patientId: patientId._id,
        patientName: name,
        patientNameAge,
        patientFirstName: first_name,
        patientMiddleName: middle_name,
        patientLastName: last_name,
        patientGender: gender,
        patientDob: formatOnlyDate(dob),
        patientMobile_no: mobile_no,
        patientCreatedAt: formatDate(created_at),
        patientUpdatedAt: formatDate(updated_at),
        patientDisplay: display,
        patientInforce: inforce,
        patientRemarks: remarks,
        patientAboutMe: aboutMe,
        patientAge: calculateAge(dob),
        // Doctor data
        doctorId: doctorId ? doctorId._id : null,
        doctorName: doctorId.name,
        doctorMobile_no: doctorId.mobile_no 
    };
  }
} 

module.exports = PatientResource;
