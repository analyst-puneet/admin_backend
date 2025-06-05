const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userQualificationSchema = new mongoose.Schema({
  sequenceNo: {
    type: Number,
    unique: true
  },
   user_id: { type: String, required: true },
  education_type_id: { type: String, required: true },

  board_name_university: { type: String, required: true },
  year_of_passing: { type: Number, required: true },
  percentage_sgpa: { type: Number, required: true },
  marksheet: { type: String, required: true }, // file 
  certificate: { type: String }, //  file 
}, { timestamps: true });

userQualificationSchema.plugin(AutoIncrement, {
  inc_field: 'sequenceNo',
  id: 'qualification_seq'
});
module.exports = mongoose.model('UserQualification', userQualificationSchema);
