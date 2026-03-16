import { Navigate } from "react-router-dom";
import {
  FiExternalLink, FiPlayCircle, FiMapPin,
  FiSun, FiUsers, FiTrendingUp, FiBook, FiCreditCard, FiBarChart2,
} from "react-icons/fi";

const WOMEN_SCHEMES = [
  {
    title: "Mahila Kisan Sashaktikaran Pariyojana (MKSP)",
    focus: "Builds skills, producer groups, and farm livelihoods for rural women farmers.",
    benefit: "Training, capacity-building, and stronger market participation.",
    youtube: "https://www.youtube.com/results?search_query=MKSP+Mahila+Kisan+Sashaktikaran+Pariyojana",
    icon: FiSun,
    tag: "Farming",
  },
  {
    title: "National Rural Livelihoods Mission (DAY-NRLM)",
    focus: "Supports SHGs and village-level federations for women in rural households.",
    benefit: "Credit access, enterprise support, and income generation for women.",
    youtube: "https://www.youtube.com/results?search_query=DAY+NRLM+women+self+help+group",
    icon: FiUsers,
    tag: "Livelihood",
  },
  {
    title: "Lakhpati Didi (SHG Entrepreneurship)",
    focus: "Encourages SHG women to become high-income rural entrepreneurs.",
    benefit: "Business mentoring, market linkage, and livelihood expansion.",
    youtube: "https://www.youtube.com/results?search_query=Lakhpati+Didi+scheme+rural+women",
    icon: FiTrendingUp,
    tag: "Entrepreneurship",
  },
  {
    title: "Deendayal Antyodaya Yojana – Skill & Livelihood",
    focus: "Rural women training for farm and non-farm work with local placement support.",
    benefit: "Skill development and improved employability in rural communities.",
    youtube: "https://www.youtube.com/results?search_query=DAY+NRLM+skill+training+women+rural",
    icon: FiBook,
    tag: "Skill Training",
  },
  {
    title: "Pradhan Mantri MUDRA Yojana for Women",
    focus: "Small business financing for women-led ventures in villages and small towns.",
    benefit: "Collateral-light loans under Shishu, Kishore, and Tarun categories.",
    youtube: "https://www.youtube.com/results?search_query=PM+MUDRA+Yojana+for+women+entrepreneurs+rural",
    icon: FiCreditCard,
    tag: "Women Loan",
  },
  {
    title: "PMEGP for Rural Women Enterprises",
    focus: "Helps women set up micro-enterprises in rural manufacturing and services.",
    benefit: "Subsidy-linked credit and project support for first-time entrepreneurs.",
    youtube: "https://www.youtube.com/results?search_query=PMEGP+women+rural+enterprise",
    icon: FiBarChart2,
    tag: "Subsidy",
  },
];

function WomenEmpowermentSchemes() {
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (role !== "labour") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8"
    //   style={{ background: "radial-gradient(circle at top left, #F5F5DC 0%, #D9F99D 40%, #ffffff 80%), radial-gradient(circle at bottom right, #FFE0B2 0%, rgba(255,224,178,0) 50%)" }}
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="rounded-3xl border border-[#a8d5b5] bg-[linear-gradient(135deg,#f0faf3_0%,#fff7ed_60%,#f8fbf5_100%)] p-6 shadow-[0_8px_28px_rgba(31,95,44,0.10)]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f5f2c] to-[#2e7d3e] shadow-md shadow-[#1f5f2c]/30 text-white text-xl">
              🌸
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F57C00]">Labour Women Support</p>
              <h1 className="mt-0.5 text-3xl font-extrabold text-[#1f5f2c] leading-tight">
                Rural Women Empowerment Schemes
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#3b5f41] max-w-2xl">
            Central and rural livelihood schemes that help women workers and self-help groups grow skills,
            income, and enterprise opportunities. 💪
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["🌾 Farming", "💰 Loans", "📚 Training", "🏪 Enterprise", "🤝 SHG Support"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#a8d5b5] bg-white/70 px-3 py-1 text-xs font-semibold text-[#1f5f2c]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#1f5f2c] to-[#F57C00]" />
        </div>

        {/* Scheme Cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {WOMEN_SCHEMES.map((scheme) => {
            const Icon = scheme.icon;
            return (
              <article
                key={scheme.title}
                className="rounded-2xl border border-[#a8d5b5] bg-[linear-gradient(135deg,#f0faf3_0%,#fff7ed_60%,#f8fbf5_100%)] p-5 shadow-[0_6px_20px_rgba(31,95,44,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(31,95,44,0.15)]"
              >
                {/* Card Header */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f5f2c] to-[#2e7d3e] shadow-md shadow-[#1f5f2c]/25 text-white">
                    <Icon size={20} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h2 className="text-base font-extrabold text-[#173A1E] leading-snug">{scheme.title}</h2>
                      <span className="shrink-0 rounded-full border border-[#f4c47a] bg-[#fff4e0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#b85f00]">
                        {scheme.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#4a7a55]">{scheme.focus}</p>
                  </div>
                </div>

                {/* Benefit Badge */}
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#a8d5b5] bg-white/60 px-3 py-2.5">
                  <span className="mt-0.5 text-[#F57C00] text-base">✅</span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3b5f41]">Key Benefit</p>
                    <p className="mt-0.5 text-sm font-medium text-[#173A1E]">{scheme.benefit}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={scheme.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1f5f2c] to-[#2e7d3e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#1f5f2c]/25 transition hover:brightness-110 active:scale-95"
                  >
                    <FiPlayCircle /> Watch on YouTube
                  </a>
                  <a
                    href={scheme.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#F57C00] bg-white px-4 py-2 text-sm font-semibold text-[#F57C00] transition hover:bg-[#fff4e0] active:scale-95"
                  >
                    <FiExternalLink /> Open Resource
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Tip Banner */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#a8d5b5] bg-[linear-gradient(135deg,#f0faf3,#fff7ed)] px-5 py-4 shadow-sm">
          <span className="text-xl mt-0.5">📍</span>
          <div className="text-sm text-[#3b5f41]">
            <span className="font-bold text-[#1f5f2c]">Tip: </span>
            <span className="inline-flex items-center gap-1.5">
              <FiMapPin className="inline text-[#F57C00]" />
              Check your state rural development department portal for local eligibility and district-level support.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WomenEmpowermentSchemes;
