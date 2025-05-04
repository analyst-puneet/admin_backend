// Added import for User model
const UserDetails = require('../models/UserDetails');
const UserDocuments = require('../models/UserDocuments');
const UserQualification = require('../models/UserQualification');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');  
const get_all_data = async (req, res) => {
  try {
    const data = await UserDetails.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const get_data = async (req, res) => {
  // Extract id from req.params correctly
  const { id } = req.params;
  try {
    const data = await UserDetails.findOne({ _id: id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change saved file paths to relative paths for DB storage

const Create = async (req, res) => {
  try {
    const { contact_no_1, email } = req.body;
    const created_by = req.cookies.UserId;
    const hashedPassword = await bcrypt.hash(contact_no_1, 10);
    const user = await User.create({
      email,
      username: contact_no_1,
      password: hashedPassword,
      original_password: contact_no_1,
      created_by
    });
    await user.save();

    const uploadsDir = path.join(__dirname, '..', 'public');
    const userFolder = path.join(uploadsDir, `documents`);
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    const fileFields = ['aadharBack', 'joiningLetter', 'aadharFront', 'panCard', 'resume'];
    const savedFilePaths = {};
    fileFields.forEach(field => {
      if (req.files && req.files[field]) {
        const file = Array.isArray(req.files[field]) ? req.files[field][0] : req.files[field];
        const destPath = path.join(userFolder, file.originalname);
        fs.renameSync(file.path, destPath);
        savedFilePaths[field] = path.relative(uploadsDir, destPath).replace(/\\/g, '/');
      }
    });

    const educationDocs = [];
    if (req.body.Marksheet && req.body.marks && req.body.board_name) {
      const education_type_id = Array.isArray(req.files.education_type_id) ? req.files.education_type_id : [req.files.education_type_id];
      const marksheets = Array.isArray(req.files.Marksheet) ? req.files.Marksheet : [req.files.Marksheet];
      const certificate = Array.isArray(req.files.certificate) ? req.files.certificate : [req.files.certificate];
      const marksArray = Array.isArray(req.body.marks) ? req.body.marks : [req.body.marks];
      const boardNames = Array.isArray(req.body.board_name) ? req.body.board_name : [req.body.board_name];
      const PassingYear = Array.isArray(req.body.passing_year) ? req.body.passing_year : [req.body.passing_year];

      for (let i = 0; i < boardNames.length; i++) {
        let marksheet_filePath = '';
        let certificate_filePath = '';
        if (marksheets && marksheets[i]) {
          const file = marksheets[i];
          const destPath = path.join(userFolder, file.originalname);
          fs.renameSync(file.path, destPath);
          marksheet_filePath = path.relative(uploadsDir, destPath).replace(/\\/g, '/');
        }
        if (certificate && certificate[i]) {
          const file = certificate[i];
          const destPath = path.join(userFolder, file.originalname);
          fs.renameSync(file.path, destPath);
          certificate_filePath = path.relative(uploadsDir, destPath).replace(/\\/g, '/');
        }
        educationDocs.push({
          user_id: user.sequenceNo,
          education_type_id: education_type_id[i] || '',
          board_name_university: boardNames[i] || '',
          year_of_passing: PassingYear[i] || '',
          percentage_sgpa: marksArray[i] || '',
          marksheet: marksheet_filePath,
          certificate: certificate_filePath,
        });
      }
    }

    const {
      first_name, middle_name, last_name, full_name, alt_email, contact_no_2, father_name,
      father_contact_no, father_dob, father_email, mother_name, mother_contact_no, mother_dob,
      mother_email, guardian_name, guardian_contact_no, guardian_dob, guardian_email, guardian_relation,
      current_address, current_city, current_state, current_country, current_pincode, permanent_city,
      permanent_state, permanent_pincode, permanent_country, gender, dob, spouse_name, spouse_dob, marital_status,
      no_of_children, blood_group, date_of_joining, date_of_resignation, leaving_date, employee_type,
      employee_code, tax_region, bank_name, bank_acc_no, ifsc_code, branch_address, UAN_no, PF_no, esic_no,
      category, religion, department_id, designation_id, standard, section, school_roll_no, admission_no, admission_date,
      profile_photo_path, house_id, deactivated, deleted_on, status, adhar_no, pan_no
    } = req.body;

    const user_details = await UserDetails.create({
      user_id: user.sequenceNo,
      first_name: first_name ?? '',
      middle_name: middle_name ?? '',
      last_name: last_name ?? '',
      full_name: full_name ?? '',
      email: email ?? '',
      alt_email: alt_email ?? '',
      contact_no_1: contact_no_1 ?? '',
      contact_no_2: contact_no_2 ?? '',
      father_name: father_name ?? '',
      father_contact_no: father_contact_no ?? '',
      father_dob: father_dob ?? '',
      father_email: father_email ?? '',
      mother_name: mother_name ?? '',
      mother_contact_no: mother_contact_no ?? '',
      mother_dob: mother_dob ?? '',
      mother_email: mother_email ?? '',
      guardian_name: guardian_name ?? '',
      guardian_contact_no: guardian_contact_no ?? '',
      guardian_dob: guardian_dob ?? '',
      guardian_email: guardian_email ?? '',
      guardian_relation: guardian_relation ?? '',
      current_address: current_address ?? '',
      current_city: current_city ?? '',
      current_state: current_state ?? '',
      current_country: current_country ?? '',
      current_pincode: current_pincode ?? '',
      permanent_city: permanent_city ?? '',
      permanent_state: permanent_state ?? '',
      permanent_pincode: permanent_pincode ?? '',
      permanent_country: permanent_country ?? '',
      gender: gender ?? '',
      dob: dob ?? '',
      house_id: house_id ?? '',
      spouse_name: spouse_name ?? '',
      spouse_dob: spouse_dob ?? '',
      marital_status: marital_status ?? '',
      no_of_children: no_of_children ?? '',
      blood_group: blood_group ?? '',
      date_of_joining: date_of_joining ?? '',
      date_of_resignation: date_of_resignation ?? '',
      leaving_date: leaving_date ?? '',
      employee_type: employee_type ?? '',
      employee_code: employee_code ?? '',
      tax_region: tax_region ?? '',
      bank_name: bank_name ?? '',
      bank_acc_no: bank_acc_no ?? '',
      ifsc_code: ifsc_code ?? '',
      branch_address: branch_address ?? '',
      UAN_no: UAN_no ?? '',
      PF_no: PF_no ?? '',
      esic_no: esic_no ?? '',
      category: category ?? '',
      religion: religion ?? '',
      department_id: department_id ?? '',
      designation_id: designation_id ?? '',
      standard: standard ?? '',
      section: section ?? '',
      school_roll_no: school_roll_no ?? '',
      admission_no: admission_no ?? '',
      admission_date: admission_date ?? '',
      profile_photo_path: profile_photo_path ?? '',
      created_by: req.cookies.UserId ?? '',
      deactivated: deactivated ?? '',
      deleted_on: deleted_on ?? '',
      status: status ?? '',
      aadharBack_path: savedFilePaths.aadharBack || '',
      joiningLetter_path: savedFilePaths.joiningLetter || '',
      aadharFront_path: savedFilePaths.aadharFront || '',
      panCard_path: savedFilePaths.panCard || '',
      resume_path: savedFilePaths.resume || ''
    });

    const Qualification = await UserQualification.create(educationDocs);

    const Userdocument = await UserDocuments.create({
      user_id: user.sequenceNo,
      aadhar_card_front: savedFilePaths.aadharFront || '',
      aadhar_card_back: savedFilePaths.aadharBack || '',
      aadhar_card_no: adhar_no ?? '',
      pan_card_no: pan_no ?? '',
      pan_card: savedFilePaths.panCard || '',
      joining_letter: savedFilePaths.joiningLetter || '',
      offer_letter: savedFilePaths.offerletter || '',
      resume: savedFilePaths.resume || ''
    });

    res.status(201).json(user_details);

  } catch (error) {
    const fieldMessages = {};
    if (error.name === 'ValidationError') {
      const errorFields = Object.keys(error.errors);
      const schemaPaths = UserDetails.schema.paths;
      for (let field in schemaPaths) {
        const schemaType = schemaPaths[field].instance;
        if (field === '__v' || field === '_id') continue;
        if (errorFields.includes(field)) {
          fieldMessages[field] = [
            'This field is required.',
            'You missed this field.'
          ];
        } else if (req.body.hasOwnProperty(field)) {
          fieldMessages[field] = [`This field should be of type: ${schemaType}`];
        } else if (schemaPaths[field].isRequired) {
          fieldMessages[field] = [
            'This field is required.',
            'You missed this field.'
          ];
        } else {
          fieldMessages[field] = [`This field should be of type: ${schemaType}`];
        }
      }
      return res.status(400).json({
        message: 'Validation failed',
        fields: fieldMessages
      });
    }
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
};



const Update = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedData = await UserDetails.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      context: 'query'
    });

    if (!updatedData) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json(updatedData);

  } catch (error) {
    const fieldMessages = {};

    if (error.name === 'ValidationError') {
      const errorFields = Object.keys(error.errors);
      const schemaPaths = UserDetails.schema.paths;

      for (let field in schemaPaths) {
        const schemaType = schemaPaths[field].instance;

        if (field === '__v' || field === '_id') continue;

        if (errorFields.includes(field)) {
          fieldMessages[field] = [
            'This field is required.',
            'You missed this field.'
          ];
        } else if (req.body.hasOwnProperty(field)) {
          fieldMessages[field] = [`This field should be of type: ${schemaType}`];
        } else if (schemaPaths[field].isRequired) {
          fieldMessages[field] = [
            'This field is required.',
            'You missed this field.'
          ];
        } else {
          fieldMessages[field] = [`This field should be of type: ${schemaType}`];
        }
      }

      return res.status(400).json({
        message: 'Validation failed during update',
        fields: fieldMessages
      });
    }

    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
};


const Delete = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await UserDetails.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { get_all_data, get_data, Create, Update, Delete };
