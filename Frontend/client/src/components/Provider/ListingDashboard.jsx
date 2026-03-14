import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  createListing,
  updateListing,
  deleteListing,
  getSingleListing,
} from "../../services/listingService";
import { getCurrentLocation } from "../../services/locationservice";
import {
  FiTruck, FiUser, FiTool, FiMapPin, FiCheckCircle,
  FiAlertCircle, FiTrash2, FiSave, FiPlusCircle, FiLoader, FiLock,
} from "react-icons/fi";

const initialFormState = {
  title: "",
  providerRole: "",
  description: "",
  experience: "",
  mobile: "",
  price: "",
  priceUnit: "hour",
  available: true,
  location: undefined,
  vehicleDetails: { model: "", regNumber: "", condition: "" },
  meta: { brand: "", stock: "", useCase: "", image: "" },
};

const ROLE_OPTIONS = [
  { value: "driver",             label: "Driver",             icon: FiTruck },
  { value: "labour",             label: "Labour",             icon: FiUser  },
  { value: "equipment_provider", label: "Equipment Provider", icon: FiTool  },
];

const inputCls =
  "w-full rounded-xl border border-green-200 bg-[#f8fbf5] px-4 py-3 text-sm text-[#1f3f28] placeholder:text-[#8aab90] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition disabled:bg-gray-50 disabled:text-gray-400";

