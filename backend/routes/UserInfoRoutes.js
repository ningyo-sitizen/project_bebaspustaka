const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/checktoken');
const { updateUserInfo,getUserInfo,getAllUsers,deleteUser,register} = require('../controller/userinfocontroller');


router.put('/editProfile',verifyToken,updateUserInfo);
router.get('/userInfo',verifyToken,getUserInfo);
router.get('/getAllUser',verifyToken,getAllUsers);
router.delete('/userInfo',verifyToken,deleteUser);
router.post('/register',verifyToken,register);

module.exports = router;
