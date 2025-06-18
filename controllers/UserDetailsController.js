const UserDetails = require("../models/UserDetails");
const mongoose = require("mongoose");
const UserDocuments = require("../models/UserDocuments");
const UserQualification = require("../models/UserQualification");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

// Helper function to generate random username
const generateUsername = () => {
  return `user_${Math.random()
    .toString(36)
    .substring(2, 9)}_${Date.now().toString(36)}`;
};

const get_all_data = async (req, res) => {
  try {
    const data = await UserDetails.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const get_data = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await UserDetails.findOne({ _id: id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Create = async (req, res) => {
  try {
    // 1. Check authentication tokens
    const token = req.cookies.token;
    const userId = req.cookies.UserId;
    const rememberToken = req.cookies.remember_token;

    if (!token || !userId || !rememberToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing authentication tokens" });
    }

    // 2. Parse the request body (handling both form-data and JSON)
    let bodyData = {};
    if (req.body.data) {
      try {
        bodyData = JSON.parse(req.body.data);
      } catch (e) {
        bodyData = req.body;
      }
    } else {
      bodyData = req.body;
    }

    // 3. Validate required fields
    const requiredFields = [
      "contact_no_1",
      "email",
      "first_name",
      "gender",
      "dob",
      "current_address",
      "current_city",
      "current_state",
      "current_pincode",
      "permanent_address",
      "permanent_city",
      "permanent_state",
      "permanent_pincode",
    ];

    const missingFields = requiredFields.filter((field) => !bodyData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields: missingFields.map((field) => ({
          field,
          message: `${field} is required`,
        })),
      });
    }

    const { contact_no_1, email } = bodyData;
    const created_by = userId;

    // 4. Validate contact_no_1 format
    if (!/^\d{10}$/.test(contact_no_1)) {
      return res.status(400).json({
        message: "Invalid contact number",
        field: "contact_no_1",
        hint: "Contact number must be 10 digits",
      });
    }

    // 5. Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        field: "email",
      });
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(contact_no_1, 10);

    // 7. Create User
    const user = await User.create([
      {
        email,
        username: contact_no_1,
        password: hashedPassword,
        original_password: contact_no_1,
        created_by,
      },
    ]);
    const userRecord = user[0];

    console.log(
      "🔥 FILES RECEIVED:",
      req.files?.map((f) => f.originalname || f.fieldname)
    );

    // 8. Process file uploads - Enhanced document handling
    const documentFields = {
      resume: "",
      joiningLetter: "",
      offerLetter: "",
      aadharFront: "",
      aadharBack: "",
      panCard: "",
      tenthMarksheet: "",
      twelfthMarksheet: "",
      tenthCertificate: "",
      twelfthCertificate: "",
      ugMarksheets: [],
      pgMarksheets: [],
      phdCertificate: "",
      otherDocuments: [],
    };

    let profilePhotoPath = "";

    // Process all uploaded files
    if (req.files) {
      // Convert files to array format if needed
      const filesArray = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files);

      filesArray.forEach((file) => {
        const filePath =
          file.fieldname === "profilePhoto"
            ? `profile-photos/${file.filename}`
            : `documents/${file.filename}`;

        // Handle direct document uploads
        if (file.fieldname === "profilePhoto") {
          profilePhotoPath = filePath;
          console.log("🔥 PROFILE PHOTO PATH:", profilePhotoPath);
        } else if (file.fieldname === "resume")
          documentFields.resume = filePath;
        else if (file.fieldname === "joiningLetter")
          documentFields.joiningLetter = filePath;
        else if (file.fieldname === "offerLetter")
          documentFields.offerLetter = filePath;
        else if (file.fieldname === "aadharFront")
          documentFields.aadharFront = filePath;
        else if (file.fieldname === "aadharBack")
          documentFields.aadharBack = filePath;
        else if (file.fieldname === "panCard")
          documentFields.panCard = filePath;
        // Handle education document uploads
        else if (file.fieldname === "tenthMarksheet")
          documentFields.tenthMarksheet = filePath;
        else if (file.fieldname === "twelfthMarksheet")
          documentFields.twelfthMarksheet = filePath;
        else if (file.fieldname === "phdCertificate")
          documentFields.phdCertificate = filePath;
        else if (file.fieldname === "tenthCertificate")
          documentFields.tenthCertificate = filePath;
        else if (file.fieldname === "twelfthCertificate")
          documentFields.twelfthCertificate = filePath;
        // Handle UG marksheets (ugYear1, ugYear2, etc.)
        else if (file.fieldname.startsWith("ugYear")) {
          const year = parseInt(file.fieldname.replace("ugYear", ""));
          if (!isNaN(year)) documentFields.ugMarksheets[year - 1] = filePath;
        }

        // Handle PG marksheets
        else if (file.fieldname.startsWith("pgMarksheet")) {
          const index = parseInt(file.fieldname.replace("pgMarksheet", "")) - 1;
          if (!isNaN(index)) documentFields.pgMarksheets[index] = filePath;
        }

        // Handle other documents
        else if (file.fieldname === "otherDocuments") {
          documentFields.otherDocuments.push(filePath);
        }
      });
    }

    // 9. Process education details - Enhanced parsing with better error handling
    let educationDetails = [];
    try {
      console.log("Raw request body:", req.body);
      console.log("Original educationDetails:", bodyData.educationDetails);
      const eduData = bodyData.educationDetails || [];

      if (eduData) {
        // Parse if string, otherwise use directly
        educationDetails =
          typeof eduData === "string" ? JSON.parse(eduData) : eduData;

        // Ensure it's an array
        if (!Array.isArray(educationDetails)) {
          educationDetails = [educationDetails];
        }
      }
      console.log("Processed Education Data:", educationDetails);
    } catch (e) {
      console.error("Education parsing failed:", {
        error: e.message,
        stack: e.stack,
        inputData: bodyData.educationDetails,
      });
      return res.status(400).json({
        message: "Invalid education data format",
        error: e.message,
        receivedData: bodyData.educationDetails,
      });
    }

    console.log("Received Education Data:", educationDetails);
    console.log("Type of educationDetails:", typeof educationDetails);
    console.log(
      "First item structure:",
      educationDetails[0] ? Object.keys(educationDetails[0]) : "Empty"
    );

    const educationDocs = [];
    const educationTypeMap = {
      "10th": "Secondary",
      "12th": "Higher Secondary",
      UG: "Undergraduate",
      PG: "Postgraduate",
      PhD: "Doctorate",
    };

    // Process each education entry with better validation
    for (const edu of educationDetails) {
      try {
        const educationDoc = {
          user_id: String(userRecord.sequenceNo),
          education_type_id:
            educationTypeMap[edu.qualification] || edu.qualification,
          board_name_university:
            edu.board || edu.institute || edu.institution || "",
          year_of_passing: edu.year || "",
          percentage_sgpa: edu.percentage || edu.grade || "",
          marksheet: "",
          certificate: [],
          created_by: userId,
        };

        // Add course for higher education
        if (["UG", "PG", "PhD"].includes(edu.qualification)) {
          educationDoc.course = edu.course || "";
        }

        // Handle documents based on qualification
        switch (edu.qualification) {
          case "10th":
            if (edu.marksheet)
              educationDoc.marksheet = documentFields.tenthMarksheet;
            if (edu.certificate) {
              educationDoc.certificate = [
                {
                  type: "10th_certificate",
                  path: documentFields.tenthCertificate,
                },
              ];
            }
            break;

          case "12th":
            if (edu.marksheet)
              educationDoc.marksheet = documentFields.twelfthMarksheet;
            if (edu.certificate) {
              educationDoc.certificate = [
                {
                  type: "12th_certificate",
                  path: documentFields.twelfthCertificate,
                },
              ];
            }
            break;

          case "UG":
            if (edu.marksheets && edu.marksheets.length > 0) {
              educationDoc.marksheet = documentFields.ugMarksheets.join(",");
              educationDoc.certificate = edu.marksheets.map((_, i) => ({
                type: `ug_year_${i + 1}`,
                path: documentFields.ugMarksheets[i],
              }));
            }
            break;

          case "PhD":
            if (edu.certificate) {
              educationDoc.marksheet = documentFields.phdCertificate;
              educationDoc.certificate = [
                {
                  type: "phd_certificate",
                  path: documentFields.phdCertificate,
                },
              ];
            }
            break;
        }

        educationDocs.push(educationDoc);
      } catch (e) {
        console.error("Error processing education entry:", e);
        // Instead of silently continuing, we can return error
        return res.status(400).json({
          message: "Invalid education entry format",
          error: e.message,
          entry: edu,
        });
      }
    }

    // 10. Save user details
    const detailsPayload = {
      first_name: bodyData.first_name,
      middle_name: bodyData.middle_name || "",
      last_name: bodyData.last_name || "",
      full_name:
        bodyData.full_name ||
        `${bodyData.first_name} ${bodyData.last_name}`.trim(),
      email: email,
      alt_email: bodyData.alt_email || "",
      contact_no_1: contact_no_1,
      contact_no_2: bodyData.contact_no_2 || "",
      father_name: bodyData.father_name || "",
      father_contact_no: bodyData.father_contact_no || "",
      father_dob: bodyData.father_dob || "",
      father_email: bodyData.father_email || "",
      mother_name: bodyData.mother_name || "",
      mother_contact_no: bodyData.mother_contact_no || "",
      mother_dob: bodyData.mother_dob || "",
      mother_email: bodyData.mother_email || "",
      guardian_name: bodyData.guardian_name || "",
      guardian_contact_no: bodyData.guardian_contact_no || "",
      guardian_dob: bodyData.guardian_dob || "",
      guardian_email: bodyData.guardian_email || "",
      guardian_relation: bodyData.guardian_relation || "",
      current_address: bodyData.current_address,
      current_city: bodyData.current_city,
      current_state: bodyData.current_state,
      current_country: bodyData.current_country || "India",
      current_pincode: bodyData.current_pincode,
      permanent_address: bodyData.permanent_address,
      permanent_city: bodyData.permanent_city,
      permanent_state: bodyData.permanent_state,
      permanent_pincode: bodyData.permanent_pincode,
      permanent_country: bodyData.permanent_country || "India",
      gender: bodyData.gender,
      dob: bodyData.dob,
      spouse_name: bodyData.spouse_name || "",
      spouse_dob: bodyData.spouse_dob || "",
      marital_status: bodyData.marital_status || "",
      no_of_children: bodyData.no_of_children || "",
      blood_group: bodyData.blood_group || "",
      date_of_joining: bodyData.date_of_joining || "",
      date_of_resignation: bodyData.date_of_resignation || "",
      leaving_date: bodyData.leaving_date || "",
      employee_type: bodyData.employee_type || "",
      employee_code: bodyData.employee_code || "",
      tax_region: bodyData.tax_region || "",
      bank_name: bodyData.bank_name || "",
      bank_acc_no: bodyData.bank_acc_no || "",
      ifsc_code: bodyData.ifsc_code || "",
      branch_address: bodyData.branch_address || "",
      UAN_no: bodyData.UAN_no || "",
      PF_no: bodyData.PF_no || "",
      esic_no: bodyData.esic_no || "",
      category: bodyData.category || "",
      religion: bodyData.religion || "",
      department_id: bodyData.department_id || "",
      designation_id: bodyData.designation_id || "",
      profile_photo_path: profilePhotoPath || "",
      house_id: bodyData.house_id || "",
      deactivated: bodyData.deactivated || false,
      deleted_on: bodyData.deleted_on || "",
      status: bodyData.status || "Active",
      user_id: userRecord.sequenceNo,
      created_by,
    };

    await UserDetails.create([detailsPayload]);

    // 11. Save education qualifications with proper error handling
    if (educationDocs.length > 0) {
      try {
        console.log("Attempting to save education docs:", educationDocs);

        await UserQualification.insertMany(educationDocs);

        console.log("Education details saved successfully");
      } catch (e) {
        console.error("Error saving qualifications:", e);
        return res.status(500).json({
          message: "Failed to save education details",
          error: e.message,
        });
      }
    }

    // 12. Save document paths
    const documentsPayload = {
      user_id: userRecord.sequenceNo,
      resume: documentFields.resume || "",
      joining_letter: documentFields.joiningLetter || "",
      offer_letter: documentFields.offerLetter || "",
      aadhar_card_no: bodyData.aadhar_no || "",
      aadhar_card_front: documentFields.aadharFront || "",
      aadhar_card_back: documentFields.aadharBack || "",
      pan_card_no: bodyData.pan_no || "",
      pan_card: documentFields.panCard || "",
      other_documents:
        documentFields.otherDocuments.length > 0
          ? documentFields.otherDocuments.join(",")
          : "",
      created_by: userId,
    };

    await UserDocuments.create([documentsPayload]);

    res.status(201).json({
      message: "User created successfully",
      userId: userRecord.sequenceNo,
      documents: documentsPayload,
      educationDetails: educationDocs,
    });
  } catch (error) {
    console.error("Error in Create:", error);

    // Clean up uploaded files if error occurred
    if (req.files) {
      const filesArray = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files);
      filesArray.forEach((file) => {
        try {
          if (file && file.path) {
            fs.unlinkSync(file.path);
          }
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      });
    }

    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: "Validation failed",
        errors,
        errorDetails: error,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: "Duplicate field value",
        field,
        value: error.keyValue[field],
        errorCode: error.code,
      });
    }

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const Update = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedData = await UserDetails.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedData) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(updatedData);
  } catch (error) {
    const fieldMessages = {};
    if (error.name === "ValidationError") {
      const errorFields = Object.keys(error.errors);
      const schemaPaths = UserDetails.schema.paths;

      for (let field in schemaPaths) {
        const schemaType = schemaPaths[field].instance;
        if (field === "__v" || field === "_id") continue;

        if (errorFields.includes(field)) {
          fieldMessages[field] = [
            "This field is required.",
            "You missed this field.",
          ];
        } else if (req.body.hasOwnProperty(field)) {
          fieldMessages[field] = [
            `This field should be of type: ${schemaType}`,
          ];
        } else if (schemaPaths[field].isRequired) {
          fieldMessages[field] = [
            "This field is required.",
            "You missed this field.",
          ];
        } else {
          fieldMessages[field] = [
            `This field should be of type: ${schemaType}`,
          ];
        }
      }

      return res.status(400).json({
        message: "Validation failed during update",
        fields: fieldMessages,
      });
    }

    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const Delete = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await UserDetails.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { get_all_data, get_data, Create, Update, Delete };
