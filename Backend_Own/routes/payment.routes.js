const express = require("express");
const router = express.Router();
const verifyWebhook = require('../middlewares/verifyWebhook');

const paymentCtrl = require('../controllers/payment.controller');
const {authenticate} = require('../middlewares/auth.middleware');

router.get('/config', paymentCtrl.getPaymentConfig);
router.post('/initiate', authenticate, paymentCtrl.initiatePayment);
router.get('/my-payments', authenticate, paymentCtrl.getMyPayments);
router.get('/provider/earnings', authenticate, paymentCtrl.getProviderEarnings);
router.post('/success', authenticate, paymentCtrl.markPaymentSuccess);
router.post('/failed', authenticate, paymentCtrl.markPaymentFailed);
router.patch('/:id/refund', authenticate, paymentCtrl.refundPayment);
router.post("/create-order", authenticate, paymentCtrl.createRazorpayOrder);
module.exports = router;
