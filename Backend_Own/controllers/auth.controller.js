const User= require('../models/User.model')
const { sendSMS } = require('../utils/sms');
const SALT_ROUNDS = 10;

const bcrypt=require('bcryptjs')
const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || '5', 10);

const { generatePlainOTP, hashOTP, compareOTP } = require('../utils/otp')
const { signJwt } = require('../utils/jwt')
exports.requestOtp=async (req,res)=>{
try{
const {name,mobile,role}=req.body
if(!mobile)  return res.status(400).json({error:"fill the mobile numer "})
 const normalizedMobile= mobile.trim()


let user=await User.findOne({mobile:normalizedMobile}).select('+otpHash +otpExpires')
if(!user){
    user=await User.create({
        name:name,
        mobile:normalizedMobile,
         role: role || 'farmer'
   })
}

 if (user.otpExpires && user.otpExpires > new Date()) {
      return res.status(429).json({ error: 'OTP already sent. Wait before requesting again.' });
    }

const plainOtp=generatePlainOTP(6)
const otpHash= await hashOTP(plainOtp)

user.otpHash=otpHash
user.otpExpires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
await user.save()

if (process.env.NODE_ENV === 'development') {
      console.log('DEV OTP for', normalizedMobile, '=', plainOtp); // dev-only log
      return res.json({
        success: true,
        message: 'OTP sent (dev)',
        otp: plainOtp
      });
    }
    await sendSMS(normalizedMobile, `Your Farmly OTP is ${plainOtp}. Expires in ${OTP_TTL_MINUTES} minutes.`);
    return res.json({ success: true, message: 'OTP sent' });

}catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error during 1' });
  }

}



exports.verifyOtp=async(req,res)=>{
    try{
 const {mobile,otp}=req.body
 if(!mobile || !otp) return res.status(400).json({error:"mobile number and otp is required"})
 const normalizedMobile=mobile.trim()
const user= await User.findOne({mobile:normalizedMobile}).select('+otpHash +otpExpires +passwordHash')
if (!user) return res.status(404).json({ error: 'user not found' });
    
if (!user.otpHash || !user.otpExpires) return res.status(400).json({ error: 'no otp requested' });
    
if (user.otpExpires < new Date()) return res.status(400).json({ error: 'otp expired' });
    const ok = await compareOTP(otp, user.otpHash);
   
    if (!ok) return res.status(400).json({ error: 'invalid otp' });


    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

   const token=signJwt({sub:user._id,mobile:user.mobile})
    return res.json({ success: true, token, user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } });

}
    catch(err){
     return res.status(500).json({error:'server error'})
    }
}



exports.setPassword=async(req,res)=>{
try{
const {userId}=req.user
const {password}=req.body
if(!password || password.length<6) return res.status(400).json({error:"create long password"})
 
    const passwordHash=await bcrypt.hash(password,SALT_ROUNDS)
   await User.findByIdAndUpdate(userId,{passwordHash},{new:true})
    return res.json({ success: true, message: 'password set' });
}
catch(err){
  console.error(err);
    return res.status(500).json({ error: 'server error what to do' });
}

}


exports.loginWithPassword = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: 'mobile & password required' });

    const user = await User.findOne({ mobile }).select('+passwordHash');
    if (!user) return res.status(404).json({ error: 'user not found' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = signJwt({ sub: user._id, role: user.role, mobile: user.mobile });
    return res.json({ success: true, token, user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
};


exports.registerUser = async (req, res) => {
  try {
    const { mobile } = req.body;


    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isRegistered = true; 
    await user.save();

    return res.json({ success: true, message: "Account registered successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-passwordHash -otpHash -otpExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);

  } catch (err) {
    console.error("GET ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};