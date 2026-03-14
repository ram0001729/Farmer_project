const bcrypt=require('bcryptjs')
const SALT_ROUNDS=parseInt(process.env.SALT_ROUNDS || '10',10)


/*to generateotp */
function generatePlainOTP(digits = 4) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

async function hashOTP(plainOtp){
    return await bcrypt.hash(plainOtp,SALT_ROUNDS)
}

async function compareOTP(plainOtp,hash){
    return await bcrypt.compare(plainOtp,hash)
}

module.exports = {
  generatePlainOTP,
  hashOTP,
  compareOTP,
}