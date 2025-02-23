const PatientResource = require('./PatientResource');

class PatientCollection {
  constructor(patients, pagination, PatientResource = null) {
    this.patients = patients;
    this.pagination = pagination;
    this.PatientResource = PatientResource; 
  }

  toJSON() {
    return {
      data: this.PatientResource
        ? this.patients.map(item => new this.PatientResource(item).toJSON())
        : this.patients, // Corrected reference

      total: this.pagination?.totalDocs || this.patients.length,
      count: this.patients.length,
      per_page: this.pagination?.limit || this.patients.length,
      current_page: this.pagination?.page || 1,
      total_pages: this.pagination?.totalPages || 1,
    };
  }
}


module.exports = PatientCollection;
