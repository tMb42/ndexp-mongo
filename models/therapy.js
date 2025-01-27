const mongoose = require('mongoose');

const therapySchema = new mongoose.Schema(
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
    collection: 'therapies', // This is the name of the collection in the database
  }
);
// Middleware to update `updated_at`
therapySchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Create and export the Therapy model
const Therapy = mongoose.model('Therapy', therapySchema);

module.exports = Therapy;