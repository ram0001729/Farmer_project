import FarmerCard from "@/components/Provider/FarmerCard";
import { useEffect, useState } from "react";
import { getProviderBookings } from "@/services/bookingService";
import { updateDriverLocation, setProviderAvailability } from "@/services/listingService";
import { getProviderAnalytics, getProviderMarketOrders } from "@/services/marketService";
import QuickNav from "@/components/Provider/QuickNav";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/context/SocketContext";
import { FiBell, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2, ease: "easeOut" } },
};

function ProviderHome() {
  const navigate = useNavigate();
  const providerRole = (localStorage.getItem("role") || "").toLowerCase();
  const isLabour = providerRole === "labour";
  const isDriver = providerRole === "driver";
  const isEquipmentProvider = providerRole === "equipment_provider";
  const [bookings, setBookings] = useState([]);
  const { notifications, unreadCount, markAllRead } = useSocket() || {};
  const [toast, setToast] = useState(null);
  const [analytics, setAnalytics] = useState({
    monthlyBookings: 0,
    conversionRate: 0,
    topItemService: "N/A",
    averageResponseTimeMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [marketOrders, setMarketOrders] = useState([]);
  const [marketOrdersError, setMarketOrdersError] = useState("");
  const [equipmentBookingFilter, setEquipmentBookingFilter] = useState("pending");

  const fetchBookings = async () => {
    setLoading(true);
    setMarketOrdersError("");

    const [bookingsRes, analyticsRes] = await Promise.allSettled([
      getProviderBookings(),
      getProviderAnalytics(),
    ]);

    if (bookingsRes.status === "fulfilled") {
      setBookings(bookingsRes.value || []);
    } else {
      console.error("Failed to fetch bookings", bookingsRes.reason);
      setBookings([]);
    }

    if (analyticsRes.status === "fulfilled") {
      if (analyticsRes.value?.analytics) {
        setAnalytics(analyticsRes.value.analytics);
      }
    } else {
      console.error("Failed to fetch analytics", analyticsRes.reason);
    }

    if (isEquipmentProvider) {
      try {
        const marketOrderRes = await getProviderMarketOrders();
        setMarketOrders(Array.isArray(marketOrderRes?.orders) ? marketOrderRes.orders : []);
      } catch (error) {
        console.error("Failed to fetch market orders", error);
        setMarketOrders([]);
        setMarketOrdersError("Unable to load product buyer details right now.");
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    const stored = localStorage.getItem("providerAvailable");
    if (stored !== null) {
      setAvailable(stored === "true");
    }
  }, []);

    // Live booking notification: show toast + refresh list
    useEffect(() => {
      if (!notifications || notifications.length === 0) return;
      const latest = notifications[0];
      if (!latest.read) {
        setToast(latest);
        fetchBookings();
        const timer = setTimeout(() => setToast(null), 6000);
        return () => clearTimeout(timer);
      }
    }, [notifications]);


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
const historyBookings = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));
const newBookingsCount = pendingBookings.length;
const pendingRequestsCount = activeBookings.length;
const totalEarnings = bookings
  .filter((b) => b.status === "completed")
  .reduce((sum, b) => sum + (b.price || 0), 0);
const productOrdersCount = marketOrders.length;
const productOrdersPending = marketOrders.filter((o) => o.status === "placed").length;
const productOrdersConfirmed = marketOrders.filter((o) => o.status === "confirmed").length;
const buyersWithAddress = marketOrders.filter((o) => o?.deliveryAddress?.fullAddress).length;
const equipmentBookingFilters = [
  { key: "pending", label: "New Requests", count: pendingBookings.length },
  { key: "active", label: "Active", count: activeBookings.length },
  { key: "history", label: "History", count: historyBookings.length },
];
const visibleEquipmentBookings =
  equipmentBookingFilter === "pending"
    ? pendingBookings
    : equipmentBookingFilter === "active"
      ? activeBookings
      : historyBookings;
const equipmentBookingTitle =
  equipmentBookingFilter === "pending"
    ? "Booking Requests"
    : equipmentBookingFilter === "active"
      ? "Active Bookings"
      : "Booking History";
const equipmentBookingSubtitle =
  equipmentBookingFilter === "pending"
    ? "Incoming rental / hire requests from farmers"
    : equipmentBookingFilter === "active"
      ? "Accepted bookings currently in progress"
      : "Completed and cancelled equipment bookings";

  if (isDriver) {
    return (
      <div className="flex h-screen">
        <motion.main
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {toast && (
            <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white border border-orange-300 rounded-2xl shadow-2xl shadow-orange-200/50 p-4 flex items-start gap-3 animate-fade-in">
              <div className="p-2 rounded-full bg-orange-100 shrink-0">
                <FiBell className="text-orange-500 text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">New Booking Request!</p>
                <p className="text-xs text-gray-600 mt-0.5 truncate">
                  {toast.listingTitle || "Someone"} booked your service
                </p>
                <p className="text-xs text-orange-600 font-semibold mt-1">
                  ₹{toast.price?.toLocaleString() || 0} • {toast.paymentType === "offline" ? "Cash" : "Online"}
                </p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition"
              >
                <FiX />
              </button>
            </div>
          )}

          {(unreadCount ?? 0) > 0 && (
            <div className="flex justify-end">
              <button
                onClick={markAllRead}
                className="relative flex items-center gap-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 hover:bg-orange-100 transition"
              >
                <FiBell className="text-orange-500 text-lg" />
                <span>{unreadCount} new booking{unreadCount > 1 ? "s" : ""}</span>
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              </button>
            </div>
          )}

          <motion.section variants={sectionVariants} className="rounded-3xl border border-green-200 bg-[linear-gradient(120deg,#f0faf3_0%,#fff7ed_55%,#f8fbf5_100%)] p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-[#1f5f2c]">Driver Console</p>
                <p className="text-2xl font-bold text-[#123f28] mt-1">Live Driver Controls</p>
                <p className="text-sm mt-2 text-[#345845] max-w-2xl">
                  Control your live location updates and availability status from here.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={trackingId ? stopTracking : startTracking}
                  className={`px-4 py-2 rounded-xl font-semibold text-white transition ${
                    trackingId ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {trackingId ? "Stop Tracking" : "Start Tracking"}
                </button>
                <button
                  onClick={toggleAvailability}
                  className={`px-4 py-2 rounded-xl font-semibold text-white transition ${
                    available ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {available ? "Available" : "Unavailable"}
                </button>
              </div>
            </div>
            {trackingMessage ? <p className="text-sm text-[#3b5f41] mt-3">{trackingMessage}</p> : null}
          </motion.section>

          <motion.section
            variants={sectionVariants}
            className="flex flex-wrap gap-2 rounded-2xl border border-white/45 bg-white/25 p-2 backdrop-blur-xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] ring-1 ring-white/30"
          >
            {[
              { key: "all", label: "All", count: bookings.length },
              { key: "pending", label: "Pending", count: pendingBookings.length },
              { key: "active", label: "Active", count: activeBookings.length },
              { key: "history", label: "History", count: historyBookings.length },
            ].map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-2 rounded-xl bg-white/35 px-3 py-2 text-sm font-semibold text-emerald-800"
              >
                <span>{chip.label}</span>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/80 px-1.5 text-xs text-emerald-700">
                  {chip.count}
                </span>
              </div>
            ))}
          </motion.section>
        </motion.main>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isEquipmentProvider ? " " : ""}`}>


        <motion.main
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Live booking toast notification */}
          {toast && (
            <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white border border-orange-300 rounded-2xl shadow-2xl shadow-orange-200/50 p-4 flex items-start gap-3 animate-fade-in">
              <div className="p-2 rounded-full bg-orange-100 shrink-0">
                <FiBell className="text-orange-500 text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">New Booking Request!</p>
                <p className="text-xs text-gray-600 mt-0.5 truncate">
                  {toast.listingTitle || "Someone"} booked your service
                </p>
                <p className="text-xs text-orange-600 font-semibold mt-1">
                  ₹{toast.price?.toLocaleString() || 0} • {toast.paymentType === "offline" ? "Cash" : "Online"}
                </p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition"
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Notification bell header */}
          {(unreadCount ?? 0) > 0 && (
            <div className="flex justify-end">
              <button
                onClick={markAllRead}
                className="relative flex items-center gap-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 hover:bg-orange-100 transition"
              >
                <FiBell className="text-orange-500 text-lg" />
                <span>{unreadCount} new booking{unreadCount > 1 ? "s" : ""}</span>
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              </button>
            </div>
          )}

        {!isEquipmentProvider && (
          <QuickNav
            newBookings={newBookingsCount}
            pendingRequests={pendingRequestsCount}
            earnings={totalEarnings}
            available={available}
            onToggleAvailability={toggleAvailability}
            showAvailability={!isEquipmentProvider}
             onNewBookingClick={() => { markAllRead?.(); }}
          />
        )}

        {isEquipmentProvider && (
          <motion.div
            variants={sectionVariants}
            {...hoverLift}
            className="rounded-3xl border border-green-200 bg-[linear-gradient(120deg,#f0faf3_0%,#fff7ed_55%,#f8fbf5_100%)] p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-[#1f5f2c]">Equipment Provider Console</p>
                <p className="text-2xl font-bold text-[#123f28] mt-1">Premium Inventory Dashboard</p>
                <p className="text-sm mt-2 text-[#345845] max-w-2xl">
                  Manage your listed equipment, track buyer requests, and monitor item orders with full visibility.
                </p>
              </div>
              <button
                onClick={() => navigate("/ListingDashboard?providerRole=equipment_provider")}
                className="px-5 py-2.5 rounded-xl bg-[#F57C00] hover:bg-[#d86f0a] text-white font-semibold transition shadow-md shadow-orange-400/30"
              >
                Add New Item
              </button>
            </div>
          </motion.div>
        )}

        {isEquipmentProvider && (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <motion.div {...hoverLift} className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide font-semibold text-[#1f5f2c]">Total Product Orders</p>
              <p className="text-3xl font-bold text-[#1f5f2c] mt-1">{productOrdersCount}</p>
            </motion.div>
            <motion.div {...hoverLift} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide font-semibold text-[#b85f00]">Pending Product Orders</p>
              <p className="text-3xl font-bold text-[#b85f00] mt-1">{productOrdersPending}</p>
            </motion.div>
            <motion.div {...hoverLift} className="rounded-2xl border border-lime-200 bg-lime-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide font-semibold text-lime-700">Confirmed Product Orders</p>
              <p className="text-3xl font-bold text-lime-800 mt-1">{productOrdersConfirmed}</p>
            </motion.div>
            <motion.div {...hoverLift} className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide font-semibold text-orange-700">Buyer Addresses Captured</p>
              <p className="text-3xl font-bold text-orange-800 mt-1">{buyersWithAddress}</p>
            </motion.div>
          </motion.div>
        )}

        {isEquipmentProvider && (
          <motion.div
            variants={sectionVariants}
            {...hoverLift}
            className="rounded-2xl border border-green-200 bg-[linear-gradient(120deg,#f8fbf5_0%,#fff7ed_100%)] p-5 shadow-sm"
          >
            <p className="font-semibold text-amber-900 text-lg">Recent Product Orders</p>
            {marketOrdersError ? <p className="text-sm text-red-600 mt-2">{marketOrdersError}</p> : null}
            {marketOrders.length === 0 ? (
              <p className="text-sm text-[#3b5f41] mt-2">No product orders yet.</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {marketOrders.slice(0, 5).map((order) => (
                  <motion.div key={order._id} {...hoverLift} className="rounded-xl border border-green-200 bg-white p-3.5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {order.itemId?.name || "Item"} • {order.farmerId?.name || "Farmer"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Phone: {order.farmerId?.mobile || "N/A"}</p>
                    <p className="text-xs text-gray-700 mt-1">
                      Address: {order.deliveryAddress?.fullAddress || "N/A"}
                      {order.deliveryAddress?.villageTown ? `, ${order.deliveryAddress.villageTown}` : ""}
                      {order.deliveryAddress?.landmark ? ` (${order.deliveryAddress.landmark})` : ""}
                      {order.deliveryAddress?.pincode ? ` - ${order.deliveryAddress.pincode}` : ""}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {isEquipmentProvider && (
          <motion.div
            variants={sectionVariants}
            {...hoverLift}
            className="rounded-2xl border border-green-200 bg-[linear-gradient(120deg,#f0faf3_0%,#fff7ed_100%)] p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {equipmentBookingFilter === "pending" ? "📋" : equipmentBookingFilter === "active" ? "⚙️" : "🧾"}
                </span>
                <div>
                  <p className="font-bold text-[#1f5f2c] text-lg leading-tight">{equipmentBookingTitle}</p>
                  <p className="text-xs text-[#3b5f41]">{equipmentBookingSubtitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {equipmentBookingFilters.map((chip) => {
                  const isActive = equipmentBookingFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => setEquipmentBookingFilter(chip.key)}
                      className={`relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "bg-[#1f5f2c] text-white shadow"
                          : "border border-green-200 bg-white/80 text-[#2f5d37] hover:bg-green-50"
                      }`}
                    >
                      <span>{chip.label}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-green-100 text-[#1f5f2c]"}`}>
                        {chip.count}
                      </span>
                      {isActive && (
                        <motion.span
                          layoutId="equipment-booking-filter-underline"
                          className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-white/90"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-[#3b5f41]">Loading bookings...</p>
            ) : visibleEquipmentBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">
                  {equipmentBookingFilter === "pending" ? "📭" : equipmentBookingFilter === "active" ? "🛰️" : "🗂️"}
                </p>
                <p className="text-sm font-semibold text-[#3b5f41]">
                  {equipmentBookingFilter === "pending"
                    ? "No new booking requests"
                    : equipmentBookingFilter === "active"
                      ? "No active bookings right now"
                      : "No booking history yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleEquipmentBookings.map((booking) => (
                  <motion.div key={booking._id} variants={sectionVariants}>
                    <FarmerCard booking={booking} onStatusChange={fetchBookings} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!isLabour && !isEquipmentProvider && (
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
        )}

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


          {!isEquipmentProvider && (
            <>
              {/* New requests (still to be accepted) */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">New Requests</h2>
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
                <h2 className="text-xl font-semibold">Active Bookings</h2>
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
            </>
          )}

        </motion.main>
      </div>
  );
}


export default ProviderHome;
