const mongoose = require('mongoose');

const userDocumentsSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },

  resume: { type: String }, // file 
  joining_letter: { type: String }, // file 
  offer_letter: { type: String }, // file 
  aadhar_card_no: { type: String, required: true }, 
  aadhar_card_front: { type: String, required: true }, // file 
  aadhar_card_back: { type: String, required: true }, // file 
  pan_card_no: { type: String, required: true },
  pan_card: { type: String, required: true } // file 
}, { timestamps: true });

module.exports = mongoose.model('UserDocuments', userDocumentsSchema);
