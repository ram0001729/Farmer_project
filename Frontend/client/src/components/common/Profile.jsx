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
  equipment_provider: { label: "Equipment Provider",  color: "bg-purple-100 text-purple-800 border-purple-200" },
  admin:              { label: "Admin",               color: "bg-red-100 text-red-800 border-red-200" },
};

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#F5F5DC_0%,#D9F99D_45%,#ffffff_100%)] p-6 flex items-start justify-center">
      <div className="w-full max-w-3xl mt-8 animate-pulse space-y-4">
        <div className="h-48 rounded-3xl bg-green-200/60" />
        <div className="h-52 rounded-3xl bg-white/70" />
        <div className="h-32 rounded-3xl bg-white/70" />
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 border border-green-100">
        <Icon className="text-green-700 text-base" />
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
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then((data) => setProfile(data?.user ?? data))
      .catch(() => setError("Failed to load profile. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#F5F5DC_0%,#D9F99D_45%,#ffffff_100%)]">
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#F5F5DC_0%,#D9F99D_45%,#ffffff_100%)] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Hero card */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-green-100">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#52b788]" />

          {/* Initials avatar */}
          <div className="absolute top-14 left-6">
            <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-700 text-white text-3xl font-bold select-none">
              {initials || <FiUser />}
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
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
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {/* Contact & personal details */}
        <div className="rounded-3xl border border-green-100 bg-gray-50 shadow-sm p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#2d6a4f] mb-4">
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
        <div className="rounded-3xl border border-green-100 bg-gray-50 shadow-sm p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#2d6a4f] mb-4">
            Account Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Verification</p>
              <p className={`text-sm font-bold ${profile.isVerified ? "text-green-600" : "text-amber-500"}`}>
                {profile.isVerified ? "Verified" : "Pending"}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Role</p>
              <p className="text-sm font-bold text-gray-800 capitalize">{profile.role}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm col-span-2 sm:col-span-1">
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
