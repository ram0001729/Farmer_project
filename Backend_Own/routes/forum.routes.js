const express = require('express');
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const forum = require("../controllers/forum.controller");
const upload = require("../utils/upload");

router.post("/create", authenticate, upload.single("image"), forum.createPost);
router.get("/all", authenticate, forum.getPosts);
router.post("/reply/:postId", authenticate, forum.addReply);

module.exports = router;
