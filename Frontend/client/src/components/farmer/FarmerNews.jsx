import { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiBookOpen,
  FiClipboard,
  FiCreditCard,
  FiExternalLink,
  FiFilter,
  FiPlay,
  FiSearch,
  FiShield,
  FiTrendingUp,
  FiUser,
  FiVideo,
} from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

// ── Farmer-role scheme videos ──────────────────────────────────────────────
const FARMER_SCHEME_VIDEOS = [
  {
    id: "v1",
    title: "PM-KISAN: Registration & Benefits Explained",
    description: "How to register and receive ₹6,000/year income support under PM-KISAN Samman Nidhi",
    videoId: "gQ5prVO8vy8",
    category: "subsidy",
    channel: "PIB India",
  },
  {
    id: "v2",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Protect your crops from natural calamities with the government crop insurance scheme",
    videoId: "8aFQDmODoGk",
    category: "insurance",
    channel: "Doordarshan Kisan",
  },
  {
    id: "v3",
    title: "Kisan Credit Card – Apply Online Guide",
    description: "Get easy farm credit at low interest rates with the Kisan Credit Card scheme",
    videoId: "rY7dWDh3F6I",
    category: "credit",
    channel: "NABARD India",
  },
  {
    id: "v4",
    title: "Soil Health Card Scheme Explained",
    description: "Improve your crop yield by understanding your soil using the Soil Health Card program",
    videoId: "SZ1oMuYkEpg",
    category: "support",
    channel: "Ministry of Agriculture",
  },
  {
    id: "v5",
    title: "SMAM – Farm Equipment Subsidy Scheme",
    description: "Get subsidized agricultural machinery through Sub-Mission on Agricultural Mechanization",
    videoId: "OQKn0wNOi98",
    category: "support",
    channel: "Ministry of Agriculture",
  },
  {
    id: "v6",
    title: "KCC Full Application Walkthrough",
    description: "Complete step-by-step guide to applying for a Kisan Credit Card at your bank",
    videoId: "WgEJHqiJBq0",
    category: "credit",
    channel: "RBI India",
  },
];

// ── Labour / Women-empowerment role scheme videos ────────────────────────────
const LABOUR_SCHEME_VIDEOS = [
  {
    id: "l1",
    title: "PM Mudra Yojana (PMMY) – Women Entrepreneurs",
    description: "Get collateral-free loans up to ₹10 lakh to start or expand a women-led micro enterprise",
    videoId: "G3sNKLb3bvE",
    category: "women_loan",
    channel: "PIB India",
  },
  {
    id: "l2",
    title: "DAY-NRLM – Self Help Group (SHG) Bank Loans",
    description: "How rural women's SHGs access affordable credit and government livelihood support",
    videoId: "Y1E3Z5xQFJY",
    category: "livelihood",
    channel: "Ministry of Rural Development",
  },
  {
    id: "l3",
    title: "Udyogini Scheme – Subsidised Loans for Women",
    description: "SC/ST and BPL women get up to 30% subsidy on loans to start income-generating businesses",
    videoId: "vM7lZJQGcLs",
    category: "entrepreneurship",
    channel: "NABARD India",
  },
  {
    id: "l4",
    title: "PMEGP – Subsidy for Women-Led Enterprises",
    description: "Women entrepreneurs receive up to 35% government subsidy on project cost under PMEGP",
    videoId: "V8pBo6Kn3fk",
    category: "entrepreneurship",
    channel: "KVIC India",
  },
  {
    id: "l5",
    title: "Mahila Shakti Kendra – Skill & Livelihood Support",
    description: "Community centres offering skill training, digital literacy and job linkages for rural women",
    videoId: "2kEPEdST2qs",
    category: "livelihood",
    channel: "WCD Ministry",
  },
  {
    id: "l6",
    title: "Sukanya Samriddhi Yojana – Girl Child Savings",
    description: "Open a high-interest government savings account for your daughter's education and future",
    videoId: "tREXpuFbIlw",
    category: "women_loan",
    channel: "India Post",
  },
];

import { getGovernmentSchemes, getSuccessNews } from "@/services/newsService";

