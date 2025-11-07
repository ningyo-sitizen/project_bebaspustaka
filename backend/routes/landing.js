const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const { getMonthlyForLandingPage} = require('../controller/visitorcount');


router.get('/landingpagechart',verifyToken,getMonthlyForLandingPage);

module.exports = router;
