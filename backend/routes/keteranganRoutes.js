
const express = require("express");
const router = express.Router();
const { getLoanHistoryByNim } = require("../controller/keterangancontroller");
const verifyToken = require("../middleware/checktoken");

console.log("verifyToken hasil import =", verifyToken);

router.get("/loanHistoryByNIM/:nim", verifyToken, getLoanHistoryByNim);

module.exports = router;