const schemeAccentMap = {
  subsidy:         {
    icon: FiCreditCard,
    accent: "bg-emerald-100 border-emerald-300 text-emerald-900",
    card: "border-emerald-300 bg-gradient-to-br from-white via-emerald-50 to-lime-100/70",
    chip: "border-emerald-300 bg-emerald-100 text-emerald-800",
    cta: "text-emerald-700 hover:text-emerald-800",
  },
  insurance:       {
    icon: FiShield,
    accent: "bg-sky-100 border-sky-300 text-sky-900",
    card: "border-sky-300 bg-gradient-to-br from-white via-sky-50 to-cyan-100/70",
    chip: "border-sky-300 bg-sky-100 text-sky-800",
    cta: "text-sky-700 hover:text-sky-800",
  },
  credit:          {
    icon: FiClipboard,
    accent: "bg-orange-100 border-orange-300 text-orange-900",
    card: "border-orange-300 bg-gradient-to-br from-white via-orange-50 to-amber-100/80",
    chip: "border-orange-300 bg-orange-100 text-orange-800",
    cta: "text-orange-700 hover:text-orange-800",
  },
  support:         {
    icon: FiClipboard,
    accent: "bg-lime-100 border-lime-300 text-lime-900",
    card: "border-lime-300 bg-gradient-to-br from-white via-lime-50 to-yellow-100/70",
    chip: "border-lime-300 bg-lime-100 text-lime-800",
    cta: "text-lime-700 hover:text-lime-800",
  },
  // Labour-role categories
  women_loan:      {
    icon: FiCreditCard,
    accent: "bg-pink-100 border-pink-300 text-pink-900",
    card: "border-pink-300 bg-gradient-to-br from-white via-pink-50 to-rose-100/80",
    chip: "border-pink-300 bg-pink-100 text-pink-800",
    cta: "text-pink-700 hover:text-pink-800",
  },
  livelihood:      {
    icon: FiUser,
    accent: "bg-amber-100 border-amber-300 text-amber-900",
    card: "border-amber-300 bg-gradient-to-br from-white via-amber-50 to-orange-100/70",
    chip: "border-amber-300 bg-amber-100 text-amber-800",
    cta: "text-amber-700 hover:text-amber-800",
  },
  entrepreneurship:{
    icon: FiBriefcase,
    accent: "bg-violet-100 border-violet-300 text-violet-900",
    card: "border-violet-300 bg-gradient-to-br from-white via-violet-50 to-fuchsia-100/75",
    chip: "border-violet-300 bg-violet-100 text-violet-800",
    cta: "text-violet-700 hover:text-violet-800",
  },
};

const FARMER_CATEGORY_OPTIONS = [
  { value: "all",       label: "All Categories" },
  { value: "insurance", label: "Insurance" },
  { value: "subsidy",   label: "Subsidy" },
  { value: "credit",    label: "Credit" },
  { value: "support",   label: "Support" },
];

const LABOUR_CATEGORY_OPTIONS = [
  { value: "all",            label: "All Categories" },
  { value: "women_loan",     label: "Women Loans" },
  { value: "livelihood",     label: "Livelihood" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "support",        label: "Support" },
];

const SCHEME_THEME_ASSETS = {
  subsidy: {
    src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
    title: "Farm Equipment Subsidy",
  },
  insurance: {
    src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80",
    title: "Crop Risk Protection",
  },
  credit: {
    src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    title: "Farm Credit Support",
  },
  support: {
    src: "https://images.unsplash.com/photo-1592982537447-6f2a6a0f2f38?auto=format&fit=crop&w=900&q=80",
    title: "Farmer Guidance & Support",
  },
  women_loan: {
    src: "https://images.unsplash.com/photo-1573164574230-db1d5e960238?auto=format&fit=crop&w=900&q=80",
    title: "Women Loan Access",
  },
  livelihood: {
    src: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=900&q=80",
    title: "Rural Livelihood Programs",
  },
  entrepreneurship: {
    src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
    title: "Women Entrepreneurship",
  },
};

