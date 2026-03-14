const Listing = require("../models/Listing.model");

exports.searchListings = async (req, res) => {
  try {
    const { query, role } = req.query;

    const filter = {
      available: true,
    };

    if (query) {
      const regex = new RegExp(query, "i");

      filter.$or = [
        { title: regex },
        { description: regex },
      ];
    }

    // Apply role filter ONLY if role exists
    if (role === "farmer") {
      filter.role = "labour";
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
