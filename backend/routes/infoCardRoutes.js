const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const { 
  currentDayVisitorCount, 
  getBorrowedBooksList, 
  fetCurrentWeekVisitorVSLastWeek 
} = require('../controller/infocardcontroller');

// ✅ Tambahkan slash di depan path
router.get('/todayVisitorCount', verifyToken, currentDayVisitorCount);
router.get('/BorrowedBookList', verifyToken, getBorrowedBooksList);
router.get('/ThisWeekAndLast', verifyToken, fetCurrentWeekVisitorVSLastWeek);

module.exports = router;