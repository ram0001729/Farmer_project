import { FiPhone } from "react-icons/fi";
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
  const listing = booking.listingId || {};

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
      w-full rounded-2xl overflow-hidden
      bg-[linear-gradient(135deg,#f0faf3_0%,#fff7ed_60%,#f8fbf5_100%)]
      border border-[#a8d5b5]
      shadow-[0_8px_28px_rgba(31,95,44,0.10)]
      hover:shadow-[0_14px_40px_rgba(31,95,44,0.18)]
      hover:-translate-y-1
      transition-all duration-300
      relative
    ">
      {/* Status ribbon */}
      <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full border ${
        status === "pending"    ? "bg-amber-50 text-[#b85f00] border-amber-300" :
        status === "confirmed"  ? "bg-[#e5f8ea] text-[#1f5f2c] border-[#86c98e]" :
        status === "started"    ? "bg-lime-50 text-lime-700 border-lime-300" :
        status === "completed"  ? "bg-green-100 text-[#1f5f2c] border-green-300" :
        "bg-rose-50 text-rose-700 border-rose-300"
      }`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Request"}
      </div>

      {/* Profile Section */}
      <div className="p-4 flex items-center gap-4 border-b border-[#a8d5b5]/50">
        <img
          src="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1770308111/Indian_Farmer_Agriculture_Life_keqkby.jpg"
          alt="Farmer"
          className="w-16 h-16 rounded-xl object-cover border-2 border-[#a8d5b5] shadow-sm flex-shrink-0"
        />
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-[#173A1E] truncate">
            {farmer.name || "Farmer"}
          </h3>
          {farmer.mobile && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-[#4a7a55] font-medium">
              <FiPhone size={11} />
              <span>{farmer.mobile}</span>
            </div>
          )}
          {listing.title && (
            <div className="mt-1 text-xs text-[#b85f00] font-semibold truncate">
              📦 {listing.title}
            </div>
          )}
        </div>
      </div>

      {/* Booking Meta */}
      <div className="px-4 pt-3 flex flex-wrap gap-2">
        {booking.price && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#e5f8ea] text-[#1f5f2c] border border-[#86c98e] font-bold">
            ₹{booking.price}
          </span>
        )}
        {booking.paymentType && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-[#b85f00] border border-amber-200 font-semibold capitalize">
            {booking.paymentType}
          </span>
        )}
        {booking.area?.label && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-white text-[#3b5f41] border border-[#c8e8c8] font-medium">
            {booking.area.label}
          </span>
        )}
      </div>

      {/* Info & Actions */}
      <div className="p-4 space-y-3">
        {/* Call button */}
        <a
          href={`tel:${farmer.mobile || "+919876543210"}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1f5f2c] text-white text-sm font-semibold shadow-md shadow-[#1f5f2c]/25 hover:bg-[#174f24] active:scale-95 transition-all"
        >
          <FiPhone size={14} /> Call Farmer
        </a>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 py-2 rounded-xl bg-[#1f5f2c] text-white text-sm font-semibold hover:bg-[#174f24] shadow-sm active:scale-95 transition-all"
              >
                ✓ Accept
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-sm active:scale-95 transition-all"
              >
                ✗ Reject
              </button>
            </div>
          )}

          {status === "confirmed" && (
            <button
              onClick={handleStart}
              className="w-full py-2 rounded-xl bg-[#F57C00] text-white text-sm font-semibold hover:bg-[#d86f0a] shadow-sm shadow-orange-400/30 active:scale-95 transition-all"
            >
              ▶ Start Job
            </button>
          )}

          {status === "started" && (
            <button
              onClick={handleComplete}
              className="w-full py-2 rounded-xl bg-[#1f5f2c] text-white text-sm font-semibold hover:bg-[#174f24] shadow-sm active:scale-95 transition-all"
            >
              ✓ Mark Complete
            </button>
          )}

          {status === "completed" && (
            <div className="text-center text-sm font-bold text-[#1f5f2c] py-1">✅ Completed</div>
          )}

          {status === "cancelled" && (
            <div className="text-center text-sm font-bold text-rose-600 py-1">✗ Cancelled</div>
          )}
        </div>
      </div>
    </div>
  );
}

export  default FarmerCard;
