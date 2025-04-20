const express = require('express');
const router = express.Router();
const { get_all_data, Create, Update, Delete } = require('../controllers/UserDetailsController');
router.get('/',get_all_data);
router.post('/create', Create);
router.post('/update/:id', Update);
router.delete('/delete/:id', Delete);

module.exports = router;
