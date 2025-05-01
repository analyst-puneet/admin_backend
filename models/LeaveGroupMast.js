const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const leaveGroupMastSchema = new mongoose.Schema({
    sequenceNo: {
        type: Number,
        unique: true
      },
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

leaveGroupMastSchema.plugin(AutoIncrement, {
    inc_field: 'sequenceNo',
    id: 'LeaveGroup_seq'
  });

module.exports = mongoose.model('LeaveGroupMast', leaveGroupMastSchema);
