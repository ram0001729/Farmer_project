const router = require('express').Router()
const User = require("../models/User.model");

const auth=require('../controllers/auth.controller')
const { authenticate } = require('../middlewares/auth.middleware');


router.post('/request-otp',auth.requestOtp)
router.post('/verify-otp',auth.verifyOtp)

router.post('/set-password',authenticate, auth.setPassword)

router.post('/login-password', auth.loginWithPassword)
router.post('/register-user', auth.registerUser)

router.get("/me", authenticate, auth.getMe);



module.exports = router
