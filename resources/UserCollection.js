const UserResource = require('./UserResource');

class UserCollection {
  constructor(users) {
    this.users = users;
  }

  toJSON() {
    return this.users.map(user => new UserResource(user).toJSON());
  }
}

module.exports = UserCollection;

// const UserResource = require('./UserResource');
// const PatientResource = require('./PatientResource');

// class UserCollection {
//   constructor(users) {
//     this.users = users;
//   }

//   toJSON() {
//     return this.users.map(user => {
//       // Check if user has the "patient" role
//       const isPatient = user.roles.some(role => role.name === 'patient');
//       return isPatient ? new PatientResource(user).toJSON() : new UserResource(user).toJSON();
//     });
//   }
// }

// module.exports = UserCollection;
