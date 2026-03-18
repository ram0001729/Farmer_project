const https = require('https');
const MarketItem = require("../models/MarketItem.model");
const MarketOrder = require("../models/MarketOrder.model");
const Booking = require("../models/Booking.model");
const Listing = require("../models/Listing.model");

// Simple in-memory cache
const cache = {
  timestamp: 0,
  data: null,
  previousPrices: null,
};

// Base prices (INR / quintal) for major Indian crops — realistic AGMARKNET reference values
const BASE_PRICES = {
  Wheat:       2450,
  Paddy:       2183,
  Rice:        3100,
  Maize:       1850,
  Cotton:      7200,
  Soybean:     4820,
  Groundnut:   6200,
  Mustard:     5600,
  Onion:        900,
  Tomato:      1200,
};

const CROP_ALIASES = {
  wheat: "Wheat",
  paddy: "Paddy",
  rice: "Rice",
  maize: "Maize",
  corn: "Maize",
  cotton: "Cotton",
  soybean: "Soybean",
  soya: "Soybean",
  groundnut: "Groundnut",
  peanut: "Groundnut",
  mustard: "Mustard",
  onion: "Onion",
  tomato: "Tomato",
};

const TRUSTED_MARKET_REFERENCES = [
  { marketName: "Azadpur Mandi", district: "North West Delhi", state: "Delhi", locationName: "Delhi", latitude: 28.7041, longitude: 77.1025 },
  { marketName: "Lasalgaon APMC", district: "Nashik", state: "Maharashtra", locationName: "Lasalgaon, Nashik", latitude: 20.1642, longitude: 74.2398 },
  { marketName: "Vashi APMC", district: "Thane", state: "Maharashtra", locationName: "Vashi, Navi Mumbai", latitude: 19.076, longitude: 72.8777 },
  { marketName: "Koyambedu Market", district: "Chennai", state: "Tamil Nadu", locationName: "Koyambedu, Chennai", latitude: 13.0827, longitude: 80.2707 },
  { marketName: "Bowenpally Market", district: "Hyderabad", state: "Telangana", locationName: "Bowenpally, Hyderabad", latitude: 17.385, longitude: 78.4867 },
  { marketName: "Yeshwanthpur Market", district: "Bengaluru Urban", state: "Karnataka", locationName: "Yeshwanthpur, Bengaluru", latitude: 12.9716, longitude: 77.5946 },
  { marketName: "Kalamna Market", district: "Nagpur", state: "Maharashtra", locationName: "Kalamna, Nagpur", latitude: 21.1458, longitude: 79.0882 },
  { marketName: "Indore Chhavni Mandi", district: "Indore", state: "Madhya Pradesh", locationName: "Indore", latitude: 22.7196, longitude: 75.8577 },
  { marketName: "Karnal Grain Market", district: "Karnal", state: "Haryana", locationName: "Karnal", latitude: 29.6857, longitude: 76.9905 },
  { marketName: "Ludhiana Mandi", district: "Ludhiana", state: "Punjab", locationName: "Ludhiana", latitude: 30.9009, longitude: 75.8573 },
  { marketName: "Kanpur Mandi", district: "Kanpur Nagar", state: "Uttar Pradesh", locationName: "Kanpur", latitude: 26.4499, longitude: 80.3319 },
  { marketName: "Lucknow Mandi", district: "Lucknow", state: "Uttar Pradesh", locationName: "Lucknow", latitude: 26.8467, longitude: 80.9462 },
  { marketName: "Patna Mandi", district: "Patna", state: "Bihar", locationName: "Patna", latitude: 25.5941, longitude: 85.1376 },
  { marketName: "Raipur Mandi", district: "Raipur", state: "Chhattisgarh", locationName: "Raipur", latitude: 21.2514, longitude: 81.6296 },
  { marketName: "Ahmedabad APMC", district: "Ahmedabad", state: "Gujarat", locationName: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
  { marketName: "Rajkot Mandi", district: "Rajkot", state: "Gujarat", locationName: "Rajkot", latitude: 22.3039, longitude: 70.8022 },
  { marketName: "Jaipur Mandi", district: "Jaipur", state: "Rajasthan", locationName: "Jaipur", latitude: 26.9124, longitude: 75.7873 },
  { marketName: "Kota Mandi", district: "Kota", state: "Rajasthan", locationName: "Kota", latitude: 25.2138, longitude: 75.8648 },
  { marketName: "Bhopal Mandi", district: "Bhopal", state: "Madhya Pradesh", locationName: "Bhopal", latitude: 23.2599, longitude: 77.4126 },
  { marketName: "Kolkata Market", district: "Kolkata", state: "West Bengal", locationName: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
];

// Per-crop realistic volatility bands (fraction of base price)
const CROP_VOLATILITY = {
  Tomato:  0.18,
  Onion:   0.15,
  Cotton:  0.06,
  Soybean: 0.05,
  default: 0.04,
};

let priceSeeds = null; // drifting prices that persist across refreshes

function normalizeCropName(value) {
  if (!value) return "Wheat";
  const key = String(value).trim().toLowerCase();
  return CROP_ALIASES[key] || (Object.keys(BASE_PRICES).includes(value) ? value : "Wheat");
}

function toNumber(value, fallback = null) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findReferenceMarket(rawMarketName, rawDistrict, rawState) {
  const marketName = String(rawMarketName || "").trim().toLowerCase();
  const district = String(rawDistrict || "").trim().toLowerCase();
  const state = String(rawState || "").trim().toLowerCase();
  return TRUSTED_MARKET_REFERENCES.find((m) => {
    const sameMarket = marketName && m.marketName.toLowerCase() === marketName;
    const sameDistrictState = district && state && m.district.toLowerCase() === district && m.state.toLowerCase() === state;
    return sameMarket || sameDistrictState;
  });
}

function dynamicCropPrice(crop) {
  const nowMs = Date.now();
  const bucket = Math.floor(nowMs / 120000);
  const base = BASE_PRICES[crop] || BASE_PRICES.Wheat;
  const amplitude = CROP_VOLATILITY[crop] ?? CROP_VOLATILITY.default;
  const wave = Math.sin(bucket * 0.85) + Math.cos(bucket * 0.35);
  const drift = 1 + (wave * amplitude) / 3;
  return Math.max(100, Math.round(base * drift));
}

function getRecordValue(record, keys) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && String(record[key]).trim() !== "") {
      return record[key];
    }
  }
  return null;
}

