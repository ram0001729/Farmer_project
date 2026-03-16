import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "@/services/userService";
import {
  FiUser, FiPhone, FiCalendar, FiShield, FiLogOut,
  FiCheckCircle, FiMapPin,
} from "react-icons/fi";

const ROLE_META = {
  farmer:             { label: "Farmer",             color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  driver:             { label: "Driver",              color: "bg-sky-100 text-sky-800 border-sky-200" },
  labour:             { label: "Labour",              color: "bg-amber-100 text-amber-800 border-amber-200" },
  equipment_provider: { label: "Equipment Provider",  color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  admin:              { label: "Admin",               color: "bg-red-100 text-red-800 border-red-200" },
};

const ROLE_AVATAR = {
  farmer: "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1768772826/farmer_jebfjw.png",
  driver: "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405806/ChatGPT_Image_Jan_26_2026_11_06_28_AM_u7qffy.png",
  labour: "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405972/ChatGPT_Image_Jan_26_2026_11_09_15_AM_b13az0.png",
  equipment_provider: "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769406385/ChatGPT_Image_Jan_26_2026_11_15_51_AM_nyel1g.png",
  admin: "https://api.dicebear.com/9.x/initials/svg?seed=Admin&backgroundColor=ffedd5,fee2e2",
};

const DEFAULT_ROLE_COVER = "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1770308111/Indian_Farmer_Agriculture_Life_keqkby.jpg";
const PADDY_FIELD_BG_VIDEO = "https://res.cloudinary.com/dwp9qjmdf/video/upload/v1770805053/From_KlickPin_CF_Trator_agro_neg%C3%B3cio___Fotos_de_trator_Trator_Fotos_de_fazendasS_avatar_link_czh0xn.mp4";

const ROLE_COVER = {
  farmer: DEFAULT_ROLE_COVER,
  driver: "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405806/ChatGPT_Image_Jan_26_2026_11_06_28_AM_u7qffy.png",
  labour: "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405972/ChatGPT_Image_Jan_26_2026_11_09_15_AM_b13az0.png",
  equipment_provider: "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769406385/ChatGPT_Image_Jan_26_2026_11_15_51_AM_nyel1g.png",
  admin: DEFAULT_ROLE_COVER,
};

function getProfileAvatar(profile) {
  return (
    profile?.avatar ||
    profile?.profileImage ||
    profile?.image ||
    ROLE_AVATAR[profile?.role] ||
    ""
  );
}

function toLandscapeCover(url = "") {
  if (!url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    "/upload/c_fill,g_auto,w_1600,h_420,q_auto,f_auto/"
  );
}

function getProfileCover(role) {
  return toLandscapeCover(ROLE_COVER[role] || DEFAULT_ROLE_COVER);
}

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

function formatDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function memberSince(createdAt) {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e8fbff_0%,#f9fff2_45%,#fff8ef_100%)] p-6 flex items-start justify-center">
      <div className="w-full max-w-3xl mt-8 animate-pulse space-y-4">
        <div className="h-48 rounded-3xl bg-cyan-200/60" />
        <div className="h-52 rounded-3xl bg-white/75" />
        <div className="h-32 rounded-3xl bg-white/75" />
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-cyan-100/80 bg-gradient-to-br from-white to-cyan-50/50 p-4 shadow-sm">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-emerald-100 border border-cyan-200/70">
        <Icon className="text-cyan-700 text-base" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-800 capitalize">{value}</p>
      </div>
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then((data) => setProfile(data?.user ?? data))
      .catch(() => setError("Failed to load profile. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [profile?.role, profile?.avatar, profile?.profileImage, profile?.image]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="rounded-2xl bg-white border border-red-200 p-10 text-center shadow-sm max-w-sm">
          <FiShield className="mx-auto text-3xl text-red-400 mb-3" />
          <p className="text-gray-700 font-medium">{error || "Profile not found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-green-600 hover:underline font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const roleMeta = ROLE_META[profile.role] || { label: profile.role, color: "bg-gray-100 text-gray-700 border-gray-200" };
  const initials = getInitials(profile.name);
  const dobStr   = formatDob(profile.dob);
  const sinceStr = memberSince(profile.createdAt);
  const avatarSrc = getProfileAvatar(profile);
  const coverSrc = getProfileCover(profile.role);
  const fallbackCoverSrc = toLandscapeCover(DEFAULT_ROLE_COVER);
  const shouldShowImageAvatar = Boolean(avatarSrc) && !avatarLoadError;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10">
      
      <div className="pointer-events-none absolute inset-0 from-[#0b3f2f]/55 via-[#114b39]/45 to-[#f4f9f2]/70" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-5">

        {/* Hero card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-cyan-100">
          {/* Cover */}
          <div className="relative h-32">
            <img
              src={coverSrc}
              alt={`${roleMeta.label} cover`}
              className="h-full w-full object-cover"
              onError={(e) => {
                if (!e.currentTarget.dataset.fallbackApplied) {
                  e.currentTarget.dataset.fallbackApplied = "true";
                  e.currentTarget.src = fallbackCoverSrc;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-black/20" />
          </div>

          {/* Role-aware avatar with fallback */}
          <div className="absolute top-14 left-6">
            <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center bg-gradient-to-br from-[#1d8192] to-[#0b5f6d] text-white text-3xl font-bold select-none">
              {shouldShowImageAvatar ? (
                <img
                  src={avatarSrc}
                  alt={`${roleMeta.label} avatar`}
                  className="h-full w-full rounded-xl object-cover"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                initials || <FiUser />
              )}
            </div>
          </div>

          {/* Name + badges + logout */}
          <div className="bg-white pt-16 pb-6 px-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {profile.name || "—"}
              </h1>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${roleMeta.color}`}>
                  <FiShield className="text-[10px]" />
                  {roleMeta.label}
                </span>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                    <FiCheckCircle /> Verified
                  </span>
                )}
                {sinceStr && (
                  <span className="text-xs text-gray-400">Member since {sinceStr}</span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* Contact & personal details */}
        <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/40 shadow-sm p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1d8192] mb-4">
            Account Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field icon={FiPhone}    label="Mobile Number" value={profile.mobile} />
            <Field icon={FiUser}     label="Gender"        value={profile.gender} />
            <Field icon={FiCalendar} label="Date of Birth" value={dobStr} />
            <Field icon={FiMapPin}   label="Role"          value={roleMeta.label} />
          </div>
        </div>

        {/* Status strip */}
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-orange-50/60 shadow-sm p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#c56b00] mb-4">
            Account Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-center shadow-sm">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Verification</p>
              <p className={`text-sm font-bold ${profile.isVerified ? "text-green-600" : "text-amber-500"}`}>
                {profile.isVerified ? "Verified" : "Pending"}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white p-4 text-center shadow-sm">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Role</p>
              <p className="text-sm font-bold text-gray-800 capitalize">{profile.role}</p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-white p-4 text-center shadow-sm col-span-2 sm:col-span-1">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Joined</p>
              <p className="text-sm font-bold text-gray-800">{sinceStr || "—"}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
