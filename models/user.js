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
        unique: true,
        required: [true, 'Select Mobile no.'],
    },
    mobile_nos_previous: [String], // Array to store old mobile numbers
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
        default: null,
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 8,
    },
    remember_token: {
        type: String,
    },
    photo: {
        type: String,
        default: 'storage/images/no_image.png', // Default image path
        required: true,
    },
    display: {
        type: Number,
        required: true,
        default: 1 // equivalent to DataTypes.TINYINT with defaultValue: 1 in Sequelize
    },
    inforce: {
        type: Number,
        required: true,
        default: 1 // equivalent to DataTypes.TINYINT with defaultValue: 1 in Sequelize
    },
    remarks: {
        type: String,
    },
    aboutMe: {
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
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]

});

// Virtual property for full photo URL
userSchema.virtual('photoUrl').get(function () {
    return `${process.env.APP_URL}/${this.photo}`;
});

// Middleware to update `updated_at`
userSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
