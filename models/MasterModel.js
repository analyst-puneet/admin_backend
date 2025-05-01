const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const masterSchema = new mongoose.Schema({
  sequenceNo: {
    type: Number,
    unique: true
  },
  name: { type: String, required: true },
  status: { type: String, default: true },
  created_by: { type: String },
  updated_by: { type: String },
}, { timestamps: true });
masterSchema.plugin(AutoIncrement, {
  inc_field: 'sequenceNo',
  id: 'master_seq'
});
module.exports = (collectionName) => mongoose.model(collectionName, masterSchema, collectionName);
