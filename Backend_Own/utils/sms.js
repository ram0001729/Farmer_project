async function sendSMS(mobile, message) {
  // DEV MODE: just log
  console.log(`📱 SMS to ${mobile}: ${message}`);
  return true;
}

module.exports = { sendSMS };
