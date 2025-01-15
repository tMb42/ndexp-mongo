const mongoose = require('mongoose');

// Define the userprofileSchema schema
const userProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB uses ObjectId for references
      ref: 'User', // Reference to the User model
      required: true,
    },
    photo: {
      type: String,
      default: 'storage/images/no_image.png', // Default image path
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now, // Automatically set the creation timestamp
    },
    updated_at: {
      type: Date,
      default: Date.now, // Automatically set the update timestamp
    },
  },
  {
    collection: 'userProfiles', // Explicitly set the collection name
    toJSON: {
      virtuals: true, // Enable virtuals when converting to JSON
    },
  }
);

// Virtual property for full photo URL
userProfileSchema.virtual('photoUrl').get(function () {
  return `${process.env.APP_URL}/${this.photo}`;
});

// Middleware to update the `updated_at` field before saving
userProfileSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Export the Profile model
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
