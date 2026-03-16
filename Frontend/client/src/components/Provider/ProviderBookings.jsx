import { useEffect, useState } from "react";
import { getProviderBookings } from "@/services/bookingService";
import FarmerCard from "@/components/Provider/FarmerCard";
import { useSocket } from "@/context/SocketContext";

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const providerRole = (localStorage.getItem("role") || "").toLowerCase();
  const isEquipmentProvider = providerRole === "equipment_provider";
  const { notifications } = useSocket() || {};

  const fetchBookings = async () => {
    try {
      const data = await getProviderBookings();
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to fetch provider bookings", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter((b) => ["confirmed", "started"].includes(b.status));
  const historyBookings = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  const pageTitle = isEquipmentProvider ? "Equipment Booking Requests" : "My Bookings";
  const pageSubtitle = isEquipmentProvider
    ? "Track rental requests, active hires, and completed equipment bookings."
    : "Manage incoming booking requests for your listings.";
  const pendingTitle = isEquipmentProvider ? "New Rental Requests" : "New Requests";
  const activeTitle = isEquipmentProvider ? "Active Equipment Bookings" : "Active Bookings";
  const historyTitle = isEquipmentProvider ? "Equipment Booking History" : "Booking History";

  const filterChips = [
    { key: "all", label: "All", count: bookings.length },
    { key: "pending", label: "Pending", count: pendingBookings.length },
    { key: "active", label: "Active", count: activeBookings.length },
    { key: "history", label: "History", count: historyBookings.length },
  ];

  const showSection = (key) => filter === "all" || filter === key;

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const latest = notifications[0];
    if (!latest?.read) {
      fetchBookings();
    }
  }, [notifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-700">{pageTitle}</h1>
        <p className="text-gray-600 mt-1">{pageSubtitle}</p>
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/45 bg-white/25 p-2 backdrop-blur-xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] ring-1 ring-white/30">
          {filterChips.map((chip) => {
            const isActive = filter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFilter(chip.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-600/85 text-white shadow-lg shadow-emerald-900/20"
                    : "bg-white/35 text-emerald-800 hover:bg-white/50"
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                    isActive ? "bg-white/25 text-white" : "bg-white/75 text-emerald-700"
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? <p>Loading bookings...</p> : null}

      {!loading && (
        <>
          {showSection("pending") && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{pendingTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingBookings.length === 0 ? (
                <p className="text-gray-500">{isEquipmentProvider ? "No new rental requests." : "No new requests."}</p>
              ) : (
                pendingBookings.map((booking) => (
                  <FarmerCard key={booking._id} booking={booking} onStatusChange={fetchBookings} />
                ))
              )}
            </div>
          </section>
          )}

          {showSection("active") && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{activeTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBookings.length === 0 ? (
                <p className="text-gray-500">{isEquipmentProvider ? "No active equipment bookings." : "No active bookings."}</p>
              ) : (
                activeBookings.map((booking) => (
                  <FarmerCard key={booking._id} booking={booking} onStatusChange={fetchBookings} />
                ))
              )}
            </div>
          </section>
          )}

          {showSection("history") && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{historyTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyBookings.length === 0 ? (
                <p className="text-gray-500">
                  {isEquipmentProvider ? "No completed or cancelled equipment bookings yet." : "No completed/cancelled bookings yet."}
                </p>
              ) : (
                historyBookings.map((booking) => (
                  <FarmerCard key={booking._id} booking={booking} onStatusChange={fetchBookings} />
                ))
              )}
            </div>
          </section>
          )}
        </>
      )}
    </div>
  );
}

export default ProviderBookings;
