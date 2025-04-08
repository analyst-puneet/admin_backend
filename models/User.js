const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    original_password: {
        type: String,
        required: true
    },
    
    remember_token: {
        type: String
    },
    remember_tokenExpiry: {
        type: Date
    },
    created_by: {
        type: String
    },
    updated_by: {
        type: String
    }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);
module.exports = User;
