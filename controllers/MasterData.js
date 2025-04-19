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
    const Master = req.Master;
    const { name, status, created_by, updated_by } = req.body;
    const data = new Master({ name, status, created_by, updated_by });
  
    try {
      const savedData = await data.save();
      res.status(201).json(savedData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  const Update = async (req, res) => {
    const Master = req.Master;
    const { id } = req.params;
    const { name, status, updated_by } = req.body;
  
    try {
      const updatedData = await Master.findByIdAndUpdate(
        id,
        { name, status, updated_by },
        { new: true }
      );
      if (!updatedData) {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.status(200).json(updatedData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  const Delete = async (req, res) => {
    const Master = req.Master;
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
  