async function fetchTrustedNearbyMarkets(crop) {
  const apiKey = process.env.MANDI_TRUSTED_API_KEY;
  const resourceId = process.env.MANDI_TRUSTED_RESOURCE_ID || "9ef84268-d588-465a-a308-a864a43d0070";
  const baseUrl = process.env.MANDI_TRUSTED_API_URL || `https://api.data.gov.in/resource/${resourceId}`;

  if (!apiKey) {
    return { source: "simulated-trusted-fallback", records: [] };
  }

  const cropFilter = encodeURIComponent(crop);
  const url = `${baseUrl}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=100&filters[commodity]=${cropFilter}`;
  const json = await httpGetJson(url);
  const records = Array.isArray(json?.records) ? json.records : [];
  return {
    source: "agmarknet-data-gov-in",
    records,
  };
}

function buildFallbackMarkets(crop, farmerLat, farmerLng, limit) {
  const base = dynamicCropPrice(crop);
  const markets = TRUSTED_MARKET_REFERENCES.map((market, idx) => {
    const localBias = 1 + ((idx % 5) - 2) * 0.01;
    const pricePerQuintal = Math.max(100, Math.round(base * localBias));
    const distanceKm = haversineDistanceKm(farmerLat, farmerLng, market.latitude, market.longitude);
    return {
      marketName: market.marketName,
      locationName: market.locationName,
      district: market.district,
      state: market.state,
      pricePerQuintal,
      distanceKm: Number(distanceKm.toFixed(1)),
      coordinates: [market.longitude, market.latitude],
      lastUpdated: new Date().toISOString(),
      trusted: true,
    };
  })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return {
    source: "simulated-trusted-fallback",
    markets,
  };
}

