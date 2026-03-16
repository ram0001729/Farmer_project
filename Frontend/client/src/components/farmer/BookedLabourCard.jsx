import { FiPhone, FiStar } from "react-icons/fi";

function BookedLabourCard({ booking }) {
  const labour = booking.listingId;

  if (!labour) return null;

  return (
    <div className="relative w-full max-w-sm">

      <div className="relative rounded-3xl p-4  backdrop-blur-xl border border-[#157A8C]/20">

        {/* Image */}
        <div className="relative">
          <img
            src="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405806/ChatGPT_Image_Jan_26_2026_11_06_28_AM_u7qffy.png"
            alt="Service"
            className="w-full h-48 object-cover rounded-2xl"
          />

          {/* Status Badge */}
          <span className="absolute top-4 left-4 px-4 py-1.5 text-sm font-semibold rounded-full shadow-md bg-blue-500 text-white">
            {booking.status || "Booked"}
          </span>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-3 font-inter">
          <h3 className="text-2xl font-extrabold text-gray-900">
            {labour.title}
          </h3>

          <p className="text-lg text-gray-700">
            Experience:
            <span className="font-semibold text-gray-900">
              {labour.experience || "N/A"}
            </span>
          </p>

          <div className="flex items-center justify-between mt-3">
            <p className="text-2xl font-bold text-orange-600">
              ₹{labour.price || "N/A"}
              <span className="text-xl text-black font-normal">
                / {labour.priceUnit}
              </span>
            </p>

            <div className="flex items-center gap-1 text-yellow-500 text-lg font-semibold">
              <FiStar />
              {labour.rating ?? "N/A"}
            </div>
          </div>
        </div>

        {/* Booking Date */}
        <p className="mt-3 text-lg text-gray-700 font-medium">
          📅 Booked on:{" "}
          {new Date(booking.createdAt).toLocaleDateString()}
        </p>

        {/* Call Button */}
        <div className="mt-4">
          <a
            href={labour.mobile ? `tel:${labour.mobile}` : undefined}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white text-sm font-medium transition ${
              labour.mobile ? "bg-[#157A8C] hover:bg-[#1c94a8]" : "bg-gray-400 cursor-not-allowed pointer-events-none"
            }`}
            aria-disabled={!labour.mobile}
          >
            <FiPhone /> Call
          </a>
        </div>

      </div>
    </div>
  );
}

export default BookedLabourCard;
