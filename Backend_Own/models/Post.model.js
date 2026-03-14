// models/Post.model.js
const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  crop: String,
  title: String,
  description: String,
  image: String, // cloudinary url
  replies: [replySchema],
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
