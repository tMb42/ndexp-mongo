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
