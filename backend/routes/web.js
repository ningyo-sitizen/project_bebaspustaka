const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const { getDashboardDatVisitor,getYears,getMonthlyForLandingPage } = require('../controller/visitorcount');

router.get('/visitor', verifyToken, getDashboardDatVisitor);
router.get('/dashboard/years', verifyToken, getYears);
router.get('/landingpagechart',verifyToken,getDashboardDatVisitor);

module.exports = router;
