const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const {postUserInput} = require('../controller/loggercontroller')

router.post('/logging',verifyToken,postUserInput)

module.exports = router