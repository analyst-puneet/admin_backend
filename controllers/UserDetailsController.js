const UserDetails = require('../models/UserDetails');
const fs = require('fs');
const path = require('path');
const get_all_data = async (req, res) => {
  try {
        const data = await UserDetails.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const get_data = async (req, res) => {
    const id= req.params;
  try {
        const data = await UserDetails.findOne({_id:id});
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Create = async (req, res) => {
  console.log(req.file);
  try {
    const { cantact_no_1,email}= req.body;
    const created_by=req.cookies.UserId;
    const hashedPassword = await bcrypt.hash(cantact_no_1, 10);
            const user = await User.create({
                email:email,
                username:cantact_no_1,
                password: hashedPassword,
                original_password: cantact_no_1,
                created_by: created_by
            });
       const { first_name,middle_name,last_name,full_name,alt_email,cantact_no_2,father_name,
        father_contact_no,father_dob,father_email,mother_name,mother_contact_no,mother_dob,
        mother_email,guardian_name,guardian_contact_no,guardian_dob,guardian_email,guardian_relation,
        current_address,current_city,current_state,current_country,current_pincode,permanent_city,
        permanent_state,permanent_pincode,permanent_country,gender,dob,spouse_name,spouse_dob,marital_status,
        no_of_children,blood_group,date_of_joining,date_of_resignation,leaving_date,employee_type,
        employee_code,tax_region,bank_name,bank_acc_no,ifsc_code,branch_address,UAN_no,PF_no,esic_no,
        category,religion,department_id,designation_id,standard,section,school_roll_no,admission_no,admission_date,
        profile_photo_path,house_id,deactivated,deleted_on,status,aadharBack,joiningLetter,aadharFront,panCard,resume,tenthMarksheet,twelfthMarksheet
       }=req.body; 

       const user_deatils = await UserDetails.create({
        user_id:user.sequenceNo ,        first_name: first_name??'',
        middle_name: middle_name??'',  last_name: last_name??'',
        full_name: full_name??'',  email: email??'',
        alt_email: alt_email??'',  contact_no_1:cantact_no_1??'' ,
        contact_no_2: cantact_no_2??'',  father_name:father_name ??'',
        father_contact_no: father_contact_no??'',  father_dob: father_dob??'',
        father_email:father_email ??'',  mother_name:mother_name??'' ,
        mother_contact_no: mother_contact_no??'',  mother_dob:mother_dob ??'',
        mother_email:mother_email ??'',  guardian_name:guardian_name ??'',
        guardian_contact_no: guardian_contact_no??'',  guardian_dob: guardian_dob??'',
        guardian_email: guardian_email??'',  guardian_relation: guardian_relation??'',
        current_address:current_address ??'',  current_city:current_city ??'',
        current_state: current_state??'',  current_country:current_country??'' ,
        current_pincode: current_pincode??'',  permanent_address: permanent_address??'',
        permanent_city:permanent_city??'' ,  permanent_state:permanent_state ??'',
        permanent_pincode:permanent_pincode ??'',  permanent_country: permanent_country??'',
        gender: gender??'',  dob:dob ??'',house_id:house_id??'',
        spouse_name:spouse_name ??'',  spouse_dob:spouse_dob ??'',
        marital_status:marital_status ??'',  no_of_children:no_of_children ??'',
        blood_group:blood_group ??'',  date_of_joining: date_of_joining??'',
        date_of_resignation: date_of_resignation??'',  leaving_date:leaving_date??'' ,
        employee_type:employee_type ??'',  employee_code: employee_code??'',
        tax_region:tax_region ??'',  bank_name:bank_name ??'',
        bank_acc_no:bank_acc_no ??'',  ifsc_code:ifsc_code ??'',
        branch_address:branch_address ??'',  UAN_no:UAN_no ??'',
        PF_no:PF_no ??'',  esic_no: esic_no??'',
        category:category??'',  religion:religion??'' ,
        department_id:department_id ??'',  designation_id: designation_id??'',
        standard: standard??'',  section:section ??'',
        school_roll_no:school_roll_no ??'',  admission_no:admission_no ??'',
        admission_date:admission_date ??'',  profile_photo_path:profile_photo_path ??'',
        created_by: req.cookies.UserId??'',  deactivated: deactivated??'',
        deleted_on: deleted_on??'',  status: status??''
       })
    // console.log(req.body,user_id);
    
    const newUserDetails = new UserDetails(req.body);
    // const savedData = await newUserDetails.save();
    res.status(201).json(savedData);

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

module.exports = { get_all_data,get_data, Create, Update, Delete };
