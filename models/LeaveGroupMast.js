const mongoose = require('mongoose');

const leaveGroupMastSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    created_by: {
        type: String,
    },
    updated_by: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('LeaveGroupMast', leaveGroupMastSchema);
