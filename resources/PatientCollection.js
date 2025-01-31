const PatientResource = require('./PatientResource');

class PatientCollection {
  constructor(patients) {
    this.patients = patients;
  }

  toJSON() {
    return this.patients.map(x => new PatientResource(x).toJSON());
  }
}

module.exports = PatientCollection;
