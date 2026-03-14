import { useEffect, useState } from "react";
import { getProviderBookings } from "@/services/bookingService";
import FarmerCard from "@/components/Provider/FarmerCard";

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-700">My Item Bookings</h1>
        <p className="text-gray-600 mt-1">Manage incoming booking requests for your listings.</p>
      </div>

      {loading ? <p>Loading bookings...</p> : null}

      {!loading && (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">New Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingBookings.length === 0 ? (
                <p className="text-gray-500">No new requests.</p>
              ) : (
                pendingBookings.map((booking) => (
                  <FarmerCard key={booking._id} booking={booking} onStatusChange={fetchBookings} />
                ))
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Active Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBookings.length === 0 ? (
                <p className="text-gray-500">No active bookings.</p>
              ) : (
                activeBookings.map((booking) => (
                  <FarmerCard key={booking._id} booking={booking} onStatusChange={fetchBookings} />
                ))
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Booking History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyBookings.length === 0 ? (
                <p className="text-gray-500">No completed/cancelled bookings yet.</p>
              ) : (
                historyBookings.map((booking) => (
                  <FarmerCard key={booking._id} booking={booking} onStatusChange={fetchBookings} />
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ProviderBookings;
