const express = require("express");
const router = express.Router();

const {
  listTI,
  approve,
  approveBulk,
  exportPDF,
  exportExcel,
  checkVisitor  // ← tambahkan ini
} = require("../controller/bepuscontroller");

// =================== ROUTES ===================

// GET DATA BEPUS + SEARCH + PAGINATION
router.get("/data", listTI);

// APPROVE BEPUS
router.post("/approve", approve);

// APPROVAL BULK
router.post("/approve/bulk", approveBulk);

// CHECK STATUS VISITOR (🔥 baris baru)
router.get("/check-visitor/:nim", checkVisitor);

// EXPORT PDF
router.get("/export/pdf", exportPDF);

// EXPORT EXCEL
router.get("/export/excel", exportExcel);

module.exports = router;