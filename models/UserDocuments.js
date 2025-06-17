const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userDocumentsSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  sequenceNo: { type: Number, unique: true },
  resume: { type: String },
  joining_letter: { type: String },
  offer_letter: { type: String },
  aadhar_card_no: { type: String },
  aadhar_card_front: { type: String },
  aadhar_card_back: { type: String },
  pan_card_no: { type: String },
  pan_card: { type: String },
  other_documents: { type: String },
  created_by: { type: String, required: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted documents
userDocumentsSchema.virtual('formatted_documents').get(function() {
  return {
    resume: this.resume ? `/uploads/${this.resume}` : null,
    joining_letter: this.joining_letter ? `/uploads/${this.joining_letter}` : null,
    offer_letter: this.offer_letter ? `/uploads/${this.offer_letter}` : null,
    aadhar_card_front: this.aadhar_card_front ? `/uploads/${this.aadhar_card_front}` : null,
    aadhar_card_back: this.aadhar_card_back ? `/uploads/${this.aadhar_card_back}` : null,
    pan_card: this.pan_card ? `/uploads/${this.pan_card}` : null,
    other_documents: this.other_documents 
      ? this.other_documents.split(',').map(doc => `/uploads/${doc}`)
      : []
  };
});

userDocumentsSchema.plugin(AutoIncrement, {
  inc_field: 'sequenceNo',
  id: 'documents_seq'
});

module.exports = mongoose.model('UserDocuments', userDocumentsSchema);