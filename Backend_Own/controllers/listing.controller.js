const Listing = require("../models/Listing.model");
const Job = require("../models/Job.model");

const mongoose = require("mongoose");

exports.uploadListingImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/api/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      imageUrl,
      fileName: req.file.filename,
    });
  } catch (err) {
    console.error("UPLOAD LISTING IMAGE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to upload listing image",
    });
  }
};


exports.createListing = async (req, res) => {
  try {
    // 1️⃣ Only service providers can create listings
    const ALLOWED_CREATORS = ["driver", "labour", "equipment_provider"];

    if (!ALLOWED_CREATORS.includes(req.user.role)) {
      return res.status(403).json({
        error: "You are not allowed to create a listing",
      });
    }

    // 2️⃣ providerRole validation (NEW & IMPORTANT)
    const { providerRole } = req.body;
    const ALLOWED_PROVIDER_ROLES = ["driver", "labour", "equipment_provider"];

    if (!ALLOWED_PROVIDER_ROLES.includes(providerRole)) {
      return res.status(400).json({
        error: "Invalid providerRole",
      });
    }

    // 3️⃣ Location validation
    if (
      !req.body.location ||
      !Array.isArray(req.body.location.coordinates) ||
      req.body.location.coordinates.length !== 2
    ) {
      return res
        .status(400)
        .json({ message: "Valid location coordinates required" });
    }

    // 4️⃣ Create Listing
    const listing = await Listing.create({
      ownerId: req.user.userId,

      providerRole, // ✅ CORE FIX

      title: req.body.title,
      description: req.body.description,
      experience: req.body.experience,
      mobile: req.body.mobile,

      price:
        req.body.price !== undefined && req.body.price !== ""
          ? Number(req.body.price)
          : undefined,

      priceUnit: req.body.priceUnit || "hour",

      available:
        typeof req.body.available === "boolean"
          ? req.body.available
          : true,

      locationName: req.body.locationName,
      location: req.body.location,
      vehicleDetails: req.body.vehicleDetails,
      meta: req.body.meta,
    });

    res.status(201).json({
      message: "Listing created successfully",
      listing,
    });
  } catch (err) {
    console.error("CREATE LISTING ERROR:", err);
    res.status(500).json({ error: "Server error while creating listing" });
  }
};

// exports.getListing = async (req, res) => {
//   try {
//     const filter = {};

//     // if (req.query.jobId) filter.jobId = req.query.jobId;

//     if (req.query.available !== undefined)
//       filter.available = req.query.available === 'true';

//     if (req.query.serviceType)
//       filter.serviceType = req.query.serviceType;

//     const listings = await Listing.find(filter)
//       // .populate('jobId', 'name basePrice')
//       .populate('ownerId', 'name role')
//       .sort({ createdAt: -1 });

//     res.json({ success: true, listings });
//   } catch (err) {
//     res.status(500).json({ error: 'server error' });
//   }
// };

exports.getListing = async (req, res) => {
  try {
    const filter = {};

    // 1️⃣ Availability filter
    if (req.query.available !== undefined) {
      filter.available = req.query.available === "true";
    }

    // 2️⃣ providerRole filter (NEW)
    if (req.query.providerRole) {
      const ALLOWED_PROVIDER_ROLES = [
        "driver",
        "labour",
        "equipment_provider",
      ];

      if (!ALLOWED_PROVIDER_ROLES.includes(req.query.providerRole)) {
        return res.status(400).json({
          success: false,
          message: "Invalid providerRole filter",
        });
      }

      filter.providerRole = req.query.providerRole;
    }

    // 3️⃣ Fetch listings
    const listings = await Listing.find(filter)
      .populate("ownerId", "_id name role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (err) {
    console.error("GET LISTING ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch listings",
    });
  }
};



exports.getSingleListing = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing id",
      });
    }

    // 2️⃣ Fetch listing
    const listing = await Listing.findById(id)
      .populate("ownerId", "name role");

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // 3️⃣ Success
    res.json({
      success: true,
      listing,
    });

  } catch (err) {
    console.error("GET SINGLE LISTING ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch listing",
    });
  }
};




exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing id",
      });
    }

    // 2️⃣ Find listing owned by user
    const listing = await Listing.findOne({
      _id: id,
      ownerId: req.user.userId,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or not authorized",
      });
    }

    // 3️⃣ Allowed update fields (whitelist)
    const ALLOWED_FIELDS = [
      "title",
      "description",
      "experience",
      "mobile",
      "price",
      "priceUnit",
      "available",
      "locationName",
      "location",
      "vehicleDetails",
      "meta",
    ];

    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    // 4️⃣ Protect providerRole
    if (req.body.providerRole) {
      return res.status(400).json({
        success: false,
        message: "providerRole cannot be updated",
      });
    }

    // 5️⃣ Validate location if present
    if (
      req.body.location &&
      (!Array.isArray(req.body.location.coordinates) ||
        req.body.location.coordinates.length !== 2)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location coordinates",
      });
    }

    await listing.save();

    res.json({
      success: true,
      listing,
    });
  } catch (err) {
    console.error("UPDATE LISTING ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update listing",
    });
  }
};




exports.availableListing = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing id",
      });
    }

    // 2️⃣ Fetch listing
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // 3️⃣ Authorization check
    if (!listing.ownerId.equals(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // 4️⃣ Toggle availability
    listing.available = !listing.available;
    await listing.save();

    // 5️⃣ Return updated value
    return res.status(200).json({
      success: true,
      available: listing.available,
    });

  } catch (err) {
    console.error("TOGGLE AVAILABILITY ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Set availability for ALL listings of the current provider
exports.setProviderAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    if (typeof available !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Field 'available' must be boolean",
      });
    }

    const result = await Listing.updateMany(
      { ownerId: req.user.userId },
      { $set: { available } }
    );

    return res.status(200).json({
      success: true,
      available,
      updatedCount: result.modifiedCount ?? result.nModified ?? 0,
    });
  } catch (err) {
    console.error("SET PROVIDER AVAILABILITY ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update provider availability",
    });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.ownerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this listing",
      });
    }

    await listing.deleteOne();

    res.json({
      success: true,
      message: "Listing deleted successfully",
    });

  } catch (err) {
    console.error("DELETE LISTING ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete listing",
    });
  }
};




exports.searchListings = async (req, res) => {
  try {
    const { query, providerRole, available } = req.query;

    const filter = {};

    // ✅ providerRole enum-safe
    if (providerRole) {
      filter.providerRole = providerRole;
    }

    // ✅ FIX: convert string → boolean
    if (available !== undefined) {
      filter.available = available === "true";
    }

    // ✅ text search
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      listings,
    });
  } catch (err) {
    console.error("SEARCH LISTINGS ERROR 👉", err);
    res.status(422).json({ error: "Invalid search parameters" });
  }
};



exports.updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    // 1️⃣ Validate coordinates
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude must be valid numbers",
      });
    }

    // 2️⃣ Find driver's listing (must be a driver listing)
    const listing = await Listing.findOne({
      ownerId: req.user.userId,
      providerRole: "driver",
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Driver listing not found",
      });
    }

    // 3️⃣ Update location
    listing.location = {
      type: "Point",
      coordinates: [longitude, latitude], // MongoDB uses [lng, lat]
    };

    await listing.save();

    res.json({
      success: true,
      location: listing.location,
    });

  } catch (err) {
    console.error("UPDATE DRIVER LOCATION ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update driver location",
    });
  }
};
























