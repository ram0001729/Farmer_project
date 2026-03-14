import { FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProviderBookings } from "../../services/bookingService";

function QuickNav() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getProviderBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch provider bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div
      className="
        w-full bg-white rounded-2xl
        shadow-md shadow-black/5
        border border-black/10
        p-6 space-y-6
      "
    >
      {/* 🚀 Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">

        {/* My Listings */}
        <button
          onClick={() => navigate("/provider/bookings")}
          className="
            flex-1 flex items-center justify-center gap-3
            py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r from-orange-600 to-amber-600
            hover:from-orange-700 hover:to-amber-700
            transition-all duration-300
            shadow-md shadow-orange-600/30
            hover:shadow-lg hover:-translate-y-0.5
          "
        >
          <FiUsers className="text-lg" />
          {loading ? "Loading..." : `My Listings (${bookings.length})`}
        </button>

      </div>
    </div>
  );
}

export default QuickNav;
