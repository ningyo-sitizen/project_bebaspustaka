const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const { updateUserInfo,getUserInfo,getAllUsers} = require('../controller/userinfocontroller');


router.put('/editProfile',verifyToken,updateUserInfo);
router.get('/userInfo',verifyToken,getUserInfo);
router.get('/getAllUser',verifyToken,getAllUsers);

module.exports = router;
