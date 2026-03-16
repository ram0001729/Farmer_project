import { FiPhone } from "react-icons/fi";
import { createBooking } from "../../services/bookingService";
import { getLocationNameFromCoordinates } from "../../services/locationservice";
import { useNavigate } from "react-router-dom";
import { FiStar, FiMapPin } from "react-icons/fi";
import { useEffect, useState } from "react";
import SuccessLottieOverlay from "../common/SuccessLottieOverlay";

function LabourCard({
  labour,
  showBookButton = true,
  showAvailabilityBadge = true,
  actionLabel = "",
  onAction,
  actionDisabled = false,
  actionClassName = "",
}) {
  const navigate = useNavigate();

  const formattedCoordinates = Array.isArray(labour.location?.coordinates) && labour.location.coordinates.length === 2
    ? `${labour.location.coordinates[1].toFixed(4)}, ${labour.location.coordinates[0].toFixed(4)}`
    : null;

  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState(null);
  const [resolvedLocationName, setResolvedLocationName] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadLocationName = async () => {
      if (labour.locationName || labour.area?.label || labour.area?.value || typeof labour.area === "string") {
        setResolvedLocationName("");
        return;
      }

      const coords = labour.location?.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) {
        setResolvedLocationName("");
        return;
      }

      const locationName = await getLocationNameFromCoordinates(coords[1], coords[0]);
      if (isMounted) {
        setResolvedLocationName(locationName);
      }
    };

    loadLocationName();

    return () => {
      isMounted = false;
    };
  }, [labour.location?.coordinates, labour.locationName, labour.area]);

  const getCurrentCoordinates = () =>
    new Promise((resolve) => {
      if (!navigator?.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          const locationName = await getLocationNameFromCoordinates(latitude, longitude);
          resolve({ coordinates: [longitude, latitude], locationName });
        },
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    });

  // STEP 1 → Open modal
  const handleBooking = () => {
    if (!labour?._id) {
      alert("Invalid listing. Please refresh.");
      return;
    }
    setShowPaymentModal(true);
  };
