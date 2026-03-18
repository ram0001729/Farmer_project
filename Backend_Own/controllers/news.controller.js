const SuccessNews = require("../models/SuccessNews.model");

const GOVERNMENT_SCHEMES = [
  {
    id: "pm-kisan",
    title: "PM-KISAN",
    category: "subsidy",
    benefit: "Income support of Rs 6,000 per year for eligible farmer families.",
    eligibility: "Small and marginal farmer families with valid land records.",
    source: "Ministry of Agriculture & Farmers Welfare",
    link: "https://pmkisan.gov.in/",
    tags: ["income support", "direct benefit", "small farmers"],
  },
  {
    id: "pmfby",
    title: "PM Fasal Bima Yojana",
    category: "insurance",
    benefit: "Crop insurance support against drought, flood, pest, and yield loss.",
    eligibility: "Farmers growing notified crops in notified areas.",
    source: "PMFBY",
    link: "https://pmfby.gov.in/",
    tags: ["crop insurance", "risk cover", "weather loss"],
  },
  {
    id: "kcc",
    title: "Kisan Credit Card",
    category: "credit",
    benefit: "Low-interest working capital for seeds, fertilizer, equipment, and allied needs.",
    eligibility: "Farmers, dairy operators, and fisheries workers meeting bank norms.",
    source: "MyScheme",
    link: "https://www.myscheme.gov.in/schemes/kcc",
    tags: ["credit", "crop loan", "working capital"],
  },
  {
    id: "smam",
    title: "SMAM Farm Mechanization",
    category: "subsidy",
    benefit: "Subsidy support for farm machinery and equipment adoption.",
    eligibility: "Individual farmers, cooperatives, SHGs, and FPOs under state implementation guidelines.",
    source: "agrimachinery.nic.in",
    link: "https://agrimachinery.nic.in/",
    tags: ["equipment subsidy", "tractor implements", "mechanization"],
  },
  {
    id: "soil-health-card",
    title: "Soil Health Card Scheme",
    category: "support",
    benefit: "Soil testing guidance for balanced fertilizer usage and better crop planning.",
    eligibility: "Farmers seeking soil nutrient recommendations for their fields.",
    source: "Ministry of Agriculture & Farmers Welfare",
    link: "https://soilhealth.dac.gov.in/",
    tags: ["soil testing", "fertility", "advisory"],
  },
];

exports.getSuccessNews = async (req, res) => {
  try {
    const { query } = req.query;
    const filter = { isPublished: true };

    if (query) {
      filter.$or = [
        { farmerName: { $regex: query, $options: "i" } },
        { state: { $regex: query, $options: "i" } },
        { crop: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } },
        { summary: { $regex: query, $options: "i" } },
      ];
    }

    const stories = await SuccessNews.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, stories });
  } catch (err) {
    console.error("GET SUCCESS NEWS ERROR:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch success news" });
  }
};

exports.createSuccessNews = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admin can create success news" });
    }

    const { farmerName, state, crop, title, summary, impact, source, link, image, isPublished } = req.body;

    if (!farmerName || !state || !crop || !title || !summary) {
      return res.status(400).json({ error: "farmerName, state, crop, title, summary are required" });
    }

    const story = await SuccessNews.create({
      farmerName,
      state,
      crop,
      title,
      summary,
      impact: impact || "",
      source: source || "",
      link: link || "",
      image: image || "",
      isPublished: typeof isPublished === "boolean" ? isPublished : true,
      createdBy: req.user.userId,
    });

    return res.status(201).json({ success: true, story });
  } catch (err) {
    console.error("CREATE SUCCESS NEWS ERROR:", err);
    return res.status(500).json({ success: false, error: "Failed to create success news" });
  }
};

exports.getGovernmentSchemes = async (req, res) => {
  try {
    const query = String(req.query.query || "").trim().toLowerCase();
    const category = String(req.query.category || "all").trim().toLowerCase();

    const filtered = GOVERNMENT_SCHEMES.filter((scheme) => {
      const categoryMatch = category === "all" || scheme.category === category;
      if (!categoryMatch) return false;

      if (!query) return true;

      const haystack = [
        scheme.title,
        scheme.benefit,
        scheme.eligibility,
        scheme.source,
        ...(scheme.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    return res.json({ success: true, schemes: filtered });
  } catch (err) {
    console.error("GET GOVERNMENT SCHEMES ERROR:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch government schemes" });
  }
};
