const mongoose = require('mongoose');

const userQualificationSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  education_type_id: { type: String, required: true },

  board_name_university: { type: String, required: true },
  year_of_passing: { type: Number, required: true },
  percentage_sgpa: { type: Number, required: true },
  marksheet: { type: String, required: true }, // file 
  certificate: { type: String }, //  file 
}, { timestamps: true });

module.exports = mongoose.model('UserQualification', userQualificationSchema);
