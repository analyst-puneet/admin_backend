const express = require('express');
const router = express.Router();
const MasterModel = require('../models/MasterModel');
const { Index, Create, Update, Delete } = require('../controllers/MasterData');


const validMasters = ['role_group', 'country', 'state', 'gender', 'blood_group',
  'category','religion','house_mast','education_type','document_type','relation_mast',
  'marital_status','religion','department_mast','designation_mast'
];


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
router.post('/:masterName/update/:id', Update);
router.post('/:masterName/delete/:id', Delete);

module.exports = router;
