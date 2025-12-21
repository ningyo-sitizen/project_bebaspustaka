const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const {setDateRangeAndGenerate,getDate,getMahasiswaTI,getAllMahasiswaTI,approve,getMahasiswaTI_AllFull,approveAll,exportPDF} = require('../controller/bepuscontroller');


router.post('/seTanggal', verifyToken,setDateRangeAndGenerate);
router.get('/dataMahasiswa', verifyToken,getMahasiswaTI);
router.get("/kompenDate",verifyToken,getDate);
router.post('/approve', verifyToken,approve);
router.get('/getmahasiswaITAll', verifyToken,getMahasiswaTI_AllFull);
router.post('/approveAll', verifyToken,approveAll);
router.get('/export-pdf', exportPDF);
module.exports = router;