const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const {getAndInsertDataBebasPustaka,setDateRangeAndGenerate,getDate, resetPicks} = require('../controller/testing');
const {getMahasiswaTI,getAllMahasiswaTI,approve,getMahasiswaTI_AllFull,approveAll} = require('../controller/bepuscontroller');


router.post('/seTanggal', verifyToken,setDateRangeAndGenerate);
router.get('/dataMahasiswa', verifyToken,getMahasiswaTI);
router.post('/testing',getAndInsertDataBebasPustaka);
router.get("/kompenDate",verifyToken,getDate);
router.get('/dataMahasiswaAll', verifyToken,getAllMahasiswaTI);
router.post('/approve', verifyToken,approve);
router.get('/getmahasiswaITAll', verifyToken,getMahasiswaTI_AllFull);
router.post('/approveAll', verifyToken,approveAll);

module.exports = router;