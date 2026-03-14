import { useEffect, useState } from "react";
import { getProviderBookings } from "../../services/bookingService";
import FarmerCard from "./FarmerCard";

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await getProviderBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;

  if (bookings.length === 0) {
    return <p>No booking requests yet</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookings.map((booking) => (
        <FarmerCard
          key={booking._id}
          booking={booking}
          onStatusChange={fetchBookings}
        />
      ))}
    </div>
  );
}

export default ProviderBookings;