exports.getNearbyCropMarkets = async (req, res) => {
  try {
    const crop = normalizeCropName(req.query.crop);
    const limit = Math.max(1, Math.min(25, Number(req.query.limit) || 10));
    const farmerLat = toNumber(req.query.lat, 20.5937);
    const farmerLng = toNumber(req.query.lng, 78.9629);

    const trustedResult = await fetchTrustedNearbyMarkets(crop);
    const trustedRecords = trustedResult.records;

    if (!trustedRecords.length) {
      const fallback = buildFallbackMarkets(crop, farmerLat, farmerLng, limit);
      return res.json({
        success: true,
        data: {
          crop,
          source: fallback.source,
          farmerLocation: { latitude: farmerLat, longitude: farmerLng },
          markets: fallback.markets,
        },
      });
    }

    const normalized = trustedRecords
      .map((record) => {
        const marketName = getRecordValue(record, ["market", "market_name", "marketName"]);
        const district = getRecordValue(record, ["district", "district_name"]);
        const state = getRecordValue(record, ["state", "state_name"]);
        const locationName = [marketName, district, state].filter(Boolean).join(", ");

        const modalPrice = toNumber(
          getRecordValue(record, ["modal_price", "modalPrice", "price", "modalprice"]),
          null
        );

        if (!marketName || modalPrice == null) {
          return null;
        }

        let latitude = toNumber(getRecordValue(record, ["latitude", "lat"]), null);
        let longitude = toNumber(getRecordValue(record, ["longitude", "lng", "lon"]), null);

        if (latitude == null || longitude == null) {
          const ref = findReferenceMarket(marketName, district, state);
          if (ref) {
            latitude = ref.latitude;
            longitude = ref.longitude;
          }
        }

        const distanceKm =
          latitude != null && longitude != null
            ? haversineDistanceKm(farmerLat, farmerLng, latitude, longitude)
            : Number.MAX_SAFE_INTEGER;

        return {
          marketName: String(marketName),
          locationName,
          district: district || "",
          state: state || "",
          pricePerQuintal: Math.round(modalPrice),
          distanceKm: Number.isFinite(distanceKm) && distanceKm !== Number.MAX_SAFE_INTEGER
            ? Number(distanceKm.toFixed(1))
            : null,
          coordinates:
            latitude != null && longitude != null ? [Number(longitude), Number(latitude)] : null,
          lastUpdated: getRecordValue(record, ["arrival_date", "updated_at", "timestamp"]) || new Date().toISOString(),
          trusted: true,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const da = a.distanceKm == null ? Number.MAX_SAFE_INTEGER : a.distanceKm;
        const db = b.distanceKm == null ? Number.MAX_SAFE_INTEGER : b.distanceKm;
        return da - db;
      })
      .slice(0, limit);

    if (!normalized.length) {
      const fallback = buildFallbackMarkets(crop, farmerLat, farmerLng, limit);
      return res.json({
        success: true,
        data: {
          crop,
          source: fallback.source,
          farmerLocation: { latitude: farmerLat, longitude: farmerLng },
          markets: fallback.markets,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        crop,
        source: trustedResult.source,
        farmerLocation: { latitude: farmerLat, longitude: farmerLng },
        markets: normalized,
      },
    });
  } catch (err) {
    console.error("NEARBY CROP MARKETS ERROR:", err);
    return res.status(502).json({ success: false, message: "Failed to fetch nearby crop markets" });
  }
};

function applyVolatility(current, cropName) {
  const vol = CROP_VOLATILITY[cropName] ?? CROP_VOLATILITY.default;
  const swing = (Math.random() * 2 - 1) * vol;     // -vol to +vol
  const drift  = 1 + swing;
  return Math.round(current * drift);
}

function buildDynamicPrices() {
  if (!priceSeeds) {
    // On first call, start exactly at base prices
    priceSeeds = { ...BASE_PRICES };
    return { ...priceSeeds };
  }
  // Each refresh, drift each crop's price from its last value
  Object.keys(priceSeeds).forEach((crop) => {
    priceSeeds[crop] = applyVolatility(priceSeeds[crop], crop);
  });
  return { ...priceSeeds };
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const { statusCode } = res;
        if (statusCode !== 200) {
          reject(new Error(`Request Failed. Status Code: ${statusCode}`));
          res.resume();
          return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve(parsed);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', (e) => {
        reject(e);
      });
  });
}


