const Post = require("../models/Post.model");
exports.createPost = async (req, res) => {
  try {
    const { userId } = req.user;
    const { crop, title, description } = req.body;

    if (!crop || !title || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await Post.create({
      farmer: userId,
      crop,
      title,
      description,
      image: image,   // ✅ fixed
    });

    console.log("CREATED POST:", post._id);

    res.json({ success: true, post });
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
};



exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("farmer", "name role")
      .populate("replies.user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};






exports.addReply = async (req, res) => {
  try {
    const { userId } = req.user;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Reply message required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.replies.push({ user: userId, message });
    await post.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add reply" });
  }
};
