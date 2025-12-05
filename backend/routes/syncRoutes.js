const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const { syncAllSummary } = require("../controller/synccontroller");

router.get('/sync', verifyToken,syncAllSummary);

module.exports = router;
