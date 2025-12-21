const express = require('express');
const router = express.Router();
const { getListBebasPustaka,deleteHistoryApproval,getHistoryByBatch,exportHistoryBatchPDF } = require('../controller/historyApprovaController');
const verifyToken = require('../middleware/checktoken');


router.get("/", verifyToken, getListBebasPustaka);
router.delete("/:id",verifyToken, deleteHistoryApproval);
router.get("/batch/:batch_id", getHistoryByBatch);
router.get("/batch/:batch_id/export-pdf", exportHistoryBatchPDF);

module.exports = router;