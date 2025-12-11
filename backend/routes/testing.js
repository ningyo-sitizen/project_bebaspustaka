const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const {getDataMahasiswa,getAndInsertDataBebasPustaka,setDateRangeAndGenerate,getDate} = require('../controller/testing');
const {getMahasiswaTI} = require('../controller/bepuscontroller');


router.post('/seTanggal', verifyToken,setDateRangeAndGenerate);
router.get('/dataMahasiswa', verifyToken,getMahasiswaTI);
router.post('/testing',getAndInsertDataBebasPustaka);
router.get("/kompenDate",verifyToken,getDate);
module.exports = router;