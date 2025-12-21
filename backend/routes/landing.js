const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const { getMonthlyForLandingPage,getBebasPustakaForLandingPage} = require('../controller/visitorcount');


router.get('/landingpagechart',verifyToken,getMonthlyForLandingPage);
router.get('/landingpagelist',verifyToken,getBebasPustakaForLandingPage)

module.exports = router;
