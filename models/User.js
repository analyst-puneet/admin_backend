const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
      sequenceNo: {
        type: Number,
        unique: true
      },
    
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

userSchema.plugin(AutoIncrement, {
    inc_field: 'sequenceNo',
    id: 'user_seq'
  });
const User = mongoose.model('User', userSchema);
module.exports = User;
