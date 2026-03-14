// routes/search.routes.js
const express = require("express");
const { searchListings } = require("../controllers/search.controller");

const router = express.Router();
router.get("/", searchListings);

module.exports = router;
