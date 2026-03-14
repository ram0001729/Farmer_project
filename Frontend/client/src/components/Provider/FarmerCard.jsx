import { FiPhone, FiMapPin } from "react-icons/fi";
import {
  confirmBooking,
  cancelBooking,
  startBooking,
  completeBooking,
} from "../../services/bookingService";

function FarmerCard({ booking, onStatusChange }) {
  if (!booking) return null;

  const { _id, status } = booking;
  const farmer = booking.farmerId || {};

  const handleAccept = async () => {
    try {
      await confirmBooking(_id);
      alert("Booking accepted");
      onStatusChange();
    } catch (err) {
      alert("Failed to accept booking");
    }
  };


  const handleReject = async () => {
    try {
      await cancelBooking(_id);
      alert("Booking rejected");
      onStatusChange();
    } catch (err) {
      alert("Failed to reject booking");
    }
  };

  const handleStart = async () => {
    try {
      await startBooking(_id);
      alert("Booking started");
      onStatusChange();
    } catch (err) {
      alert("Failed to start booking");
    }
  };

  const handleComplete = async () => {
    try {
      await completeBooking(_id);
      alert("Booking completed");
      onStatusChange();
    } catch (err) {
      alert("Failed to complete booking");
    }
  };

  return (
    <div className="
     w-full max-w-sm rounded-3xl
bg-white
shadow-[0_20px_60px_rgba(0,0,0,0.18)]
border border-white/20
backdrop-blur-xl
overflow-hidden
text-black
relative
transition-all duration-500
hover:-translate-y-2
hover:shadow-[0_30px_80px_rgba(34,197,94,0.35)]
    "
     
    >

      {/* Top Profile Section */}
      <div className="p-3 flex items-center gap-8 bg-white">
        <img
          src="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1770308111/Indian_Farmer_Agriculture_Life_keqkby.jpg"
          alt="Driver"
          className="w-20 h-23 rounded-2xl object-cover shadow-md"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {farmer.name || "Farmer"}
          </h3>
          <p className="text-sm text-gray-900">
            {booking.status ? booking.status.toUpperCase() : "REQUEST"}
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-black">
          <FiMapPin className="text-black" />
          <span>Karimnagar, Telangana</span>
        </div>

        {/* Call Button */}
        <a
          href={`tel:${farmer.mobile || "+919876543210"}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#9CD5FF] text-black font-semibold shadow-md"
        >
          <FiPhone /> Call Farmer
        </a>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {status === "pending" && (
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-2.5 rounded-xl bg-[#81E7AF] text-black font-semibold"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl bg-[#FF4646]/80 text-white font-semibold hover:bg-red transition"
              >
                Reject
              </button>
            </div>
          )}

          {status === "confirmed" && (
            <button
              onClick={handleStart}
              className="w-full py-2.5 rounded-xl bg-[#4F46E5] text-white font-semibold"
            >
              Start Job
            </button>
          )}

          {status === "started" && (
            <button
              onClick={handleComplete}
              className="w-full py-2.5 rounded-xl bg-[#16A34A] text-white font-semibold"
            >
              Complete Job
            </button>
          )}

          {status === "completed" && (
            <div className="text-green-700 font-semibold">Completed</div>
          )}

          {status === "cancelled" && (
            <div className="text-red-600 font-semibold">Cancelled</div>
          )}
        </div>
      </div>
    </div>
  );
}

export  default FarmerCard;
