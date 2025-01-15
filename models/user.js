const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
        maxlength: [150, 'Name cannot exceed 150 characters']
    },
    dob: {
        type: Date,
        required: false,
    },
    gender: {
        type: String,
        required: [true, 'Select Gender'],
    },
    mobile_no: {
        type: String,
        required: [true, 'Select Mobile no.'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        trim: true,
        maxlength: [320, 'Email cannot exceed 320 characters'],
        match: [
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please enter a valid email'
        ]
    },
    email_verified_at: {
        type: Date,
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 8,
    },
    remember_token: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    roles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Role', // Referencing the Role model
        },
    ],
});

// Middleware to update `updated_at`
userSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
