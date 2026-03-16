import { FiBell, FiCheckCircle, FiDollarSign, FiPower } from "react-icons/fi";

const glassCls =
  "backdrop-blur-xl bg-white/25 border border-white/45 ring-1 ring-white/30 shadow-[0_10px_24px_rgba(16,24,40,0.08)]";

function QuickNav({
  newBookings = 0,
  pendingRequests = 0,
  earnings = 0,
  available = true,
  onToggleAvailability,
  onNewBookingClick = () => {},
  showAvailability = true,
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${showAvailability ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 mb-8`}>

      {/* New Booking Request */}
      <button
        type="button"
        onClick={onNewBookingClick}
        className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(245,124,0,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F57C00] ${glassCls}`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F57C00] to-[#e65100] shadow-md shadow-orange-400/30">
          <FiBell className="text-white text-xl" />
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3b5f41]">New Booking</p>
          <p className="text-2xl font-extrabold text-[#173A1E]">{newBookings}</p>
        </div>
      </button>

      {/* Total Earnings */}
      <div className={`rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(31,95,44,0.15)] ${glassCls}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f5f2c] to-[#2e7d3e] shadow-md shadow-[#1f5f2c]/30">
          <FiDollarSign className="text-white text-xl" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3b5f41]">Total Earnings</p>
          <p className="text-2xl font-extrabold text-[#173A1E]">₹{earnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className={`rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(31,95,44,0.12)] ${glassCls}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] shadow-md shadow-sky-500/25">
          <FiCheckCircle className="text-white text-xl" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3b5f41]">Pending Requests</p>
          <p className="text-2xl font-extrabold text-[#173A1E]">{pendingRequests}</p>
        </div>
      </div>

      {/* Availability Toggle */}
      {showAvailability && (
        <button
          onClick={onToggleAvailability}
          className={`flex items-center justify-between w-full rounded-2xl px-4 py-4 transition-all duration-300 hover:-translate-y-1 focus:outline-none ${glassCls} ${
            available
              ? "hover:shadow-[0_16px_36px_rgba(31,95,44,0.15)]"
              : "hover:shadow-[0_16px_36px_rgba(220,38,38,0.12)]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ${
              available
                ? "bg-gradient-to-br from-[#1f5f2c] to-[#2e7d3e] shadow-[#1f5f2c]/30"
                : "bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/25"
            }`}>
              <FiPower className="text-white text-xl" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#173A1E]">
                {available ? "Available" : "Unavailable"}
              </p>
              <p className="text-xs text-[#4a7a55]">
                {available ? "Accepting new requests" : "Not accepting requests"}
              </p>
            </div>
          </div>
          <div
            className={`h-5 w-10 rounded-full transition-all ${
              available ? "bg-[#1f5f2c]" : "bg-rose-500"
            }`}
          />
        </button>
      )}

    </div>
  );
}

export default QuickNav;