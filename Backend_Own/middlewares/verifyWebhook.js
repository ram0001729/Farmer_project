// middlewares/verifyWebhook.js
module.exports = (req, res, next) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.PAYMENT_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Invalid webhook" });
  }
  next();
};
