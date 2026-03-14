const Razorpay = require("razorpay");

let razorpayInstance = null;

function getRazorpay() {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId === "xxxx" || keySecret === "xxxx") {
      throw new Error("Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
    }
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
}

module.exports = {
  getRazorpay,
  isConfigured: () => {
    const id = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    return !!(id && secret && id !== "xxxx" && secret !== "xxxx");
  },
};