import { useEffect, useState } from "react";
import { getListing, deleteListing, availableListing } from "@/services/listingService";
import { getProviderBookings } from "@/services/bookingService";
import { useNavigate } from "react-router-dom";

function MyListings() {
  const [listings, setListings] = useState([]);
  const [providerBookings, setProviderBookings] = useState([]);
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

  const fetchProviderBookings = async () => {
    try {
      const data = await getProviderBookings(); // all bookings for this provider
      setProviderBookings(data || []);
    } catch (err) {
      console.error("Failed to load provider bookings", err);
    }
  };


  useEffect(() => {
    fetchMyListings();
    fetchProviderBookings();
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
    <div className="p-6 ">
      <h2 className="text-2xl font-bold mb-4 ">{pageTitle}</h2>
      <p className="text-sm text-gray-600 mb-4">{pageSubtitle}</p>

      {(() => {
        const visibleListings = isEquipmentProvider
          ? listings.filter((listing) => listing.providerRole === "equipment_provider")
          : isDriver
            ? listings.filter((listing) => listing.providerRole === "driver")
            : isLabour
              ? listings.filter((listing) => listing.providerRole === "labour")
          : listings;

        if (visibleListings.length === 0) {
          return <p>No listings created yet</p>;
        }

        return (
          <div className="grid gap-4">
            {visibleListings.map((listing) => (
              <div
                key={listing._id}
                className={`rounded-2xl border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                  isEquipmentProvider
                    ? "bg-white border-[#D6E4D6]"
                    : "p-5 bg-[linear-gradient(135deg,#e6f7f9_0%,#d2eef2_100%)] border-[#157A8C]/20"
                }`}
              >
                {isEquipmentProvider ? (
                  <div className="p-5">
                    <div className="grid md:grid-cols-[180px_1fr] gap-5">
                      <div className="rounded-xl overflow-hidden border border-[#D6E4D6] bg-[#F5F9F5] h-40">
                        {listing?.meta?.image ? (
                          <img
                            src={listing.meta.image}
                            alt={listing.title || "Equipment image"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-xl text-[#173A1E]">{listing.title}</h3>
                            <p className="text-gray-600 mt-1 text-sm">{listing.description || "No description"}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                            listing.available
                              ? "text-green-700 border-green-300 bg-green-50"
                              : "text-red-600 border-red-300 bg-red-50"
                          }`}>
                            {listing.available ? "Available" : "Unavailable"}
                          </span>
                        </div>

                        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                          <p><span className="font-semibold text-gray-700">Price:</span> {listing.price ? `Rs ${listing.price}` : "Not set"}</p>
                          <p><span className="font-semibold text-gray-700">Brand:</span> {listing?.meta?.brand || "N/A"}</p>
                          <p><span className="font-semibold text-gray-700">Stock:</span> {listing?.meta?.stock || "N/A"}</p>
                          <p><span className="font-semibold text-gray-700">Use:</span> {listing?.meta?.useCase || "N/A"}</p>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                          <button
                            onClick={() => navigate(`/listing/edit/${listing._id}`)}
                            className="secondary-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleAvailability(listing._id)}
                            className="secondary-btn"
                          >
                            {listing.available ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="danger-btn"
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
                      <div className="mb-3 rounded-xl overflow-hidden border border-[#157A8C]/20 bg-white">
                        <img
                          src={listing.meta.image}
                          alt={listing.title || "Listing image"}
                          className="w-full h-44 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-gray-800">{listing.title}</h3>
                      <p className="text-gray-600 mt-1">{listing.description}</p>

                      <p className="text-sm mt-1">
                        Status:{" "}
                        <span className={listing.available ? "text-green-600" : "text-red-500"}>
                          {listing.available ? "Available" : "Not Available"}
                        </span>
                      </p>
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => navigate(`/listing/edit/${listing._id}`)}
                          className="secondary-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleAvailability(listing._id)}
                          className="secondary-btn"
                        >
                          {listing.available ? "Disable" : "Enable"}
                        </button>

                        <button
                          onClick={() => handleDelete(listing._id)}
                          className="danger-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Bookings for this listing (provider side) */}
                {providerBookings.length > 0 && (
                  <div className="mt-4 rounded-xl bg-white/70 border border-[#157A8C]/20 p-3">
                    {(() => {
                      const bookingsForListing = providerBookings.filter(
                        (b) => b.listingId && b.listingId._id === listing._id
                      );

                      if (bookingsForListing.length === 0) return null;

                      const pendingCount = bookingsForListing.filter(
                        (b) => b.status === "pending"
                      ).length;
                      const activeCount = bookingsForListing.filter(
                        (b) => b.status === "started" || b.status === "confirmed"
                      ).length;
                      const completedCount = bookingsForListing.filter(
                        (b) => b.status === "completed"
                      ).length;

                      return (
                        <>
                          <p className="text-sm font-semibold text-gray-800">
                            Bookings for this listing ({bookingsForListing.length})
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Pending: {pendingCount} • Active: {activeCount} • Completed: {completedCount}
                          </p>

                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {bookingsForListing.slice(0, 3).map((b) => (
                              <div
                                key={b._id}
                                className="flex justify-between text-xs text-gray-700 bg-white/60 rounded-lg px-2 py-1"
                              >
                                <span>{b.farmerId?.name || "Farmer"}</span>
                                <span className="capitalize">{b.status}</span>
                              </div>
                            ))}
                            {bookingsForListing.length > 3 && (
                              <p className="text-[11px] text-gray-500 mt-1">
                                +{bookingsForListing.length - 3} more bookings
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
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
