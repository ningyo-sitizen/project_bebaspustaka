const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const {postUserInput,getLog} = require('../controller/loggercontroller')

router.post('/logging',verifyToken,postUserInput)
router.get('/logging',verifyToken,getLog)
module.exports = router