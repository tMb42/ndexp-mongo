const mongoose = require('mongoose');

const PersonalAccessTokenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        unique: true,
        trim: true,
        maxlength: [150, 'Name cannot exceed 150 characters']
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
        type: Date
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 6,
        select: false
    },
    remember_token: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const PersonalAccessToken = mongoose.model('PersonalAccessToken', PersonalAccessTokenSchema);

module.exports = PersonalAccessToken;