const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const {getAngkatan, getLembaga, getProgramStudi, getSummaryReport, getLoanHistory } = require('../controller/loansummarycontroller')
const { getLoanHistoryByNim } = require("../controller/keterangancontroller");

router.get("/angkatan", verifyToken, getAngkatan);
router.get("/lembaga", verifyToken, getLembaga);
router.get("/program", verifyToken, getProgramStudi);
router.get("/summary", verifyToken, getSummaryReport);
router.get("/loanHistory", verifyToken,getLoanHistory);
router.get("/loanHistoryByNIM/:nim", getLoanHistoryByNim);



module.exports = router;