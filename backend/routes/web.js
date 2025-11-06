const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const { getDashboardDatVisitor,getYears } = require('../controller/visitorcount');
const {getAngkatan, getLembaga, getProgramStudi, getSummaryReport } = require('../controller/loansummarycontroller')

router.get('/visitor', verifyToken, getDashboardDatVisitor);
router.get('/dashboard/years', verifyToken, getYears);


module.exports = router;
