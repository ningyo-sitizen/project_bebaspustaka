const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const {getAngkatan, getLembaga, getProgramStudi, getSummaryReport } = require('../controller/loansummarycontroller')

router.get("/angkatan", verifyToken, getAngkatan);
router.get("/lembaga", verifyToken, getLembaga);
router.get("/program", verifyToken, getProgramStudi);
router.get("/summary", verifyToken, getSummaryReport);

module.exports = router;