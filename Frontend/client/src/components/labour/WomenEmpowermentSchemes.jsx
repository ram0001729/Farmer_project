import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  FiExternalLink, FiPlayCircle, FiMapPin,
  FiSun, FiUsers, FiTrendingUp, FiBook, FiCreditCard, FiBarChart2,
} from "react-icons/fi";

const WOMEN_SCHEMES = [
  {
    id: "mksp",
    title: "Mahila Kisan Sashaktikaran Pariyojana (MKSP)",
    focus: "Builds skills, producer groups, and farm livelihoods for rural women farmers.",
    benefit: "Training, capacity-building, and stronger market participation.",
    youtube: "https://www.youtube.com/results?search_query=MKSP+Mahila+Kisan+Sashaktikaran+Pariyojana",
    icon: FiSun,
    tag: "Farming",
  },
  {
    id: "day_nrlm",
    title: "National Rural Livelihoods Mission (DAY-NRLM)",
    focus: "Supports SHGs and village-level federations for women in rural households.",
    benefit: "Credit access, enterprise support, and income generation for women.",
    youtube: "https://www.youtube.com/results?search_query=DAY+NRLM+women+self+help+group",
    icon: FiUsers,
    tag: "Livelihood",
  },
  {
    id: "lakhpati_didi",
    title: "Lakhpati Didi (SHG Entrepreneurship)",
    focus: "Encourages SHG women to become high-income rural entrepreneurs.",
    benefit: "Business mentoring, market linkage, and livelihood expansion.",
    youtube: "https://www.youtube.com/results?search_query=Lakhpati+Didi+scheme+rural+women",
    icon: FiTrendingUp,
    tag: "Entrepreneurship",
  },
  {
    id: "skill_livelihood",
    title: "Deendayal Antyodaya Yojana – Skill & Livelihood",
    focus: "Rural women training for farm and non-farm work with local placement support.",
    benefit: "Skill development and improved employability in rural communities.",
    youtube: "https://www.youtube.com/results?search_query=DAY+NRLM+skill+training+women+rural",
    icon: FiBook,
    tag: "Skill Training",
  },
  {
    id: "mudra_women",
    title: "Pradhan Mantri MUDRA Yojana for Women",
    focus: "Small business financing for women-led ventures in villages and small towns.",
    benefit: "Collateral-light loans under Shishu, Kishore, and Tarun categories.",
    youtube: "https://www.youtube.com/results?search_query=PM+MUDRA+Yojana+for+women+entrepreneurs+rural",
    icon: FiCreditCard,
    tag: "Women Loan",
  },
  {
    id: "pmegp_women",
    title: "PMEGP for Rural Women Enterprises",
    focus: "Helps women set up micro-enterprises in rural manufacturing and services.",
    benefit: "Subsidy-linked credit and project support for first-time entrepreneurs.",
    youtube: "https://www.youtube.com/results?search_query=PMEGP+women+rural+enterprise",
    icon: FiBarChart2,
    tag: "Subsidy",
  },
];

const STATES = [
  "Andhra Pradesh", "Bihar", "Gujarat", "Karnataka", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Other",
];

const OCCUPATIONS = [
  { value: "farm_labour", label: "Farm Labour" },
  { value: "farmer", label: "Farmer" },
  { value: "non_farm_worker", label: "Non-Farm Worker" },
  { value: "artisan", label: "Artisan" },
  { value: "entrepreneur", label: "Small Entrepreneur" },
  { value: "other", label: "Other" },
];

const INITIAL_ANSWERS = {
  age: "",
  monthlyIncome: "",
  casteCategory: "",
  shgMember: "",
  state: "",
  occupation: "",
  hasBankAccount: "",
};

const REQUIRED_FIELDS = ["age", "monthlyIncome", "casteCategory", "shgMember", "state", "occupation"];

