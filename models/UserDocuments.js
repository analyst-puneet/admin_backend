const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userDocumentsSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  sequenceNo: {
    type: Number,
    unique: true
  },
   
  resume: { type: String }, // file 
  joining_letter: { type: String }, // file 
  offer_letter: { type: String }, // file 
  aadhar_card_no: { type: String}, 
  aadhar_card_front: { type: String,  }, // file 
  aadhar_card_back: { type: String,  }, // file 
  pan_card_no: { type: String, },
  pan_card: { type: String, } // file 
}, { timestamps: true });

userDocumentsSchema.plugin(AutoIncrement, {
  inc_field: 'sequenceNo',
  id: 'documents_seq'
});
module.exports = mongoose.model('UserDocuments', userDocumentsSchema);