const BASE_REFRESH_MS = Number(process.env.MARKET_REFRESH_MS || 60000); // default 1 minute
const VOLATILITY = Number(process.env.MARKET_VOLATILITY || 0.04); // 4% volatility by default

function getRefreshIntervalMs() {
  // Higher volatility -> refresh more often
  const factor = Math.max(0.1, Math.min(1.5, 1 + VOLATILITY));
  return Math.max(5000, Math.floor(BASE_REFRESH_MS / factor));
}

async function fetchExternalPrices() {
  const apiKey = process.env.COMMODITY_API_KEY;
  const apiUrl = process.env.COMMODITY_API_URL || "https://www.commodity-api.com/api/v1/prices";

  // In case the API key is not configured, simulate live prices with drift.
  if (!apiKey) {
    return {
      source: "live-sim",
      prices: buildDynamicPrices(),
    };
  }

  const symbols = (process.env.COMMODITY_SYMBOLS || "Wheat,Rice,Maize,Cotton").split(",").map((s) => s.trim()).join(",");

  const url = `${apiUrl}?access_key=${encodeURIComponent(apiKey)}&symbols=${encodeURIComponent(symbols)}&base=INR`;

  const json = await httpGetJson(url);

  if (!json || !json.data) {
    throw new Error("Invalid commodity API response");
  }

  // Normalize response into { Wheat: number, Rice: number } etc.
  const prices = Object.entries(json.data).reduce((acc, [key, value]) => {
    // Some APIs return nested objects; attempt to normalize
    if (typeof value === "number") {
      acc[key] = value;
    } else if (value && typeof value === "object" && typeof value.price === "number") {
      acc[key] = value.price;
    }
    return acc;
  }, {});

  return {
    source: "commodity-api",
    prices,
  };
}

exports.getMarketPrices = async (req, res) => {
  try {
    const now = Date.now();
    const refreshMs = getRefreshIntervalMs();

    if (!cache.data || now - cache.timestamp > refreshMs) {
      const prevPrices = cache.data ? { ...cache.data.prices } : null;
      const external = await fetchExternalPrices();

      cache.previousPrices = prevPrices;
      cache.data = {
        fetchedAt: new Date().toISOString(),
        source: external.source,
        volatility: VOLATILITY,
        refreshIntervalMs: refreshMs,
        prices: external.prices,
        previousPrices: prevPrices,
      };
      cache.timestamp = now;
    }

    res.json({ success: true, data: cache.data });
  } catch (err) {
    console.error("MARKET PRICES ERROR:", err);
    res.status(502).json({ success: false, message: "Failed to fetch market prices" });
  }
};

