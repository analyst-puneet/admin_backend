const express = require('express');
const router = express.Router();
const { login,logout, validate} = require('../controllers/auth');

router.post('/login', login);
router.post('/logout', logout);
router.post('/validate', validate);

module.exports = router;