const confirmBooking = async () => {
  try {
    if (!paymentType) {
      alert("Please select payment method");
      return;
    }

    const destinationInfo = await getCurrentCoordinates();

    const payload = {
      listingId: labour._id,
      paymentType,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      area: {
        value: destinationInfo?.locationName || "local",
        label: destinationInfo?.locationName || "Local Area",
      },
      ...(destinationInfo?.coordinates ? { destinationCoordinates: destinationInfo.coordinates } : {}),
    };

    const res = await createBooking(payload);

    setShowPaymentModal(false);

    if (paymentType === "online") {
  navigate(`/payment/${res.bookingId}`);
    } else {
      setShowSuccess(true);
    }

    setPaymentType(null);

  } catch (err) {
    alert(err.response?.data?.error || "Booking failed");
  }
};
  return (
    <div className="relative w-full max-w-sm">
<div className="relative rounded-3xl p-3.5 bg-white border border-gray-200/90 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative">
          <img
            src={labour.providerRole === "driver"
              ? "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405806/ChatGPT_Image_Jan_26_2026_11_06_28_AM_u7qffy.png"
              : "https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405972/ChatGPT_Image_Jan_26_2026_11_09_15_AM_b13az0.png"
            }
            alt="Service"
            className="w-full h-40 object-cover rounded-2xl"
          />
          <div className="absolute inset-x-0 bottom-0 h-14 rounded-b-2xl bg-gradient-to-t from-black/35 to-transparent" />
        {showAvailabilityBadge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-full backdrop-blur-md border shadow-sm ${
              labour.available
                ? "bg-emerald-500/95 text-white border-emerald-300"
                : "bg-rose-500/95 text-white border-rose-300"
            }`}
          >
            {labour.available ? "Available" : "Unavailable"}
          </span>
        )}
        </div>

        {/* Content */}
<div className="mt-4 space-y-3.5">

  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Service Provider</p>
      <h3 className="text-[1.65rem] font-bold text-gray-900 leading-tight truncate">
        {labour.providerName || labour.ownerId?.name || labour.name}
      </h3>
    </div>
    <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
      <FiStar className="text-sm" />
      {labour.rating ?? "0"}
    </div>
  </div>

  <p className="text-sm text-gray-600 leading-snug -mt-1">
    {labour.title}
  </p>

  <div className="grid grid-cols-2 gap-2">
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-[11px] text-gray-500">Experience</p>
      <p className="text-base font-semibold text-gray-900 mt-0.5">
        {labour.experience ? `${labour.experience} yrs` : "N/A"}
      </p>
    </div>
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-[11px] text-gray-500">Distance</p>
      <p className="text-base font-semibold text-gray-900 mt-0.5">
        {labour.distance != null ? `${(labour.distance / 1000).toFixed(1)} km` : "Nearby"}
      </p>
    </div>
  </div>

  <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-100 px-3 py-2.5">
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-bold text-green-700">
        ₹{labour.price ?? "N/A"}
      </span>
      <span className="text-sm text-gray-600">
        / {labour.priceUnit || "day"}
      </span>
    </div>
    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2.5 py-1">
      Premium Service
    </span>
  </div>

  {/* Registered location (area name) */}
  {(() => {
    const areaName =
      labour.locationName ||
      labour.area?.label ||
      labour.area?.value ||
      (typeof labour.area === "string" ? labour.area : null) ||
      resolvedLocationName;

    const locationLabel =
      areaName ||
      formattedCoordinates;

    return locationLabel ? (
      <div className="flex items-center gap-2 text-sm text-gray-600 rounded-xl border border-gray-100 px-3 py-2 bg-white">
        <FiMapPin className="text-emerald-600 text-sm shrink-0" />
        <span className="truncate font-bold text-gray-800">{`Location: ${locationLabel}`}</span>
      </div>
    ) : null;
  })()}

</div>
        {/* Actions */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 space-y-2.5">
          <div className="flex gap-3">
            <a
              href={labour.mobile ? `tel:${labour.mobile}` : undefined}
              className={`${showBookButton ? "flex-1" : "w-full"} flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-300 ${
                labour.mobile ? "bg-[#1d8192] hover:bg-[#176d7b] shadow-md shadow-cyan-700/20" : "bg-gray-300 cursor-not-allowed pointer-events-none"
              }`}
              aria-disabled={!labour.mobile}
            >
              <FiPhone /> Call
            </a>

            {showBookButton && (
              <button
                disabled={!labour.available}
                onClick={handleBooking}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  labour.available
                    ? "bg-[#f28a00] hover:bg-[#d97900] text-white shadow-md shadow-orange-600/25"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Book
              </button>
            )}
          </div>

          {!showBookButton && actionLabel ? (
            <button
              disabled={actionDisabled}
              onClick={onAction}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                actionDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : ""
              } ${actionClassName}`}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>

        {showSuccess && (
          <SuccessLottieOverlay
            message="Booking Confirmed!"
            onClose={() => setShowSuccess(false)}
          />
        )}
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">

            <h2 className="text-lg font-bold mb-4 text-center">
              Select Payment Method
            </h2>

            <div
  onClick={() => setPaymentType("online")}
              className={`p-3 rounded-lg border cursor-pointer mb-3 transition ${
                paymentType === "online"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300"
              }`}
            >
              💳 Pay Online
            </div>

            <div
              onClick={() => setPaymentType("offline")}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                paymentType === "offline"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-300"
              }`}
            >
              💵 Pay Offline (Cash)
            </div>

            <button
              onClick={confirmBooking}
              disabled={!paymentType}
              className={`mt-4 w-full py-2 rounded-lg font-semibold transition ${
                paymentType
                  ? "bg-[#F57C00] text-white hover:bg-[#ff9a3c]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm Booking
            </button>

            <button
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentType(null);
              }}
              className="mt-2 w-full text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabourCard;