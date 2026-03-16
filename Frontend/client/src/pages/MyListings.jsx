import { useEffect, useState } from "react";
import { getListing, deleteListing, availableListing } from "@/services/listingService";
import { useNavigate } from "react-router-dom";

function MyListings() {
  const [listings, setListings] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const navigate = useNavigate();
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const isEquipmentProvider = role === "equipment_provider";
  const isDriver = role === "driver";
  const isLabour = role === "labour";
  const pageTitle = isEquipmentProvider
    ? "Manage Equipment"
    : isDriver
      ? "My Driver Listings"
      : isLabour
        ? "My Labour Listings"
        : "My Listings";
  const pageSubtitle = isEquipmentProvider
    ? "Showing only equipment items with key details and actions."
    : isDriver
      ? "Showing only your driver service listings."
      : isLabour
        ? "Showing only your labour service listings."
        : "Manage your provider listings.";


  const fetchMyListings = async () => {
    try {
      const data = await getListing(); // provider's own listings
      setListings(data);
    } catch (err) {
      console.error("Failed to load listings", err);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await deleteListing(id);
    setListings(prev => prev.filter(l => l._id !== id));
  };


const handleToggleAvailability = async (id) => {
  try {
    const res = await availableListing(id);

    const newAvailability =
      res.available ?? res.listing?.available;

    setListings(prev =>
      prev.map(l =>
        l._id === id ? { ...l, available: newAvailability } : l
      )
    );
  } catch (err) {
    console.error("Toggle failed", err);
  }
};


  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "radial-gradient(circle at top, #F5F5DC 0%, #D9F99D 45%, #ffffff 100%)" }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#1f5f2c] tracking-tight">{pageTitle}</h2>
        <p className="text-sm text-[#3b5f41] mt-1 font-medium">{pageSubtitle}</p>
        <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#1f5f2c] to-[#F57C00]" />
      </div>

      {/* Sort filter — driver only */}
      {isDriver && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/45 bg-white/25 p-2 backdrop-blur-xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] ring-1 ring-white/30 w-fit">
          {[
            { key: "latest", label: "Latest" },
            { key: "old", label: "Old" },
          ].map((chip) => (
            <button
              key={chip.key}
              onClick={() => setSortOrder(chip.key)}
              className={`relative px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                sortOrder === chip.key
                  ? "bg-[#1f5f2c] text-white shadow-md"
                  : "bg-white/35 text-[#1f5f2c] hover:bg-white/60"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {(() => {
        const roleFiltered = isEquipmentProvider
          ? listings.filter((listing) => listing.providerRole === "equipment_provider")
          : isDriver
            ? listings.filter((listing) => listing.providerRole === "driver")
            : isLabour
              ? listings.filter((listing) => listing.providerRole === "labour")
          : listings;

        const visibleListings = isDriver
          ? [...roleFiltered].sort((a, b) => {
              const tA = new Date(a.createdAt || 0).getTime();
              const tB = new Date(b.createdAt || 0).getTime();
              return sortOrder === "latest" ? tB - tA : tA - tB;
            })
          : roleFiltered;

        if (visibleListings.length === 0) {
          return (
            <div className="rounded-2xl border border-[#a8d5b5] bg-white/60 backdrop-blur-sm p-10 text-center shadow-md">
              <p className="text-[#3b5f41] font-semibold text-lg">No listings created yet</p>
              <p className="text-sm text-[#4a7a55] mt-1">Add your first listing to get started.</p>
            </div>
          );
        }

        return (
          <div className="grid gap-5">
            {visibleListings.map((listing) => (
              <div
                key={listing._id}
                className="rounded-2xl border border-[#a8d5b5] shadow-[0_8px_28px_rgba(31,95,44,0.1)] hover:shadow-[0_14px_40px_rgba(31,95,44,0.18)] hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-[linear-gradient(135deg,#f0faf3_0%,#fff7ed_60%,#f8fbf5_100%)]"
              >
                {isEquipmentProvider ? (
                  <div className="p-5">
                    <div className="grid md:grid-cols-[200px_1fr] gap-6">
                      {/* Equipment Image */}
                      <div className="rounded-xl overflow-hidden border-2 border-[#a8d5b5] ring-1 ring-[#c8e8c8] bg-[#F0F9F2] h-44 shadow-inner flex-shrink-0">
                        {listing?.meta?.image ? (
                          <img
                            src={listing.meta.image}
                            alt={listing.title || "Equipment image"}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                            <span className="text-3xl">🚜</span>
                            <span className="text-xs text-[#4a7a55] font-medium">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Equipment Details */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-extrabold text-xl text-[#173A1E] leading-snug">{listing.title}</h3>
                              <p className="text-[#4a7a55] mt-1 text-sm leading-relaxed">{listing.description || "No description provided."}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                                (listing?.meta?.listingType || "sell") === "rent"
                                  ? "text-[#1f5f2c] border-[#86c98e] bg-[#e5f8ea]"
                                  : "text-[#b85f00] border-[#f4c47a] bg-[#fff4e0]"
                              }`}>
                                {(listing?.meta?.listingType || "sell") === "rent" ? "🔄 For Rent" : "🏷️ For Sale"}
                              </span>
                              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                                listing.available
                                  ? "text-[#1f5f2c] border-[#86c98e] bg-[#e5f8ea]"
                                  : "text-rose-700 border-rose-300 bg-rose-50"
                              }`}>
                                {listing.available ? "✓ Available" : "✗ Unavailable"}
                              </span>
                            </div>
                          </div>

                          {/* Price Highlight */}
                          <div className="mt-3 inline-flex items-center gap-2 bg-[#1f5f2c]/8 border border-[#a8d5b5] rounded-xl px-4 py-2">
                            <span className="text-xs font-semibold text-[#3b5f41] uppercase tracking-wide">Price</span>
                            <span className="text-xl font-extrabold text-[#1f5f2c]">{listing.price ? `₹${listing.price}` : "—"}</span>
                          </div>

                          {/* Info Grid */}
                          <div className="mt-3 grid sm:grid-cols-3 gap-2 text-sm">
                            {[
                              { label: "Brand", value: listing?.meta?.brand || "N/A" },
                              { label: "Stock", value: listing?.meta?.stock || "N/A" },
                              { label: "Use Case", value: listing?.meta?.useCase || "N/A" },
                            ].map(({ label, value }) => (
                              <div key={label} className="bg-white/60 rounded-lg px-3 py-2 border border-[#c8e8c8]">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#3b5f41]">{label}</p>
                                <p className="font-semibold text-[#173A1E] mt-0.5 truncate">{value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Listed date */}
                          {listing.createdAt && (
                            <p className="mt-2 text-xs text-[#4a7a55] font-medium">
                              📅 Listed on {new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-4">
                          <button
                            onClick={() => navigate(`/listing/edit/${listing._id}`)}
                            className="px-5 py-2.5 rounded-xl bg-[#1f5f2c] text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-[#1f5f2c]/30 hover:bg-[#174f24] hover:shadow-lg active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleAvailability(listing._id)}
                            className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 shadow-md active:scale-95 ${
                              listing.available
                                ? "bg-[#F57C00] hover:bg-[#d86f0a] shadow-orange-400/30"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                            }`}
                          >
                            {listing.available ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-rose-600/25 hover:bg-rose-700 hover:shadow-lg active:scale-95"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {listing?.meta?.image && (
                      <div className="overflow-hidden border-b border-[#a8d5b5]">
                        <img
                          src={listing.meta.image}
                          alt={listing.title || "Listing image"}
                          className="w-full h-48 object-cover"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-extrabold text-xl text-[#173A1E]">{listing.title}</h3>
                          <p className="text-[#4a7a55] mt-1 text-sm">{listing.description}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                          listing.available
                            ? "text-[#1f5f2c] border-[#86c98e] bg-[#e5f8ea]"
                            : "text-rose-700 border-rose-300 bg-rose-50"
                        }`}>
                          {listing.available ? "✓ Available" : "✗ Unavailable"}
                        </span>
                      </div>

                      {listing.price && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-[#1f5f2c]/8 border border-[#a8d5b5] rounded-xl px-4 py-2">
                          <span className="text-xs font-semibold text-[#3b5f41] uppercase tracking-wide">Rate</span>
                          <span className="text-xl font-extrabold text-[#1f5f2c]">₹{listing.price}</span>
                        </div>
                      )}

                      {/* Listed date */}
                      {listing.createdAt && (
                        <p className="mt-2 text-xs text-[#4a7a55] font-medium">
                          📅 Listed on {new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={() => navigate(`/listing/edit/${listing._id}`)}
                          className="px-5 py-2.5 rounded-xl bg-[#1f5f2c] text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-[#1f5f2c]/30 hover:bg-[#174f24] hover:shadow-lg active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleAvailability(listing._id)}
                          className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-300 shadow-md active:scale-95 ${
                            listing.available
                              ? "bg-[#F57C00] hover:bg-[#d86f0a] shadow-orange-400/30"
                              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25"
                          }`}
                        >
                          {listing.available ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDelete(listing._id)}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-rose-600/25 hover:bg-rose-700 hover:shadow-lg active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}


              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

export default MyListings;
