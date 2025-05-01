const express = require('express');
const router = express.Router();
const { getAllLeaveGroups, createLeaveGroup, updateLeaveGroup, deleteLeaveGroup } = require('../controllers/leaveGroupMast');

router.get('/', getAllLeaveGroups);
router.post('/create', createLeaveGroup);
router.put('/edit/:id', updateLeaveGroup);
router.delete('/delete/:id', deleteLeaveGroup);

module.exports = router;
