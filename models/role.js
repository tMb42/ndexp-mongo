const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
    },
    label: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
    }
  },
  {
    timestamps: true,
    collection: 'roles', // This is the name of the collection in the database
  }
);
// Middleware to update `updated_at`
roleSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Create and export the Role model
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;