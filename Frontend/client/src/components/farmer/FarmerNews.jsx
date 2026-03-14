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
  subsidy:         { icon: FiCreditCard,  accent: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  insurance:       { icon: FiShield,      accent: "bg-sky-50 border-sky-200 text-sky-800" },
  credit:          { icon: FiClipboard,   accent: "bg-orange-50 border-orange-200 text-orange-800" },
  support:         { icon: FiClipboard,   accent: "bg-lime-50 border-lime-200 text-lime-800" },
  // Labour-role categories
  women_loan:      { icon: FiCreditCard,  accent: "bg-pink-50 border-pink-200 text-pink-800" },
  livelihood:      { icon: FiUser,        accent: "bg-amber-50 border-amber-200 text-amber-800" },
  entrepreneurship:{ icon: FiBriefcase,   accent: "bg-violet-50 border-violet-200 text-violet-800" },
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

  return (
    <div className="min-h-screen px-6 py-8 bg-[radial-gradient(circle_at_top,#F5F5DC_0%,#D9F99D_45%,#ffffff_100%)]">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="rounded-3xl bg-white border border-green-200 shadow-sm p-6">
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
            <div className="bg-orange-100 text-orange-800 border border-orange-200 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <FiTrendingUp />
              {filteredStories.length} stories
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#d9ead3] bg-[linear-gradient(135deg,#f7fff0_0%,#eef9e4_100%)] p-5">
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
                className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
              >
                Explore All Schemes <FiExternalLink />
              </a>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-3">
              <div className="flex items-center gap-3 bg-white border border-green-200 rounded-xl px-4 py-3">
                <FiSearch className="text-green-700" />
                <input
                  value={schemeQuery}
                  onChange={(e) => setSchemeQuery(e.target.value)}
                  placeholder="Search schemes by benefit, eligibility, or keyword"
                  className="w-full bg-transparent outline-none text-[#27442f] placeholder:text-[#6d8a72]"
                />
              </div>
              <div className="flex items-center gap-3 bg-white border border-green-200 rounded-xl px-4 py-3">
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
              <div className="mt-5 rounded-2xl border border-green-200 bg-white p-6 text-center text-[#516b56]">
                Loading schemes...
              </div>
            ) : schemes.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-green-200 bg-white p-6 text-center text-[#516b56]">
                No schemes found for this filter.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {schemes.map((scheme) => {
                  const theme = schemeAccentMap[scheme.category] || schemeAccentMap.support;
                  const Icon = theme.icon;

                  return (
                    <article
                      key={scheme.id}
                      className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${theme.accent}`}>
                          <Icon className="text-lg" />
                        </div>
                        <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 capitalize">
                          {scheme.category}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-[#21452a]">{scheme.title}</h3>
                      <p className="mt-2 text-sm text-[#4f6e56] leading-relaxed">{scheme.benefit}</p>

                      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Who can apply</p>
                        <p className="mt-1 text-sm text-gray-700">{scheme.eligibility}</p>
                      </div>

                      <a
                        href={scheme.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#F57C00] hover:text-[#d86f0a]"
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
                  {visibleVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className={`rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition ${
                        isLabour ? "border-pink-200" : "border-green-200"
                      }`}
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
                          className="relative w-full aspect-video bg-gray-100 overflow-hidden group focus:outline-none"
                          aria-label={`Play ${vid.title}`}
                        >
                          <img
                            src={`https://img.youtube.com/vi/${vid.videoId}/hqdefault.jpg`}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
                            <span className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <FiPlay className={`text-2xl ml-1 ${isLabour ? "text-pink-500" : "text-[#F57C00]"}`} />
                            </span>
                          </div>
                        </button>
                      )}
                      <div className="p-4">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
                          isLabour ? "text-pink-600" : "text-green-600"
                        }`}>
                          {vid.channel}
                        </p>
                        <h4 className="text-sm font-bold text-[#1f3f28] leading-snug">{vid.title}</h4>
                        <p className="mt-1 text-xs text-[#4f6e56] leading-relaxed">{vid.description}</p>
                        <a
                          href={`https://www.youtube.com/watch?v=${vid.videoId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#F57C00] hover:text-[#d86f0a]"
                        >
                          Watch on YouTube <FiExternalLink />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="mt-5 flex items-center gap-3 bg-[#f8fbf5] border border-green-200 rounded-xl px-4 py-3">
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
            {filteredStories.map((story) => (
              <article
                key={story.id}
                className="rounded-2xl border border-green-200 bg-white shadow-sm hover:shadow-md transition p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-green-800">{story.farmerName}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">
                    {story.state}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold text-[#1f3f28]">{story.title}</h2>
                <p className="mt-2 text-sm text-[#5f7a65] leading-relaxed">{story.summary}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <p className="text-gray-500">Primary Crop</p>
                    <p className="font-semibold text-gray-800">{story.crop}</p>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                    <p className="text-orange-700">Impact</p>
                    <p className="font-semibold text-orange-800">{story.impact}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Source: {story.source}</p>
                  <a
                    href={story.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#F57C00] hover:text-[#d86f0a]"
                  >
                    Read More <FiExternalLink />
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default FarmerNews;
