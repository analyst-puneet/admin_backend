const express = require('express');
const router = express.Router();
const MasterModel = require('../models/MasterModel');
const { Index, Create, Update, Delete } = require('../controllers/MasterData');

const validMasters = ['role_group', 'ountry', 'state', 'gender', 'blood_group'];

router.use('/:masterName', (req, res, next) => {
  const { masterName } = req.params;
  if (validMasters.includes(masterName)) {
    req.Master = masterName;
    next();
  } else {
    return res.status(400).json({ message: 'Invalid Master' });
  }
});

router.get('/:masterName', Index);
router.post('/:masterName/create', Create);
router.put('/:masterName/update/:id', Update);
router.delete('/:masterName/delete/:id', Delete);

module.exports = router;
