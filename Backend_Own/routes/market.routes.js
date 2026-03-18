const express = require("express");
const router = express.Router();
const marketCtrl = require("../controllers/market.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/prices", marketCtrl.getMarketPrices);
router.get("/nearby-crop-markets", marketCtrl.getNearbyCropMarkets);
router.get("/items", marketCtrl.listMarketItems);
router.post("/items", authenticate, marketCtrl.createMarketItem);
router.get("/items/me", authenticate, marketCtrl.getMyMarketItems);

router.post("/orders", authenticate, marketCtrl.createMarketOrder);
router.get("/orders/me", authenticate, marketCtrl.getMyMarketOrders);
router.get("/orders/provider", authenticate, marketCtrl.getProviderMarketOrders);

router.get("/provider/analytics", authenticate, marketCtrl.getProviderAnalytics);

module.exports = router;
