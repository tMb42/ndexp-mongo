const User = require('./user');
const Role = require('./role');
const Country = require('./country');
const Patient = require('./patient');
const Medication = require('./medication');
const Therapy = require('./therapy');
const Appointment = require('./appointment');
const CaseHistory = require('./casehistory');
const Symptom = require('./symptom');

module.exports = {
  Country,
  Role,
  User,
  Patient,
  Medication,
  Therapy,
  CaseHistory,
  Appointment,
  Symptom
};
