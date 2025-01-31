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

  
    // Flatten doctor details
    const doctorData = doctorId
      ? {
          doctorId: doctorId._id,
          doctorName: doctorId.name,
          doctorEmail: doctorId.email,
          doctorMobile_no: doctorId.mobile_no,
          doctorPhoto: doctorId.photo,
        }
      : {};

    // Concatenate appointmentDate and appointmentTime
    const appointmentDateTime = `${formatOnlyDate(appointmentDate)} ${appointmentTime}`;
    const patientNameAge = `${name} (${calculateAge(dob)})`;

    return {
      appointmentId: _id,
      appointmentDateTime,
      reasonForVisit,
      status: sentenceCase(status),
      notes: notes || null,
      createdAt: formatDate(createdAt),
      updatedAt: formatDate(updatedAt),
      // Patient data
      patientId: patientId._id,
      patientName: name,
      patientNameAge: patientNameAge,
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
      ...doctorData, 
    };
  }
}

module.exports = PatientResource;
