const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const certificateSchema = new mongoose.Schema({
  type: { type: String, required: true },
  path: { type: String, required: true },
});

const userQualificationSchema = new mongoose.Schema(
  {
    // sequenceNo: { type: Number, unique: true },
    user_id: { type: String, required: true },
    education_type_id: { type: String, required: true },
    board_name_university: { type: String, required: true },
    year_of_passing: { type: String },
    percentage_sgpa: { type: String, required: true },
    course: { type: String },
    duration: { type: Number },
    subject: { type: String },
    thesis: { type: String },
    marksheet: { type: String },
    certificate: [certificateSchema],
    created_by: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted documents
userQualificationSchema.virtual("formatted_documents").get(function () {
  return {
    marksheet: this.marksheet ? `/uploads/${this.marksheet}` : null,
    certificates: this.certificate
      ? this.certificate.map((cert) => ({
          type: cert.type,
          path: cert.path ? `/uploads/${cert.path}` : null,
        }))
      : [],
  };
});

userQualificationSchema.plugin(AutoIncrement, {
  inc_field: "sequenceNo",
  id: "qualification_seq",
});

module.exports = mongoose.model("UserQuaalification", userQualificationSchema);
