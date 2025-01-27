const mongoose = require('mongoose');

const remedySchema = new mongoose.Schema(
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
    collection: 'remedies', // This is the name of the collection in the database
  }
);
// Middleware to update `updated_at`
remedySchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Create and export the Remedy model
const Remedy = mongoose.model('Remedy', remedySchema);

module.exports = Remedy;