const express = require('express');
const router = express.Router();
const { getStatusPustaka } = require("../controller/sikompenController");

router.get('/status',getStatusPustaka);

module.exports = router;
