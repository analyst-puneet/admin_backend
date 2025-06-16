const UserDetails = require('../models/UserDetails');
const mongoose = require('mongoose');
const UserDocuments = require('../models/UserDocuments');
const UserQualification = require('../models/UserQualification');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Helper function to generate random username
const generateUsername = () => {
  return `user_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
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
      return res.status(401).json({ message: 'Unauthorized: Missing authentication tokens' });
    }

    // 2. Validate required fields
    const requiredFields = [
      'contact_no_1', 'email', 'first_name', 'last_name', 
      'gender', 'dob', 'current_address', 'current_city',
      'current_state', 'current_pincode', 'permanent_address',
      'permanent_city', 'permanent_state', 'permanent_pincode'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields: missingFields.map(field => ({
          field,
          message: `${field} is required`
        }))
      });
    }

    const { contact_no_1, email } = req.body;
    const created_by = userId;

    // 3. Validate contact_no_1 format
    if (!/^\d{10}$/.test(contact_no_1)) {
      return res.status(400).json({
        message: 'Invalid contact number',
        field: 'contact_no_1',
        hint: 'Contact number must be 10 digits'
      });
    }

    // 4. Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        field: 'email'
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(contact_no_1, 10);

    // 6. Create User
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

    // 7. Process file uploads - Improved document handling
    const documentFields = {
      resume: '',
      joiningLetter: '',
      offerletter: '',
      aadharFront: '',
      aadharBack: '',
      panCard: ''
    };

    // Process all uploaded files
    if (req.files) {
      // Convert files to array format if needed
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files);
      
      filesArray.forEach((file) => {
        // Case 1: Direct field names (e.g., name="resume")
        if (documentFields.hasOwnProperty(file.fieldname)) {
          documentFields[file.fieldname] = `documents/${file.filename}`;
          return;
        }

        // Case 2: documents[0][fieldname] format (e.g., name="documents[0][aadharFront]")
        const arrayMatch = file.fieldname.match(/^documents\[(\d+)\]\[([^\]]+)\]$/);
        if (arrayMatch && documentFields.hasOwnProperty(arrayMatch[2])) {
          documentFields[arrayMatch[2]] = `documents/${file.filename}`;
          return;
        }

        // Case 3: Alternative format (if any)
        const altMatch = file.fieldname.match(/^([a-zA-Z0-9]+)$/);
        if (altMatch && documentFields.hasOwnProperty(altMatch[1])) {
          documentFields[altMatch[1]] = `documents/${file.filename}`;
        }
      });

      console.log('Processed document paths:', documentFields);
    }

    // 8. Process education details (unchanged)
    let eduDetails = req.body.eduDetails || [];
    if (typeof eduDetails === 'string') {
      try {
        eduDetails = JSON.parse(eduDetails);
      } catch (e) {
        eduDetails = [];
      }
    }

    const educationDocs = [];
    const educationTypeMap = {
      '10th': 'Secondary',
      '12th': 'Higher Secondary',
      'UG': 'Undergraduate',
      'PG': 'Postgraduate',
      'PhD': 'Doctorate'
    };

    // Process each education entry
    for (let i = 0; i < eduDetails.length; i++) {
      const edu = eduDetails[i];
      
      // Initialize file paths
      let marksheetPath = '';
      let certificatePath = '';
      
      // Handle different education types
      switch (edu.qualification) {
        case '10th':
        case '12th':
          // Process marksheet and certificate files
          (req.files || []).forEach(file => {
            if (file.fieldname === `eduDetails[${i}][marksheet]`) {
              marksheetPath = file.filename;
            }
            if (file.fieldname === `eduDetails[${i}][certificate]`) {
              certificatePath = file.filename;
            }
          });
          break;
          
        case 'UG':
        case 'PG':
          // Process multiple marksheets
          const marksheets = [];
          (req.files || []).forEach(file => {
            const marksheetRegex = new RegExp(`^eduDetails\\[${i}\\]\\[marksheets\\]\\[\\d+\\]\\[filename\\]$`);
            if (marksheetRegex.test(file.fieldname)) {
              marksheets.push(file.filename);
            }
          });
          marksheetPath = marksheets.join(',');
          break;
          
        case 'PhD':
          // Process PhD certificate
          (req.files || []).forEach(file => {
            if (file.fieldname === `eduDetails[${i}][certificate]`) {
              certificatePath = file.filename;
            }
          });
          break;
      }

      // Prepare education document
      const educationDoc = {
        user_id: String(userRecord.sequenceNo),
        education_type_id: educationTypeMap[edu.qualification] || edu.qualification,
        board_name_university: edu.board || edu.institution || '',
        year_of_passing: edu.year || '',
        percentage_sgpa: edu.percentage || '',
        marksheet: marksheetPath,
        certificate: certificatePath,
      };

      // Add additional fields based on qualification type
      if (edu.qualification === 'UG' || edu.qualification === 'PG') {
        educationDoc.course = edu.course || '';
        educationDoc.duration = edu.duration || '';
      } else if (edu.qualification === 'PhD') {
        educationDoc.subject = edu.subject || '';
        educationDoc.thesis = edu.thesis || '';
      }

      educationDocs.push(educationDoc);
    }

    // 9. Save user details (unchanged)
    const detailsPayload = {
      first_name: req.body.first_name,
      middle_name: req.body.middle_name || '',
      last_name: req.body.last_name,
      full_name: req.body.full_name || '',
      email: email,
      alt_email: req.body.alt_email || '',
      contact_no_1: contact_no_1,
      contact_no_2: req.body.contact_no_2 || '',
      father_name: req.body.father_name || '',
      father_contact_no: req.body.father_contact_no || '',
      father_dob: req.body.father_dob || '',
      father_email: req.body.father_email || '',
      mother_name: req.body.mother_name || '',
      mother_contact_no: req.body.mother_contact_no || '',
      mother_dob: req.body.mother_dob || '',
      mother_email: req.body.mother_email || '',
      guardian_name: req.body.guardian_name || '',
      guardian_contact_no: req.body.guardian_contact_no || '',
      guardian_dob: req.body.guardian_dob || '',
      guardian_email: req.body.guardian_email || '',
      guardian_relation: req.body.guardian_relation || '',
      current_address: req.body.current_address,
      current_city: req.body.current_city,
      current_state: req.body.current_state,
      current_country: req.body.current_country || '',
      current_pincode: req.body.current_pincode,
      permanent_address: req.body.permanent_address,
      permanent_city: req.body.permanent_city,
      permanent_state: req.body.permanent_state,
      permanent_pincode: req.body.permanent_pincode,
      permanent_country: req.body.permanent_country || '',
      gender: req.body.gender,
      dob: req.body.dob,
      spouse_name: req.body.spouse_name || '',
      spouse_dob: req.body.spouse_dob || '',
      marital_status: req.body.marital_status || '',
      no_of_children: req.body.no_of_children || '',
      blood_group: req.body.blood_group || '',
      date_of_joining: req.body.date_of_joining || '',
      date_of_resignation: req.body.date_of_resignation || '',
      leaving_date: req.body.leaving_date || '',
      employee_type: req.body.employee_type || '',
      employee_code: req.body.employee_code || '',
      tax_region: req.body.tax_region || '',
      bank_name: req.body.bank_name || '',
      bank_acc_no: req.body.bank_acc_no || '',
      ifsc_code: req.body.ifsc_code || '',
      branch_address: req.body.branch_address || '',
      UAN_no: req.body.UAN_no || '',
      PF_no: req.body.PF_no || '',
      esic_no: req.body.esic_no || '',
      category: req.body.category || '',
      religion: req.body.religion || '',
      department_id: req.body.department_id || '',
      designation_id: req.body.designation_id || '',
      standard: req.body.standard || '',
      section: req.body.section || '',
      school_roll_no: req.body.school_roll_no || '',
      admission_no: req.body.admission_no || '',
      admission_date: req.body.admission_date || '',
      profile_photo_path: req.body.profile_photo_path || '',
      house_id: req.body.house_id || '',
      deactivated: req.body.deactivated || true,
      deleted_on: req.body.deleted_on || '',
      status: req.body.status || '',
      user_id: userRecord.sequenceNo,
      created_by,
    };

    await UserDetails.create([detailsPayload]);

    // 10. Save education qualifications
    for (const doc of educationDocs) {
      const qualification = new UserQualification(doc);
      await qualification.save();
    }

    // 11. Save document paths - Improved with proper field mapping
    await UserDocuments.create([
      {
        user_id: userRecord.sequenceNo,
        resume: documentFields.resume,
        joining_letter: documentFields.joiningLetter,
        offer_letter: documentFields.offerletter,
        aadhar_card_no: req.body.adhar_no || '',
        aadhar_card_front: documentFields.aadharFront,
        aadhar_card_back: documentFields.aadharBack,
        pan_card_no: req.body.pan_no || '',
        pan_card: documentFields.panCard,
        created_by: userId
      },
    ]);

    res.status(201).json({ 
      message: 'User created successfully',
      userId: userRecord.sequenceNo,
      documents: documentFields, // Include document paths in response
      educationDetails: educationDocs
    });
    
  } catch (error) {
    console.error('Error in Create:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors,
        errorDetails: error
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: 'Duplicate field value',
        field,
        value: error.keyValue[field],
        errorCode: error.code
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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