const DEFAULT_ITEMS = [
  {
    name: "Urea 46% N",
    category: "fertilizer",
    image:
      "https://images.unsplash.com/photo-1585314062604-1a357de8b000?auto=format&fit=crop&w=900&q=80",
    price: 299,
    unit: "50 kg bag",
    brand: "IFFCO",
    bestFor: "Wheat, Paddy",
    stockQty: 40,
    description: "High nitrogen fertilizer for vegetative growth.",
  },
  {
    name: "DAP 18-46",
    category: "fertilizer",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
    price: 1350,
    unit: "50 kg bag",
    brand: "Coromandel",
    bestFor: "Cotton, Maize",
    stockQty: 22,
    description: "Balanced phosphate-rich fertilizer.",
  },
  {
    name: "Power Sprayer 20L",
    category: "equipment",
    image:
      "https://images.unsplash.com/photo-1625768372444-16f6c68f0f13?auto=format&fit=crop&w=900&q=80",
    price: 3499,
    unit: "per unit",
    rentalAvailable: true,
    rentalPrice: 220,
    rentalUnit: "day",
    minimumRentalPeriod: 1,
    brand: "KisanPro",
    bestFor: "Pesticide spraying",
    stockQty: 12,
    description: "Portable sprayer with high-pressure output.",
  },
  {
    name: "Mini Seed Drill",
    category: "equipment",
    image:
      "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?auto=format&fit=crop&w=900&q=80",
    price: 8999,
    unit: "per unit",
    rentalAvailable: true,
    rentalPrice: 900,
    rentalUnit: "day",
    minimumRentalPeriod: 2,
    brand: "AgroTech",
    bestFor: "Line sowing",
    stockQty: 8,
    description: "Compact seed drill suitable for medium farm operations.",
  },
];

let seedDone = false;
async function seedItemsIfNeeded() {
  if (seedDone) return;
  const count = await MarketItem.countDocuments();
  if (count > 0) {
    seedDone = true;
    return;
  }

  const adminLikeUserId = process.env.MARKET_SELLER_USER_ID || null;
  if (!adminLikeUserId) {
    seedDone = true;
    return;
  }

  const docs = DEFAULT_ITEMS.map((item) => ({
    ...item,
    sellerId: adminLikeUserId,
  }));
  await MarketItem.insertMany(docs);
  seedDone = true;
}

async function syncEquipmentListingsToMarketItems() {
  const equipmentListings = await Listing.find({
    providerRole: "equipment_provider",
  }).select("_id ownerId title description price priceUnit available meta");

  if (!equipmentListings.length) return;

  const listingIds = equipmentListings.map((l) => String(l._id));

  // Deactivate previously mirrored items whose source listing no longer exists.
  await MarketItem.updateMany(
    {
      category: "equipment",
      "meta.source": "listing",
      "meta.sourceListingId": { $nin: listingIds },
    },
    { $set: { isActive: false } }
  );

  const ops = equipmentListings.map((listing) => {
    const listingType = listing?.meta?.listingType === "rent" ? "rent" : "sell";
    const normalizedUnit = ["hour", "day", "week"].includes(listing.priceUnit)
      ? listing.priceUnit
      : "day";

    const update = {
      sellerId: listing.ownerId,
      name: listing.title,
      category: "equipment",
      description: listing.description || "",
      brand: listing?.meta?.brand || "",
      bestFor: listing?.meta?.useCase || "",
      image: listing?.meta?.image || "",
      price: Number(listing.price || 0),
      unit: listing?.meta?.listingType === "rent" ? `per ${normalizedUnit}` : "per unit",
      rentalAvailable: listingType === "rent",
      rentalPrice: listingType === "rent" ? Number(listing.price || 0) : 0,
      rentalUnit: normalizedUnit,
      minimumRentalPeriod: 1,
      stockQty: Number.isFinite(Number(listing?.meta?.stock))
        ? Number(listing.meta.stock)
        : listing.available
          ? 1
          : 0,
      isActive: Boolean(listing.available),
      meta: {
        source: "listing",
        sourceListingId: String(listing._id),
        listingType,
      },
    };

    return {
      updateOne: {
        filter: {
          category: "equipment",
          "meta.source": "listing",
          "meta.sourceListingId": String(listing._id),
        },
        update: { $set: update },
        upsert: true,
      },
    };
  });

  if (ops.length) {
    await MarketItem.bulkWrite(ops, { ordered: false });
  }
}

