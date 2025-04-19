const mongoose = require('mongoose');

const masterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: Boolean, default: true },
  created_by: { type: String },
  updated_by: { type: String },
}, { timestamps: true });

module.exports = (collectionName) => mongoose.model(collectionName, masterSchema, collectionName);
