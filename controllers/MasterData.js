const MasterModel = require('../models/MasterModel');
const Index = async (req, res) => {
    const Master = MasterModel(req.Master);
    try {
      const data = await Master.find();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const Create = async (req, res) => {
    const Master = MasterModel(req.Master);
    try {
      const { name, status, created_by, updated_by } = req.body;
      const data = new Master({ name, status, created_by, updated_by });
      const savedData = await data.save();
      res.status(201).json(savedData);
    } catch (error) {
      const fieldMessages = {};
      if (error.name === 'ValidationError') {
        const errorFields = Object.keys(error.errors);
        const schemaPaths = Master.schema.paths;
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
    const Master = MasterModel(req.Master);
    const { id } = req.params;
    const { name, status, updated_by } = req.body;
  
    try {
      const updatedData = await Master.findByIdAndUpdate(
        id,
        { name, status, updated_by },
        {
          new: true,
          runValidators: true,
          context: 'query'     
        }
      );
  
      if (!updatedData) {
        return res.status(404).json({ message: 'Record not found' });
      }
  
      res.status(200).json(updatedData);
    } catch (error) {
      const fieldMessages = {};
  
      if (error.name === 'ValidationError') {
        const errorFields = Object.keys(error.errors);
        const schemaPaths = Master.schema.paths;
  
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
        const Master = MasterModel(req.Master);

    const { id } = req.params;
  
    try {
      const deleted = await Master.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  module.exports = { Index, Create, Update, Delete };
  