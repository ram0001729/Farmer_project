import FarmerCard from "@/components/provider/FarmerCard";
import { useEffect, useState } from "react";
import { getProviderBookings } from "@/services/bookingService";
import { updateDriverLocation, setProviderAvailability } from "@/services/listingService";
import { getProviderAnalytics } from "@/services/marketService";
import QuickNav from "@/components/provider/QuickNav";
import { useNavigate } from "react-router-dom";

function ProviderHome() {
  const navigate = useNavigate();
  const providerRole = (localStorage.getItem("role") || "").toLowerCase();
  const isDriver = providerRole === "driver";
  const isEquipmentProvider = providerRole === "equipment_provider";
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({
    monthlyBookings: 0,
    conversionRate: 0,
    topItemService: "N/A",
    averageResponseTimeMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);

  const fetchBookings = async () => {
    try {
      const [bookingsData, analyticsData] = await Promise.all([
        getProviderBookings(),
        getProviderAnalytics(),
      ]);

      const data = bookingsData;
      setBookings(data);
      if (analyticsData?.analytics) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const stored = localStorage.getItem("providerAvailable");
    if (stored !== null) {
      setAvailable(stored === "true");
    }
  }, []);


const [trackingId, setTrackingId] = useState(null);
const [trackingMessage, setTrackingMessage] = useState("");

const startTracking = () => {
  if (!navigator.geolocation) {
    setTrackingMessage("Geolocation is not supported by your browser.");
    return;
  }

  const id = navigator.geolocation.watchPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setTrackingMessage("Updating location...");

      try {
        await updateDriverLocation(lat, lng);
        setTrackingMessage("Location updated");
      } catch (error) {
        console.error("Location update failed", error);
        setTrackingMessage("Failed to update location. Check network.");
      }
    },
    (err) => {
      console.error("Geolocation error", err);
      setTrackingMessage(`Location error: ${err.message}`);
    },
    { enableHighAccuracy: true }
  );

  setTrackingId(id);
  setTrackingMessage("Tracking started");
};

const stopTracking = () => {
  if (trackingId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(trackingId);
    setTrackingId(null);
    setTrackingMessage("Tracking stopped");
  }
};

const toggleAvailability = async () => {
  try {
    // Optimistic UI update
    setAvailable((prev) => {
      const next = !prev;
      localStorage.setItem("providerAvailable", next.toString());
      return next;
    });

    const desired = !available;
    await setProviderAvailability(desired);
  } catch (err) {
    console.error("Failed to update availability", err);
    // Revert on error
    setAvailable((prev) => {
      const reverted = !prev;
      localStorage.setItem("providerAvailable", reverted.toString());
      return reverted;
    });
  }
};

const pendingBookings = bookings.filter((b) => b.status === "pending");
const activeBookings = bookings.filter((b) =>
  ["confirmed", "started"].includes(b.status)
);
const newBookingsCount = pendingBookings.length;
const pendingRequestsCount = activeBookings.length;
const totalEarnings = bookings
  .filter((b) => b.status === "completed")
  .reduce((sum, b) => sum + (b.price || 0), 0);

  return (
    <div className="flex h-screen">


        <main className="flex-1 overflow-y-auto p-6 space-y-4">
        <QuickNav
          newBookings={newBookingsCount}
          pendingRequests={pendingRequestsCount}
          earnings={totalEarnings}
          available={available}
          onToggleAvailability={toggleAvailability}
          showAvailability={!isEquipmentProvider}
        />

        {isEquipmentProvider && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
            <p className="font-semibold">Equipment Provider Dashboard</p>
            <p className="text-sm mt-1">
              Add item listings with price and product details from My Listings, then manage booked items below.
            </p>
            <button
              onClick={() => navigate("/ListingDashboard?providerRole=equipment_provider")}
              className="mt-3 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold transition"
            >
              Add New Item
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white border border-green-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Monthly Bookings</p>
            <p className="text-2xl font-bold text-green-700">{analytics.monthlyBookings || 0}</p>
          </div>
          <div className="rounded-xl bg-white border border-green-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-green-700">{analytics.conversionRate || 0}%</p>
          </div>
          <div className="rounded-xl bg-white border border-green-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Top Item / Service</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{analytics.topItemService || "N/A"}</p>
          </div>
          <div className="rounded-xl bg-white border border-green-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Avg Response Time</p>
            <p className="text-2xl font-bold text-green-700">{analytics.averageResponseTimeMinutes || 0}m</p>
          </div>
        </div>

        {isDriver && (
          <div className="flex flex-col gap-2">
            <button
              onClick={trackingId ? stopTracking : startTracking}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                trackingId
                  ? "bg-red-600 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {trackingId ? "Stop Live Tracking" : "Start Live Tracking"}
            </button>
            {trackingMessage && (
              <p className="text-sm text-gray-600">{trackingMessage}</p>
            )}
          </div>
        )}


          {/* New requests (still to be accepted) */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{isEquipmentProvider ? "New Item Booking Requests" : "New Requests"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                <p>Loading farmer requests...</p>
              ) : pendingBookings.length === 0 ? (
                <p>No new booking requests.</p>
              ) : (
                pendingBookings.map((booking) => (
                  <FarmerCard
                    key={booking._id}
                    booking={booking}
                    onStatusChange={fetchBookings}
                  />
                ))
              )}
            </div>
          </div>

          {/* Accepted / in-progress bookings */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{isEquipmentProvider ? "Booked Items In Progress" : "Active Bookings"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                <p>Loading active bookings...</p>
              ) : activeBookings.length === 0 ? (
                <p>No active bookings yet.</p>
              ) : (
                activeBookings.map((booking) => (
                  <FarmerCard
                    key={booking._id}
                    booking={booking}
                    onStatusChange={fetchBookings}
                  />
                ))
              )}
            </div>
          </div>

        </main>
      </div>
  );
}


export default ProviderHome;
