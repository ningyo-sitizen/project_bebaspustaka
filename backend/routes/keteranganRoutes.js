const express = require("express");
const router = express.Router();
const { getLoanHistoryByNim, getDataMahasiswa, getStatusBebasPustaka } = require("../controller/keterangancontroller");
const verifyToken = require("../middleware/checktoken");

router.get("/loanHistoryByNIM/:nim", verifyToken, getLoanHistoryByNim);
router.get("/dataMahasiswa", verifyToken, getDataMahasiswa);
router.get("/statusBepus", verifyToken, getStatusBebasPustaka);

module.exports = router;