const STORY_CARD_THEMES = [
  {
    card: "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/60",
    statePill: "bg-emerald-100 border-emerald-300 text-emerald-800",
    cropTile: "border-emerald-300 bg-emerald-100/70",
    cropLabel: "text-emerald-700",
    cropValue: "text-emerald-900",
    impactTile: "border-orange-300 bg-orange-100/80",
    impactLabel: "text-orange-700",
    impactValue: "text-orange-800",
    link: "text-[#F57C00] hover:text-[#d86f0a]",
  },
  {
    card: "border-sky-300 bg-gradient-to-br from-white via-sky-50 to-cyan-100/70",
    statePill: "bg-sky-100 border-sky-300 text-sky-800",
    cropTile: "border-sky-300 bg-sky-100/70",
    cropLabel: "text-sky-700",
    cropValue: "text-sky-900",
    impactTile: "border-violet-300 bg-violet-100/80",
    impactLabel: "text-violet-700",
    impactValue: "text-violet-800",
    link: "text-sky-700 hover:text-sky-800",
  },
  {
    card: "border-rose-300 bg-gradient-to-br from-white via-rose-50 to-pink-100/75",
    statePill: "bg-rose-100 border-rose-300 text-rose-800",
    cropTile: "border-rose-300 bg-rose-100/70",
    cropLabel: "text-rose-700",
    cropValue: "text-rose-900",
    impactTile: "border-amber-300 bg-amber-100/80",
    impactLabel: "text-amber-700",
    impactValue: "text-amber-800",
    link: "text-rose-700 hover:text-rose-800",
  },
  {
    card: "border-teal-300 bg-gradient-to-br from-white via-teal-50 to-lime-100/70",
    statePill: "bg-teal-100 border-teal-300 text-teal-800",
    cropTile: "border-teal-300 bg-teal-100/70",
    cropLabel: "text-teal-700",
    cropValue: "text-teal-900",
    impactTile: "border-lime-300 bg-lime-100/80",
    impactLabel: "text-lime-700",
    impactValue: "text-lime-800",
    link: "text-teal-700 hover:text-teal-800",
  },
];

const VIDEO_CARD_THEMES = [
  {
    card: "border-emerald-300 bg-gradient-to-br from-white via-emerald-50 to-lime-100/70",
    channel: "text-emerald-600",
    play: "text-[#F57C00]",
  },
  {
    card: "border-orange-300 bg-gradient-to-br from-white via-orange-50 to-amber-100/80",
    channel: "text-orange-600",
    play: "text-rose-500",
  },
  {
    card: "border-sky-300 bg-gradient-to-br from-white via-sky-50 to-cyan-100/75",
    channel: "text-sky-600",
    play: "text-sky-500",
  },
];

