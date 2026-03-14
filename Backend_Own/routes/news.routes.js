const express = require("express");
const router = express.Router();
const newsCtrl = require("../controllers/news.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/schemes", newsCtrl.getGovernmentSchemes);
router.get("/", newsCtrl.getSuccessNews);
router.post("/", authenticate, newsCtrl.createSuccessNews);

module.exports = router;
