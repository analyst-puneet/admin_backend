const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { get_all_data,get_data, Create, Update, Delete } = require('../controllers/UserDetailsController');
router.get('/',get_all_data);
router.get('/:id',get_data);
router.post('/create', upload.any(),Create);
router.post('/update/:id', Update);
router.delete('/delete/:id', Delete);

module.exports = router;