function FarmerNews() {
  const { role } = useAuth();

  const isLabour = role === "labour";
  const activeSchemeVideos = isLabour ? LABOUR_SCHEME_VIDEOS : FARMER_SCHEME_VIDEOS;
  const categoryOptions    = isLabour ? LABOUR_CATEGORY_OPTIONS : FARMER_CATEGORY_OPTIONS;

  const [stories, setStories] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [query, setQuery] = useState("");
  const [schemeQuery, setSchemeQuery] = useState("");
  const [schemeCategory, setSchemeCategory] = useState("all");
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [error, setError] = useState("");
  const [schemesError, setSchemesError] = useState("");

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getSuccessNews(query.trim());
        setStories(Array.isArray(res.stories) ? res.stories : []);
      } catch (err) {
        setStories([]);
        setError(err.response?.data?.error || "Failed to load success stories");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchStories, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchSchemes = async () => {
      setSchemesLoading(true);
      setSchemesError("");
      try {
        const res = await getGovernmentSchemes({
          query: schemeQuery.trim(),
          category: schemeCategory,
        });
        setSchemes(Array.isArray(res.schemes) ? res.schemes : []);
      } catch (err) {
        setSchemes([]);
        setSchemesError(err.response?.data?.error || "Failed to load government schemes");
      } finally {
        setSchemesLoading(false);
      }
    };

    const timer = setTimeout(fetchSchemes, 250);
    return () => clearTimeout(timer);
  }, [schemeQuery, schemeCategory]);

  const filteredStories = useMemo(() => {
    return stories.map((story) => ({
      id: story._id,
      ...story,
    }));
  }, [stories]);

  const getStaggerStyle = (index, baseDelay = 0) => ({
    animationDelay: `${baseDelay + index * 90}ms`,
  });

  return (
    <div className="min-h-screen px-6 py-8 bg-[radial-gradient(circle_at_top_left,#fff2d7_0%,#d9f99d_28%,#ffffff_72%),radial-gradient(circle_at_bottom_right,#ffd7a8_0%,rgba(255,215,168,0)_42%),radial-gradient(circle_at_center,#ecfccb_0%,rgba(236,252,203,0)_45%)]">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="rounded-3xl border border-[#d8e8d2] bg-[linear-gradient(160deg,#ffffff_0%,#f4ffe8_35%,#fff2df_100%)] shadow-[0_10px_28px_rgba(48,72,34,0.08)] p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-[#1f5f2c] flex items-center gap-2">
                <FiBookOpen /> Farmer Success Stories
              </h1>
              <p className="text-[#3b5f41] mt-1">
                Real examples from Indian farmers on productivity, income, and smart practices.
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
            <div className="bg-gradient-to-r from-orange-200 via-amber-200 to-lime-200 text-orange-950 border border-orange-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
              <FiTrendingUp />
              {filteredStories.length} stories
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#d9ead3] bg-[linear-gradient(135deg,#f7fff0_0%,#ebffd8_42%,#fff0d9_100%)] p-5 shadow-inner">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">
                  {isLabour ? "Women Empowerment Schemes" : "Government Schemes"}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#1f5f2c]">
                  {isLabour
                    ? "Loans & support programs for women"
                    : "Support programs every farmer should know"}
                </h2>
                <p className="mt-2 text-sm text-[#46624b] max-w-3xl">
                  {isLabour
                    ? "Discover government loans, subsidies and livelihood schemes designed to empower women workers and entrepreneurs."
                    : "Discover major government schemes for income support, crop protection, and affordable farm credit in the same place as success stories."}
                </p>
                {schemesError && <p className="text-xs text-red-600 mt-2">{schemesError}</p>}
              </div>
              <a
                href="https://www.myscheme.gov.in/search/category/Agriculture,Rural%20&%20Environment"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50 shadow-sm"
              >
                Explore All Schemes <FiExternalLink />
              </a>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-white via-emerald-50 to-lime-100/70 border border-green-300 rounded-xl px-4 py-3">
                <FiSearch className="text-green-700" />
                <input
                  value={schemeQuery}
                  onChange={(e) => setSchemeQuery(e.target.value)}
                  placeholder="Search schemes by benefit, eligibility, or keyword"
                  className="w-full bg-transparent outline-none text-[#27442f] placeholder:text-[#6d8a72]"
                />
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-white via-orange-50 to-amber-100/70 border border-orange-300 rounded-xl px-4 py-3">
                <FiFilter className="text-green-700" />
                <select
                  value={schemeCategory}
                  onChange={(e) => setSchemeCategory(e.target.value)}
                  className="w-full bg-transparent outline-none text-[#27442f]"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {schemesLoading ? (
              <div className="mt-5 rounded-2xl border border-green-200 bg-gradient-to-r from-white to-green-50 p-6 text-center text-[#516b56]">
                Loading schemes...
              </div>
            ) : schemes.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-white to-amber-50 p-6 text-center text-[#516b56]">
                No schemes found for this filter.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {schemes.map((scheme, index) => {
                  const theme = schemeAccentMap[scheme.category] || schemeAccentMap.support;
                  const Icon = theme.icon;
                  const asset = SCHEME_THEME_ASSETS[scheme.category] || SCHEME_THEME_ASSETS.support;

                  return (
                    <article
                      key={scheme.id}
                      className={`farmer-news-reveal rounded-2xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${theme.card}`}
                      style={getStaggerStyle(index, 40)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${theme.accent}`}>
                          <Icon className="text-lg" />
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${theme.chip}`}>
                          {scheme.category}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-[#21452a]">{scheme.title}</h3>
                      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <img
                          src={asset.src}
                          alt={asset.title}
                          loading="lazy"
                          className="h-24 w-full object-cover"
                        />
                        <div className="flex items-center justify-between gap-2 bg-white/95 px-3 py-2">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-600">{asset.title}</p>
                          <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-gray-700">
                            {scheme.category}
                          </span>
                        </div>
                      </div>
                      <div className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${theme.accent}`}>
                        <span className="opacity-80">Scheme Theme</span>
                        <span className="rounded-md bg-white/70 px-2 py-0.5 capitalize">{scheme.category}</span>
                      </div>
                      <p className="mt-2 text-sm text-[#4f6e56] leading-relaxed">{scheme.benefit}</p>

                      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Who can apply</p>
                        <p className="mt-1 text-sm text-gray-700">{scheme.eligibility}</p>
                      </div>

                      <a
                        href={scheme.link}
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${theme.cta}`}
                      >
                        Check Scheme Details <FiExternalLink />
                      </a>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── YouTube Videos Section ── */}
          {(() => {
            const visibleVideos =
              schemeCategory === "all"
                ? activeSchemeVideos
                : activeSchemeVideos.filter((v) => v.category === schemeCategory);
            if (visibleVideos.length === 0) return null;
            const videoSectionLabel = isLabour ? "Women Empowerment Videos" : "Helpful Videos";
            return (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FiVideo className={isLabour ? "text-pink-600 text-lg" : "text-green-700 text-lg"} />
                  <h3 className="text-base font-bold text-[#1f5f2c]">
                    {videoSectionLabel}
                    {schemeCategory !== "all" && (
                      <span className={`ml-2 text-xs font-semibold capitalize px-2 py-0.5 rounded-full border ${
                        isLabour
                          ? "text-pink-700 bg-pink-50 border-pink-200"
                          : "text-green-600 bg-green-50 border-green-200"
                      }`}>
                        {categoryOptions.find((o) => o.value === schemeCategory)?.label ?? schemeCategory}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleVideos.map((vid, index) => {
                    const videoTheme = VIDEO_CARD_THEMES[index % VIDEO_CARD_THEMES.length];
                    const videoAsset = SCHEME_THEME_ASSETS[vid.category] || SCHEME_THEME_ASSETS.support;

                    return (
                    <div
                      key={vid.id}
                      className={`farmer-news-reveal rounded-2xl border overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-md ${videoTheme.card}`}
                      style={getStaggerStyle(index, 80)}
                    >
                      {activeVideo === vid.id ? (
                        <div className="aspect-video w-full">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${vid.videoId}?autoplay=1&rel=0`}
                            title={vid.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveVideo(vid.id)}
                          className="relative w-full aspect-video overflow-hidden group focus:outline-none"
                          aria-label={`Play ${vid.title}`}
                        >
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                            style={{ backgroundImage: `url(${videoAsset.src})` }}
                            aria-hidden="true"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-[#173f28]/25 via-black/20 to-black/55" />
                          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-4 py-3">
                            <span className="rounded-full border border-white/40 bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                              {videoAsset.title}
                            </span>
                            <span className="rounded-full border border-white/35 bg-black/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                              {vid.channel}
                            </span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/20">
                            <span className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <FiPlay className={`text-2xl ml-1 ${videoTheme.play}`} />
                            </span>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 px-4 py-4 text-left">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                              Video guide
                            </p>
                            <p className="mt-1 max-w-[85%] text-sm font-bold leading-snug text-white drop-shadow-sm">
                              {vid.title}
                            </p>
                          </div>
                        </button>
                      )}
                      <div className="p-4">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${videoTheme.channel}`}>
                          {vid.channel}
                        </p>
                        <h4 className="text-sm font-bold text-[#1f3f28] leading-snug">{vid.title}</h4>
                        <p className="mt-1 text-xs text-[#4f6e56] leading-relaxed">{vid.description}</p>
                        <a
                          href={`https://www.youtube.com/watch?v=${vid.videoId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#F57C00] hover:text-[#d86f0a]"
                        >
                          <FaYoutube className="text-red-600" />
                          Watch Videos on YouTube
                          <FiExternalLink />
                        </a>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="mt-5 flex items-center gap-3 bg-gradient-to-r from-[#f3ffe9] via-[#fff7e9] to-[#ffe9d2] border border-green-300 rounded-xl px-4 py-3">
            <FiSearch className="text-green-700" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by farmer, state, crop, or keyword"
              className="w-full bg-transparent outline-none text-[#27442f] placeholder:text-[#6d8a72]"
            />
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl bg-white border border-green-200 p-10 text-center text-[#516b56]">
            Loading stories...
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="rounded-2xl bg-white border border-green-200 p-10 text-center text-[#516b56]">
            No matching stories found.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredStories.map((story, index) => {
              const theme = STORY_CARD_THEMES[index % STORY_CARD_THEMES.length];

              return (
              <article
                key={story.id}
                className={`farmer-news-reveal rounded-2xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${theme.card}`}
                style={getStaggerStyle(index, 120)}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-green-800">{story.farmerName}</p>
                  <span className={`text-xs px-2 py-1 rounded-full border ${theme.statePill}`}>
                    {story.state}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold text-[#1f3f28]">{story.title}</h2>
                <p className="mt-2 text-sm text-[#5f7a65] leading-relaxed">{story.summary}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className={`rounded-lg border px-3 py-2 ${theme.cropTile}`}>
                    <p className={theme.cropLabel}>Primary Crop</p>
                    <p className={`font-semibold ${theme.cropValue}`}>{story.crop}</p>
                  </div>
                  <div className={`rounded-lg border px-3 py-2 ${theme.impactTile}`}>
                    <p className={theme.impactLabel}>Impact</p>
                    <p className={`font-semibold ${theme.impactValue}`}>{story.impact}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Source: {story.source}</p>
                  <a
                    href={story.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${theme.link}`}
                  >
                    Read More <FiExternalLink />
                  </a>
                </div>
              </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default FarmerNews;