const labelCls = "block text-xs font-semibold uppercase tracking-widest text-[#2d6a4f] mb-1.5";

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-3xl border border-green-200 bg-white shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 border border-green-200">
          <Icon className="text-green-700 text-sm" />
        </span>
        <h3 className="text-sm font-bold text-[#1f5f2c] uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ListingDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const isEditMode = Boolean(id);
  const loggedRole = (localStorage.getItem("role") || "").toLowerCase();
  const defaultProviderRole =
    ["equipment_provider", "driver", "labour"].includes(loggedRole) ? loggedRole : "";

  // Role is locked if the user is logged in as a specific provider role or when editing
  const roleIsLocked = Boolean(defaultProviderRole) || isEditMode;

  const [form, setForm]       = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [toast, setToast]     = useState(null); // { type: 'success'|'error', msg }

  const activeRole = form.providerRole || defaultProviderRole;
  const isEquipment = activeRole === "equipment_provider";

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Prefill role from query param on create
  useEffect(() => {
    if (isEditMode) return;
    const roleFromQuery = (searchParams.get("providerRole") || "").toLowerCase();
    const resolved = roleFromQuery || defaultProviderRole;
    if (["driver", "labour", "equipment_provider"].includes(resolved)) {
      setForm((prev) => ({ ...prev, providerRole: resolved }));
    }
  }, [isEditMode, searchParams, defaultProviderRole]);

  // Load existing listing in edit mode
  useEffect(() => {
    if (!id) return;
    getSingleListing(id)
      .then((data) =>
        setForm((prev) => ({
          ...prev,
          ...data,
          available: data.available ?? true,
          price: data.price ?? "",
          vehicleDetails: { ...prev.vehicleDetails, ...data.vehicleDetails },
          meta: { ...prev.meta, ...data.meta },
        }))
      )
      .catch(() => {
        showToast("error", "Failed to load listing.");
        navigate("/my-listings");
      });
  }, [id]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const setVehicle = (key, val) =>
    setForm((prev) => ({ ...prev, vehicleDetails: { ...prev.vehicleDetails, [key]: val } }));
  const setMeta = (key, val) =>
    setForm((prev) => ({ ...prev, meta: { ...prev.meta, [key]: val } }));

  const handleUseLocation = async () => {
    setLocLoading(true);
    try {
      const geo = await getCurrentLocation();
      set("location", geo);
    } catch {
      showToast("error", "Could not get GPS location. Please allow location access.");
    } finally {
      setLocLoading(false);
    }
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    providerRole: form.providerRole.trim(),
    description: form.description,
    experience: form.experience,
    mobile: form.mobile.trim(),
    priceUnit: form.priceUnit,
    available: form.available,
    vehicleDetails: {
      ...form.vehicleDetails,
      condition: form.vehicleDetails.condition || undefined,
    },
    meta: form.meta,
    location: {
      type: "Point",
      coordinates: [form.location.coordinates[0], form.location.coordinates[1]],
    },
    ...(form.price !== "" ? { price: Number(form.price) } : {}),
  });

  const handleSave = async () => {
    if (!form.title.trim()) { showToast("error", "Title is required."); return; }
    if (!form.location?.coordinates) { showToast("error", "Location is required. Click 'Use My Location'."); return; }
    if (!form.providerRole) { showToast("error", "Please select a provider type."); return; }

    try {
      setLoading(true);
      if (isEditMode) {
        await updateListing(id, buildPayload());
        showToast("success", "Listing updated successfully.");
        setTimeout(() => navigate("/my-listings"), 1200);
      } else {
        await createListing(buildPayload());
        showToast("success", "Listing created successfully.");
        setTimeout(() => navigate("/ProviderHome"), 1200);
      }
    } catch (err) {
      showToast("error", err.response?.data?.error || "Failed to save listing.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form._id) return;
    if (!window.confirm("Delete this listing permanently? This cannot be undone.")) return;
    try {
      await deleteListing(form._id);
      navigate("/my-listings");
    } catch {
      showToast("error", "Failed to delete listing.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#F5F5DC_0%,#D9F99D_45%,#ffffff_100%)] px-4 py-10">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? <FiCheckCircle className="text-green-600" /> : <FiAlertCircle className="text-red-500" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-5">

        {/* Page header */}
        <div className="rounded-3xl border border-green-200 bg-white shadow-sm px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F57C00] mb-1">
              {isEditMode ? "Edit Listing" : "New Listing"}
            </p>
            <h1 className="text-2xl font-bold text-[#1f5f2c]">
              {isEditMode ? "Update your service listing" : "Create a service listing"}
            </h1>
            <p className="text-sm text-[#3b5f41] mt-1">
              {isEquipment
                ? "Add your equipment with a clear name, price and image."
                : "Describe your service so farmers can find and book you."}
            </p>
          </div>
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
            >
              <FiTrash2 /> Delete Listing
            </button>
          )}
        </div>

        {/* Provider Type */}
        <SectionCard title="Provider Type" icon={FiUser}>
          {roleIsLocked && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-[#f0faf3] px-4 py-3 text-sm text-[#1f5f2c]">
              <FiLock className="shrink-0 text-green-600" />
              <span>
                Your account is registered as&nbsp;
                <strong className="capitalize">{(activeRole || "").replace("_", " ")}</strong>.
                {isEditMode ? " Role cannot be changed when editing." : " Role is set from your account."}
              </span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = activeRole === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={roleIsLocked}
                  onClick={() => set("providerRole", value)}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border py-5 text-sm font-semibold transition ${
                    active
                      ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200] shadow-sm"
                      : "border-green-200 bg-[#f8fbf5] text-[#4e6f55] hover:border-green-300 hover:bg-green-50"
                  } disabled:cursor-not-allowed ${
                    roleIsLocked && !active ? "opacity-30" : ""
                  }`}
                >
                  <Icon className={`text-xl ${active ? "text-[#F57C00]" : "text-green-600"}`} />
                  {label}
                  {active && roleIsLocked && (
                    <span className="absolute top-2 right-2">
                      <FiLock className="text-[10px] text-[#F57C00]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Basic Info */}
        <SectionCard title="Basic Information" icon={FiPlusCircle}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{isEquipment ? "Item Name" : "Title"} <span className="text-red-400">*</span></label>
              <input
                className={inputCls}
                placeholder={isEquipment ? "e.g. Power Tiller XT200" : "e.g. Experienced Farm Labour"}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Mobile Number</label>
              <input
                className={inputCls}
                placeholder="10-digit number"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>{isEquipment ? "Item Description" : "Description"}</label>
              <textarea
                className={`${inputCls} h-24 resize-none`}
                placeholder={isEquipment ? "Key specs, condition, capacity..." : "Skills, crops worked on, availability..."}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            {!isEquipment && (
              <div>
                <label className={labelCls}>Experience</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 5 years"
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                />
              </div>
            )}

            <div>
              <label className={labelCls}>Availability</label>
              <select
                className={inputCls}
                value={form.available.toString()}
                onChange={(e) => set("available", e.target.value === "true")}
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Pricing */}
        <SectionCard title="Pricing" icon={FiTool}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (INR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F57C00] font-bold text-sm select-none">₹</span>
                <input
                  type="number"
                  className={`${inputCls} pl-8`}
                  placeholder="e.g. 500"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Price Unit</label>
              <select
                className={inputCls}
                value={form.priceUnit}
                onChange={(e) => set("priceUnit", e.target.value)}
              >
                <option value="hour">Per Hour</option>
                <option value="day">Per Day</option>
                <option value="fixed">Fixed Price</option>
              </select>
            </div>
          </div>
          {form.price && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-[#fff7ed] px-4 py-3">
              <p className="text-xs text-[#8a5a22]">Rate Preview</p>
              <p className="text-lg font-bold text-[#c46800]">
                ₹{Number(form.price).toLocaleString("en-IN")}
                <span className="text-sm font-normal text-[#8a6a42] ml-1">/ {form.priceUnit}</span>
              </p>
            </div>
          )}
        </SectionCard>

        {/* Equipment-specific fields */}
        {isEquipment && (
          <SectionCard title="Equipment Details" icon={FiTool}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Brand</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Mahindra"
                  value={form.meta.brand}
                  onChange={(e) => setMeta("brand", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Stock Quantity</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 5"
                  value={form.meta.stock}
                  onChange={(e) => setMeta("stock", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Best Use Case</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Paddy cultivation"
                  value={form.meta.useCase}
                  onChange={(e) => setMeta("useCase", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input
                  className={inputCls}
                  placeholder="https://..."
                  value={form.meta.image}
                  onChange={(e) => setMeta("image", e.target.value)}
                />
              </div>
            </div>
            {form.meta.image && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-green-200 shadow-sm">
                <img
                  src={form.meta.image}
                  alt="Preview"
                  className="w-full max-h-52 object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            )}
          </SectionCard>
        )}

        {/* Vehicle details (driver / labour) */}
        {!isEquipment && (
          <SectionCard title="Vehicle Details" icon={FiTruck}>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Vehicle Model</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Tata Ace"
                  value={form.vehicleDetails.model}
                  onChange={(e) => setVehicle("model", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Registration No.</label>
                <input
                  className={inputCls}
                  placeholder="e.g. MH12AB1234"
                  value={form.vehicleDetails.regNumber}
                  onChange={(e) => setVehicle("regNumber", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Condition</label>
                <select
                  className={inputCls}
                  value={form.vehicleDetails.condition || ""}
                  onChange={(e) => setVehicle("condition", e.target.value)}
                >
                  <option value="">Select condition</option>
                  <option value="bad">Poor</option>
                  <option value="good">Good</option>
                  <option value="best">Excellent</option>
                </select>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Location */}
        <SectionCard title="Location" icon={FiMapPin}>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-5 py-3 text-sm font-semibold text-[#1f5f2c] hover:bg-green-100 disabled:opacity-60 transition shadow-sm"
            >
              {locLoading
                ? <><FiLoader className="animate-spin" /> Detecting...</>
                : <><FiMapPin /> Use My Location</>}
            </button>
            {form.location?.coordinates ? (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-[#f0faf3] px-4 py-2.5 text-sm text-green-700 font-medium">
                <FiCheckCircle className="text-green-600 shrink-0" />
                <span>
                  GPS captured — {form.location.coordinates[1].toFixed(4)},&nbsp;
                  {form.location.coordinates[0].toFixed(4)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-[#fff7ed] px-4 py-2.5 text-sm text-[#9a5200] font-medium">
                <FiAlertCircle className="shrink-0" />
                Location required to publish listing
              </div>
            )}
          </div>
        </SectionCard>

        {/* Action buttons */}
        <div className="rounded-3xl border border-green-200 bg-white shadow-sm px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-green-200 bg-[#f8fbf5] px-6 py-3 text-sm font-semibold text-[#2d6a4f] hover:bg-green-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F57C00] hover:bg-[#d86f0a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 text-sm font-bold transition shadow-md shadow-orange-400/30"
          >
            {loading ? (
              <><FiLoader className="animate-spin" /> Saving...</>
            ) : isEditMode ? (
              <><FiSave /> Update Listing</>
            ) : (
              <><FiPlusCircle /> Publish Listing</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListingDashboard;