const STATE_SCHEME_PREFERENCES = {
  mksp: ["Bihar", "Madhya Pradesh", "Odisha", "Rajasthan", "Telangana", "West Bengal"],
  day_nrlm: STATES.filter((state) => state !== "Other"),
  lakhpati_didi: ["Bihar", "Madhya Pradesh", "Odisha", "Uttar Pradesh", "West Bengal"],
  skill_livelihood: ["Andhra Pradesh", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana"],
  mudra_women: STATES.filter((state) => state !== "Other"),
  pmegp_women: STATES.filter((state) => state !== "Other"),
};

const SCHEME_OFFICIAL_LINKS = {
  mksp: "https://aajeevika.gov.in/en/content/mahila-kisan-sashaktikaran-pariyojana",
  day_nrlm: "https://aajeevika.gov.in/",
  lakhpati_didi: "https://www.myscheme.gov.in/",
  skill_livelihood: "https://www.ddugky.gov.in/",
  mudra_women: "https://www.mudra.org.in/",
  pmegp_women: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
};

const STATE_PORTAL_LINKS = {
  "Andhra Pradesh": "https://serp.ap.gov.in/",
  Bihar: "https://brlps.in/",
  Gujarat: "https://ruraldev.gujarat.gov.in/",
  Karnataka: "https://rdpr.karnataka.gov.in/",
  "Madhya Pradesh": "https://mpsrlm.mp.gov.in/",
  Maharashtra: "https://umed.in/",
  Odisha: "https://olm.nic.in/",
  Rajasthan: "https://rgavp.org/",
  "Tamil Nadu": "https://www.tnsrlm.tn.gov.in/",
  Telangana: "https://www.serp.telangana.gov.in/",
  "Uttar Pradesh": "https://upsrlm.org/",
  "West Bengal": "https://anandadhara.org.in/",
  Other: "https://www.myscheme.gov.in/",
};

const STATE_HELPLINES = {
  "Andhra Pradesh": ["181", "112"],
  Bihar: ["181", "112"],
  Gujarat: ["181", "112"],
  Karnataka: ["181", "112"],
  "Madhya Pradesh": ["181", "112"],
  Maharashtra: ["181", "112"],
  Odisha: ["181", "112"],
  Rajasthan: ["181", "112"],
  "Tamil Nadu": ["181", "112"],
  Telangana: ["181", "112"],
  "Uttar Pradesh": ["181", "112"],
  "West Bengal": ["181", "112"],
  Other: ["181", "112"],
};

function getStateReason(schemeId, state) {
  if (!state) return "";

  const priorityStates = STATE_SCHEME_PREFERENCES[schemeId] || [];
  if (priorityStates.includes(state)) {
    return `${state} has active implementation channels for this scheme.`;
  }

  if (state === "Other") {
    return "You can still check district-level offices for local rollout details.";
  }

  return "Scheme may still be available; verify with your district rural office.";
}

function getRequiredDocuments(schemeId, answers) {
  const docs = [
    "Aadhaar card or valid identity proof",
    "Address proof",
    "Recent passport-size photo",
  ];

  if (answers.hasBankAccount === "yes") {
    docs.push("Bank passbook or bank account details");
  }

  if (answers.shgMember === "yes") {
    docs.push("SHG membership proof or SHG resolution letter");
  }

  if (["SC", "ST", "OBC", "EWS", "BPL"].includes(answers.casteCategory)) {
    docs.push("Caste or category certificate (if claiming reservation/subsidy)");
  }

  if (schemeId === "mksp") {
    docs.push("Land/farm activity proof or agriculture work certificate");
  }

  if (schemeId === "day_nrlm") {
    docs.push("Village-level livelihood group or SHG linkage details");
  }

  if (schemeId === "lakhpati_didi") {
    docs.push("Simple business plan or income activity proposal");
  }

  if (schemeId === "skill_livelihood") {
    docs.push("Education/skill certificate (if available)");
  }

  if (schemeId === "mudra_women") {
    docs.push("Business activity proof or enterprise intent note");
  }

  if (schemeId === "pmegp_women") {
    docs.push("Project report and estimated cost details");
  }

  return [...new Set(docs)];
}

function getOfficialSchemeLink(schemeId) {
  return SCHEME_OFFICIAL_LINKS[schemeId] || "https://www.myscheme.gov.in/";
}

function getStatePortalLink(state) {
  return STATE_PORTAL_LINKS[state] || "https://www.myscheme.gov.in/";
}

function getStateHelplines(state) {
  return STATE_HELPLINES[state] || ["181", "112"];
}

function normalizeDetectedStateName(rawState) {
  return (rawState || "")
    .replace(/^State of\s+/i, "")
    .replace(/^Union Territory of\s+/i, "")
    .trim();
}

function mapDetectedStateToOption(detectedState) {
  const cleaned = normalizeDetectedStateName(detectedState);
  if (!cleaned) return "Other";

  const exactMatch = STATES.find((state) => state.toLowerCase() === cleaned.toLowerCase());
  if (exactMatch) return exactMatch;

  const containsMatch = STATES.find((state) => cleaned.toLowerCase().includes(state.toLowerCase()));
  if (containsMatch) return containsMatch;

  return "Other";
}

function getEligibilityReasons(schemeId, answers) {
  const age = Number(answers.age || 0);
  const income = Number(answers.monthlyIncome || 0);
  const shgMember = answers.shgMember === "yes";
  const hasBankAccount = answers.hasBankAccount === "yes";
  const isPriorityCategory = ["SC", "ST", "BPL"].includes(answers.casteCategory);
  const reasons = [];
  const stateReason = getStateReason(schemeId, answers.state);

  if (schemeId === "mksp") {
    if (["farm_labour", "farmer"].includes(answers.occupation)) {
      reasons.push("Your occupation is agriculture-linked (farmer/farm labour).");
    }
    if (age >= 18) {
      reasons.push("You are 18+ and can participate in MKSP training groups.");
    }
    if (stateReason) {
      reasons.push(stateReason);
    }
    return reasons;
  }

  if (schemeId === "day_nrlm") {
    if (shgMember) {
      reasons.push("You are an SHG member, which is a core DAY-NRLM route.");
    }
    if (age >= 18) {
      reasons.push("You are eligible as an adult rural livelihood participant.");
    }
    if (stateReason) {
      reasons.push(stateReason);
    }
    return reasons;
  }

  if (schemeId === "lakhpati_didi") {
    if (shgMember) {
      reasons.push("Lakhpati Didi targets women in SHGs for enterprise growth.");
    }
    if (["entrepreneur", "artisan", "non_farm_worker", "farmer"].includes(answers.occupation)) {
      reasons.push("Your work profile aligns with income-generation and enterprise support.");
    }
    if (stateReason) {
      reasons.push(stateReason);
    }
    return reasons;
  }

  if (schemeId === "skill_livelihood") {
    if (age >= 18 && age <= 45) {
      reasons.push("Your age fits common skill-training intake criteria.");
    }
    if (["farm_labour", "non_farm_worker", "artisan", "other"].includes(answers.occupation)) {
      reasons.push("Your profile is suitable for skill and livelihood upskilling programs.");
    }
    if (stateReason) {
      reasons.push(stateReason);
    }
    return reasons;
  }

  if (schemeId === "mudra_women") {
    if (age >= 18) {
      reasons.push("You are 18+, meeting the basic loan age requirement.");
    }
    if (hasBankAccount) {
      reasons.push("A bank account is available for loan processing and repayment.");
    }
    if (["entrepreneur", "artisan", "non_farm_worker", "farmer"].includes(answers.occupation)) {
      reasons.push("Your occupation can qualify for small business credit under MUDRA.");
    }
    if (stateReason) {
      reasons.push(stateReason);
    }
    return reasons;
  }

  if (schemeId === "pmegp_women") {
    if (age >= 18) {
      reasons.push("You are 18+, which is required for PMEGP applications.");
    }
    if (income > 0 && income <= 30000) {
      reasons.push("Your monthly income range fits common micro-enterprise support targeting.");
    }
    if (isPriorityCategory) {
      reasons.push("Your social category may receive priority/subsidy preference.");
    }
    if (hasBankAccount) {
      reasons.push("You have the banking access needed for subsidy-linked credit.");
    }
    if (stateReason) {
      reasons.push(stateReason);
    }
    return reasons;
  }

  return reasons;
}

function hasRequiredAnswers(answers) {
  return REQUIRED_FIELDS.every((field) => answers[field] !== "");
}

function WomenEmpowermentSchemes() {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [showEligibilityResults, setShowEligibilityResults] = useState(false);
  const [eligibilityError, setEligibilityError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const eligibleSchemes = useMemo(() => {
    if (!hasRequiredAnswers(answers)) return [];

    return WOMEN_SCHEMES
      .map((scheme) => {
        const reasons = getEligibilityReasons(scheme.id, answers);
        const documents = getRequiredDocuments(scheme.id, answers);
        const officialSchemeLink = getOfficialSchemeLink(scheme.id);
        const statePortalLink = getStatePortalLink(answers.state);
        const stateHelplines = getStateHelplines(answers.state);
        return { ...scheme, reasons, documents, officialSchemeLink, statePortalLink, stateHelplines };
      })
      .filter((scheme) => scheme.reasons.length >= 2);
  }, [answers]);

  const handleInputChange = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    if (eligibilityError) {
      setEligibilityError("");
    }
  };

  const handleCheckEligibility = () => {
    if (!hasRequiredAnswers(answers)) {
      setShowEligibilityResults(false);
      setEligibilityError("Please complete all required fields: age, income, caste category, SHG, state, and occupation.");
      return;
    }

    setEligibilityError("");
    setShowEligibilityResults(true);
  };

  const handleAutoDetectState = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = await response.json();
          const detectedState = mapDetectedStateToOption(data.principalSubdivision || "");

          setAnswers((prev) => ({ ...prev, state: detectedState }));
          setLocationMessage(
            detectedState === "Other"
              ? "Location found, but state could not be mapped exactly. Please verify manually."
              : `State auto-filled as ${detectedState}.`
          );
        } catch (error) {
          setLocationMessage("Could not detect state automatically. Please select state manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setLocationMessage("Location access denied. Please allow location or select state manually.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

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
          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {["🌾 Farming", "💰 Loans", "📚 Training", "🏪 Enterprise", "🤝 SHG Support"].map((tag) => (
              <span
                key={tag}
                className="inline-flex min-w-0 items-center justify-center rounded-full border border-[#a8d5b5] bg-white/70 px-2.5 py-1 text-center text-[11px] font-semibold text-[#1f5f2c] sm:px-3 sm:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#1f5f2c] to-[#F57C00]" />
        </div>

        {/* Eligibility Form */}
        <section className="mt-6 rounded-2xl border border-[#a8d5b5] bg-white p-5 shadow-[0_6px_20px_rgba(31,95,44,0.08)]">
          <h2 className="text-lg font-extrabold text-[#173A1E]">Quick Eligibility Check</h2>
          <p className="mt-1 text-sm text-[#4a7a55]">Answer 7 simple questions to see only matching women support schemes.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium text-[#173A1E]">
              Age
              <input
                type="number"
                min="18"
                value={answers.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#a8d5b5] px-3 py-2 text-sm outline-none ring-[#1f5f2c]/20 focus:ring"
                placeholder="e.g., 28"
              />
            </label>

            <label className="text-sm font-medium text-[#173A1E]">
              Monthly Income (₹)
              <input
                type="number"
                min="0"
                value={answers.monthlyIncome}
                onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#a8d5b5] px-3 py-2 text-sm outline-none ring-[#1f5f2c]/20 focus:ring"
                placeholder="e.g., 12000"
              />
            </label>

            <label className="text-sm font-medium text-[#173A1E]">
              Caste Category
              <select
                value={answers.casteCategory}
                onChange={(e) => handleInputChange("casteCategory", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#a8d5b5] bg-white px-3 py-2 text-sm outline-none ring-[#1f5f2c]/20 focus:ring"
              >
                <option value="">Select</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="BPL">BPL</option>
              </select>
            </label>

            <label className="text-sm font-medium text-[#173A1E]">
              SHG Member
              <select
                value={answers.shgMember}
                onChange={(e) => handleInputChange("shgMember", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#a8d5b5] bg-white px-3 py-2 text-sm outline-none ring-[#1f5f2c]/20 focus:ring"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="text-sm font-medium text-[#173A1E]">
              State
              <select
                value={answers.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#a8d5b5] bg-white px-3 py-2 text-sm outline-none ring-[#1f5f2c]/20 focus:ring"
              >
                <option value="">Select</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAutoDetectState}
                disabled={locationLoading}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#245131] bg-[#f4fbf6] px-3 py-1.5 text-xs font-semibold text-[#245131] transition hover:bg-[#e9f8ee] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiMapPin size={14} /> {locationLoading ? "Detecting..." : "Use Current Location"}
              </button>
              {locationMessage && (
                <p className="mt-1 text-xs font-medium text-[#3b5f41]">{locationMessage}</p>
              )}
            </label>

            <label className="text-sm font-medium text-[#173A1E]">
              Occupation
              <select
                value={answers.occupation}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#a8d5b5] bg-white px-3 py-2 text-sm outline-none ring-[#1f5f2c]/20 focus:ring"
              >
                <option value="">Select</option>
                {OCCUPATIONS.map((occupation) => (
                  <option key={occupation.value} value={occupation.value}>{occupation.label}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-[#173A1E] sm:col-span-2 lg:col-span-1">
              Do you have a bank account?
              <select
                value={answers.hasBankAccount}
                onChange={(e) => handleInputChange("hasBankAccount", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#a8d5b5] bg-white px-3 py-2 text-sm outline-none ring-[#1f5f2c]/20 focus:ring"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCheckEligibility}
              className="rounded-xl bg-gradient-to-r from-[#1f5f2c] to-[#2e7d3e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#1f5f2c]/25 transition hover:brightness-110 active:scale-95"
            >
              Show Eligible Schemes
            </button>
            {!hasRequiredAnswers(answers) && (
              <p className="text-xs font-medium text-[#b85f00]">Please complete required fields to run matching.</p>
            )}
          </div>
          {eligibilityError && (
            <p className="mt-2 text-xs font-medium text-[#b22222]">{eligibilityError}</p>
          )}
        </section>

        {/* Scheme Cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {showEligibilityResults && hasRequiredAnswers(answers)
            ? eligibleSchemes.map((scheme) => {
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

                {/* Match Reasons */}
                <div className="mt-3 rounded-xl border border-[#b7e1c0] bg-[#f4fbf6] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#245131]">Why This Matches You</p>
                  <ul className="mt-1 list-disc pl-4 text-sm text-[#245131]">
                    {scheme.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>

                {/* Required Documents */}
                <div className="mt-3 rounded-xl border border-[#f4c47a] bg-[#fff8ec] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8a4b00]">Required Documents</p>
                  <ul className="mt-1 list-disc pl-4 text-sm text-[#8a4b00]">
                    {scheme.documents.map((doc) => (
                      <li key={doc}>{doc}</li>
                    ))}
                  </ul>
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
                  <a
                    href={scheme.officialSchemeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#1f5f2c] bg-white px-4 py-2 text-sm font-semibold text-[#1f5f2c] transition hover:bg-[#f0faf3] active:scale-95"
                  >
                    <FiExternalLink /> Official Scheme Portal
                  </a>
                  <a
                    href={scheme.statePortalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#245131] bg-[#f4fbf6] px-4 py-2 text-sm font-semibold text-[#245131] transition hover:bg-[#e9f8ee] active:scale-95"
                  >
                    <FiMapPin /> {answers.state} State Portal
                  </a>
                </div>

                <div className="mt-3 rounded-xl border border-[#c6d7ff] bg-[#f5f8ff] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2b3e7a]">{answers.state} Helplines</p>
                  <p className="mt-1 text-sm text-[#2b3e7a]">
                    Women Support: <span className="font-bold">{scheme.stateHelplines[0]}</span>
                    {" "}| Emergency: <span className="font-bold">{scheme.stateHelplines[1]}</span>
                  </p>
                  <p className="mt-1 text-xs text-[#4b5f96]">Verify district-specific helpline updates on the official state portal.</p>
                </div>
              </article>
            );
          })
            : WOMEN_SCHEMES.map((scheme) => {
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

        {showEligibilityResults && hasRequiredAnswers(answers) && eligibleSchemes.length === 0 && (
          <div className="mt-4 rounded-xl border border-[#f4c47a] bg-[#fff8ec] px-4 py-3 text-sm font-medium text-[#8a4b00]">
            No direct scheme matches found with current answers. Try updating occupation, SHG status, or income details.
          </div>
        )}

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
