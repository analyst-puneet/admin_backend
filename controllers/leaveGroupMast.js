const LeaveGroupMast = require('../models/LeaveGroupMast');

const getAllLeaveGroups = async (req, res) => {
    try {
        const leaveGroups = await LeaveGroupMast.find();
        res.status(200).json(leaveGroups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createLeaveGroup = async (req, res) => {
    const { name, status, created_by, updated_by } = req.body;
    const leaveGroup = new LeaveGroupMast({ name, status, created_by, updated_by });

    try {
        const savedLeaveGroup = await leaveGroup.save();
        res.status(201).json(savedLeaveGroup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateLeaveGroup = async (req, res) => {
    const { id } = req.params;
    const { name, status, updated_by } = req.body;

    try {
        const updatedLeaveGroup = await LeaveGroupMast.findByIdAndUpdate(id, { name, status, updated_by }, { new: true });
        res.status(200).json(updatedLeaveGroup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteLeaveGroup = async (req, res) => {
    const { id } = req.params;

    try {
        await LeaveGroupMast.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {getAllLeaveGroups, createLeaveGroup, updateLeaveGroup, deleteLeaveGroup };