exports.listMarketItems = async (req, res) => {
  try {
    await seedItemsIfNeeded();
    await syncEquipmentListingsToMarketItems();

    const { query, category } = req.query;
    const filter = { isActive: true };

    if (category && ["fertilizer", "equipment"].includes(category)) {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { bestFor: { $regex: query, $options: "i" } },
      ];
    }

    const items = await MarketItem.find(filter)
      .populate("sellerId", "name role")
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (err) {
    console.error("LIST MARKET ITEMS ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to fetch market items" });
  }
};

exports.createMarketItem = async (req, res) => {
  try {
    if (!["equipment_provider", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only equipment providers can add market items" });
    }

    const {
      name,
      category,
      description,
      brand,
      bestFor,
      image,
      price,
      unit,
      stockQty,
      rentalAvailable,
      rentalPrice,
      rentalUnit,
      minimumRentalPeriod,
    } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: "name, category and price are required" });
    }

    if (!["fertilizer", "equipment"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const item = await MarketItem.create({
      sellerId: req.user.userId,
      name,
      category,
      description: description || "",
      brand: brand || "",
      bestFor: bestFor || "",
      image: image || "",
      price: Number(price),
      unit: unit || "per unit",
      rentalAvailable: Boolean(rentalAvailable) && category === "equipment",
      rentalPrice: category === "equipment" && rentalAvailable ? Number(rentalPrice) || 0 : 0,
      rentalUnit: category === "equipment" && rentalAvailable ? rentalUnit || "day" : "day",
      minimumRentalPeriod:
        category === "equipment" && rentalAvailable
          ? Math.max(1, Number(minimumRentalPeriod) || 1)
          : 1,
      stockQty: Number.isFinite(Number(stockQty)) ? Number(stockQty) : 0,
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error("CREATE MARKET ITEM ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to create market item" });
  }
};

exports.getMyMarketItems = async (req, res) => {
  try {
    const items = await MarketItem.find({ sellerId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    console.error("GET MY MARKET ITEMS ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to fetch your market items" });
  }
};

exports.createMarketOrder = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({ error: "Only farmers can place orders" });
    }

    const {
      itemId,
      quantity = 1,
      paymentMethod,
      orderType = "purchase",
      rentalDuration,
      deliveryAddress,
    } = req.body;
    if (!itemId || !paymentMethod) {
      return res.status(400).json({ error: "itemId and paymentMethod are required" });
    }

    if (!deliveryAddress?.fullAddress || !deliveryAddress?.pincode) {
      return res.status(400).json({ error: "Delivery address and pincode are required" });
    }

    if (!["online", "offline"].includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    if (!["purchase", "rental"].includes(orderType)) {
      return res.status(400).json({ error: "Invalid order type" });
    }

    const item = await MarketItem.findById(itemId);
    if (!item || !item.isActive) {
      return res.status(404).json({ error: "Item not found" });
    }

    const qty = Math.max(1, Number(quantity) || 1);

    if (orderType === "rental") {
      if (item.category !== "equipment" || !item.rentalAvailable) {
        return res.status(400).json({ error: "This item is not available for rental" });
      }

      const duration = Math.max(1, Number(rentalDuration) || 0);
      if (duration < item.minimumRentalPeriod) {
        return res.status(400).json({ error: `Minimum rental period is ${item.minimumRentalPeriod} ${item.rentalUnit}(s)` });
      }
    }

    if (item.stockQty < qty) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    item.stockQty -= qty;
    await item.save();

    const normalizedOrderType = orderType === "rental" ? "rental" : "purchase";
    const normalizedRentalDuration = normalizedOrderType === "rental" ? Math.max(1, Number(rentalDuration) || 1) : null;
    const unitPrice = normalizedOrderType === "rental" ? item.rentalPrice : item.price;
    const totalAmount = normalizedOrderType === "rental"
      ? unitPrice * qty * normalizedRentalDuration
      : item.price * qty;

    const order = await MarketOrder.create({
      farmerId: req.user.userId,
      sellerId: item.sellerId,
      itemId: item._id,
      quantity: qty,
      orderType: normalizedOrderType,
      rentalDuration: normalizedRentalDuration,
      rentalUnit: normalizedOrderType === "rental" ? item.rentalUnit : null,
      unitPrice,
      totalAmount,
      paymentMethod,
      deliveryAddress: {
        fullAddress: String(deliveryAddress.fullAddress || "").trim(),
        villageTown: String(deliveryAddress.villageTown || "").trim(),
        pincode: String(deliveryAddress.pincode || "").trim(),
        landmark: String(deliveryAddress.landmark || "").trim(),
      },
      status: "placed",
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("CREATE MARKET ORDER ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
};

exports.getMyMarketOrders = async (req, res) => {
  try {
    const orders = await MarketOrder.find({ farmerId: req.user.userId })
      .populate("itemId", "name category image unit")
      .populate("sellerId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("GET MY MARKET ORDERS ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

exports.getProviderMarketOrders = async (req, res) => {
  try {
    const orders = await MarketOrder.find({ sellerId: req.user.userId })
      .populate("itemId", "name category image unit")
      .populate("farmerId", "name mobile")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("GET PROVIDER MARKET ORDERS ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to fetch provider orders" });
  }
};

exports.getProviderAnalytics = async (req, res) => {
  try {
    const providerId = req.user.userId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [bookings, listings, marketOrders] = await Promise.all([
      Booking.find({ providerId }).populate("listingId", "title"),
      Listing.find({ ownerId: providerId }).select("title"),
      MarketOrder.find({ sellerId: providerId }).populate("itemId", "name"),
    ]);

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) => b.status === "completed").length;
    const monthlyBookings = bookings.filter((b) => new Date(b.createdAt) >= monthStart).length;

    const conversionRate = totalBookings
      ? Number(((completedBookings / totalBookings) * 100).toFixed(1))
      : 0;

    const topCounter = new Map();
    bookings.forEach((b) => {
      const key = b.listingId?.title || "Unknown service";
      topCounter.set(key, (topCounter.get(key) || 0) + 1);
    });
    marketOrders.forEach((o) => {
      const key = o.itemId?.name || "Unknown item";
      topCounter.set(key, (topCounter.get(key) || 0) + 1);
    });

    let topItemService = "N/A";
    let topCount = 0;
    for (const [name, count] of topCounter.entries()) {
      if (count > topCount) {
        topItemService = name;
        topCount = count;
      }
    }

    const confirmedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "started" || b.status === "completed");
    const responseSamples = confirmedBookings
      .map((b) => {
        const created = new Date(b.createdAt).getTime();
        const reference = b.confirmedAt ? new Date(b.confirmedAt).getTime() : new Date(b.updatedAt).getTime();
        if (!created || !reference || reference < created) return null;
        return (reference - created) / (1000 * 60);
      })
      .filter((v) => v !== null);

    const averageResponseTimeMinutes = responseSamples.length
      ? Number((responseSamples.reduce((a, b) => a + b, 0) / responseSamples.length).toFixed(1))
      : 0;

    res.json({
      success: true,
      analytics: {
        monthlyBookings,
        totalBookings,
        completedBookings,
        conversionRate,
        topItemService,
        averageResponseTimeMinutes,
        totalListings: listings.length,
        totalItemOrders: marketOrders.length,
      },
    });
  } catch (err) {
    console.error("GET PROVIDER ANALYTICS ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
};
