import { FiBell, FiCheckCircle, FiDollarSign, FiPower } from "react-icons/fi";

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
        className="w-full bg-white border rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <div className="p-3 rounded-full bg-orange-50">
          <FiBell className="text-orange-500 text-2xl" />
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-500">New Booking</p>
          <p className="text-xl font-semibold">{newBookings}</p>
        </div>
      </button>

      {/* Total Earnings */}
      <div className="bg-white border rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
        <div className="p-3 rounded-full bg-green-50">
          <FiDollarSign className="text-green-600 text-2xl" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-xl font-semibold">₹{earnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white border rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
        <div className="p-3 rounded-full bg-blue-50">
          <FiCheckCircle className="text-blue-500 text-2xl" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-xl font-semibold">{pendingRequests}</p>
        </div>
      </div>

      {/* Availability Toggle */}
      {showAvailability && (
        <button
          onClick={onToggleAvailability}
          className={`flex items-center justify-between w-full rounded-xl px-4 py-4 shadow border transition-all duration-300 focus:outline-none
            ${available ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300"}`}
        >
          <div className="flex items-center gap-3">
            <FiPower
              className={`text-xl ${available ? "text-green-600" : "text-red-600"}`}
            />
            <div>
              <p className="text-sm font-semibold">
                {available ? "Available" : "Unavailable"}
              </p>
              <p className="text-xs text-gray-500">
                {available ? "Accepting new requests" : "Not accepting new requests"}
              </p>
            </div>
          </div>
          <div
            className={`h-5 w-10 rounded-full transition-all ${
              available ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </button>
      )}

    </div>
  );
}

export default QuickNav;