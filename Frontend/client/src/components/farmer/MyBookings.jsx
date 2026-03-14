import { useEffect, useState } from "react";
import { getMyBookings } from "@/services/bookingService";
import LabourCard from "@/components/farmer/LabourCard";
import { cancelBooking } from "@/services/bookingService";
import { FiActivity } from "react-icons/fi";
import DriverTracking from "@/components/common/DriverTracking";
import { useTranslation } from "react-i18next";

const DRIVER_CANCEL_WINDOW_MS = 9 * 60 * 60 * 1000;

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function MyBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
       const bookingsData = await getMyBookings();
       console.log(bookingsData);

setBookings(bookingsData);

      } catch (err) {
        console.error(err);
      }
    };

    fetchBookings();
  }, []);

const handleCancel = async (booking) => {
  try {
    const createdTs = new Date(booking.createdAt).getTime();
    const isDriverBooking = booking?.providerRole === "driver" || booking?.listingId?.providerRole === "driver";
    const isWindowExpired = isDriverBooking && Date.now() - createdTs > DRIVER_CANCEL_WINDOW_MS;

    if (isWindowExpired) {
      alert(t("Farmer can cancel driver booking only within 9 hours."));
      return;
    }

    await cancelBooking(booking._id);

    // Remove booking from UI completely
    setBookings((prev) =>
      prev.filter((b) => b._id !== booking._id)
    );

  } catch (err) {
    alert(err.response?.data?.error || t("Failed to cancel booking"));
  }
};
const totalBookings = bookings.length;

const activeBookings = bookings.filter(
  (b) => b.status === "confirmed" || b.status === "started"
).length;

const completedBookings = bookings.filter(
  (b) => b.status === "completed"
).length;

const onlineBookings = bookings.filter(
  (b) => b.paymentType === "online"
).length;

const offlineBookings = bookings.filter(
  (b) => b.paymentType === "offline"
).length;

const filteredBookings = bookings.filter((b) => {
  if (filter === "all") return true;
  if (filter === "active") return b.status === "confirmed" || b.status === "started";
  if (filter === "completed") return b.status === "completed";
  return true;
});
  return (
    <div className=" p-8">

<div className="min-h-screen ">

  <div className="mb-8">
    <h1 className="text-3xl font-bold text-green-700">
      {t("My Bookings")}
    </h1>

    <p className="text-gray-600 mt-1">
      {t("Overview of all your service bookings")}
    </p>
  </div>


<div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">

  <button
    type="button"
    onClick={() => setFilter("all")}
    className={`text-left p-4 rounded-xl shadow transition ${
      filter === "all"
        ? "bg-green-50 border border-green-200"
        : "bg-white border border-gray-200 hover:shadow-lg"
    }`}
  >
    <p className="text-sm text-black-500">{t("Total")}</p>
    <p className="text-xl font-bold">{totalBookings}</p>
  </button>

  <button
    type="button"
    onClick={() => setFilter("active")}
    className={`text-left rounded-2xl p-5 shadow-md transition ${
      filter === "active"
        ? "bg-green-50 border border-green-200"
        : "bg-white border border-gray-100 hover:shadow-lg"
    }`}
  >
    <p className="text-sm text-gray-500">{t("Active Bookings")}</p>

    <p className="text-3xl font-bold text-green-600 mt-1">
      {activeBookings}
    </p>
  </button>

  <button
    type="button"
    onClick={() => setFilter("completed")}
    className={`text-left rounded-2xl p-5 shadow-md transition ${
      filter === "completed"
        ? "bg-green-50 border border-green-200"
        : "bg-white border border-gray-100 hover:shadow-lg"
    }`}
  >
    <p className="text-sm text-gray-500">{t("Completed Bookings")}</p>

    <p className="text-3xl font-bold text-green-600 mt-1">
      {completedBookings}
    </p>
  </button>

  <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-sm text-black-500">{t("Online Payment")}</p>
    <p className="text-xl font-bold text-purple-600">
      {onlineBookings}
    </p>
  </div>

  <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-sm text-black-500">{t("Offline Payment")}</p>
    <p className="text-xl font-bold text-orange-600">
      {offlineBookings}
    </p>
  </div>

</div>
  <div className="max-w-7xl mx-auto px-4 py-8">
<div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700">
         {t("Your Bookings")}
        </h1>
        <p className="text-gray-600 mt-1">
          {t("Manage and track your scheduled services")}
        </p>
      </div>
<div className="flex flex-col gap-6">    
  {filteredBookings
    .filter((b) => b.listingId)
    .map((booking) => {
      const createdTs = new Date(booking.createdAt).getTime();
      const startTs = new Date(booking.startAt).getTime();
      const endTs = new Date(booking.endAt).getTime();
      const isDriverBooking = booking?.providerRole === "driver" || booking?.listingId?.providerRole === "driver";
      const isDriverCancelWindowExpired = isDriverBooking && now - createdTs > DRIVER_CANCEL_WINDOW_MS;
      const isUpcoming = now < startTs;
      const isOngoing = now >= startTs && now <= endTs;
      const isEnded = now > endTs;

      return (
      <div
        key={booking._id}
  className="flex  bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
      >

        <div className="w-[40%] p-4 border-r">

        <LabourCard
          showBookButton={false}
          showAvailabilityBadge={false}
          actionLabel={t("Cancel")}
          onAction={() => handleCancel(booking)}
          actionDisabled={booking.status === "completed" || isDriverCancelWindowExpired}
          actionClassName="bg-red-500 hover:bg-red-600 text-white"
          labour={{
            ...booking.listingId,
            providerName: booking.providerId?.name,
            locationName: booking.area?.label,
          }}
        />
     {/* Booking Time Info */}
     <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-700 space-y-1">

    <p>
      <span className="font-medium text-green-700">{t("Start")}:</span>{" "}
      {new Date(booking.startAt).toLocaleString()}
      {isUpcoming && (
        <span className="ml-2 text-xs text-green-700">({t("starts in")} {formatDuration(startTs - now)})</span>
      )}
    </p>

    <p>
      <span className="font-medium text-red-600">{t("End")}:</span>{" "}
      {new Date(booking.endAt).toLocaleString()}
      {isOngoing && (
        <span className="ml-2 text-xs text-red-600">({t("ends in")} {formatDuration(endTs - now)})</span>
      )}
      {isEnded && (
        <span className="ml-2 text-xs text-gray-500">({t("ended")} {formatDuration(now - endTs)} {t("ago")})</span>
      )}
    </p>

    <p>
      <span className="font-medium text-blue-700">{t("Booked Since")}:</span>{" "}
      <span className="text-blue-700">{formatDuration(now - createdTs)}</span>
    </p>

    {isDriverCancelWindowExpired && (
      <p className="text-xs text-red-600 font-medium">
        {t("Cancel available only within 9 hours for driver bookings.")}
      </p>
    )}

  </div>

      </div>


      <div className="w-[60%] flex flex-col justify-between">
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-lime-50">
          {booking.status === "confirmed" || booking.status === "started" ? (
            <DriverTracking booking={booking} />
          ) : (
            <p className="text-sm text-gray-600">
              {t("Tracking will start once your booking is confirmed.")}
            </p>
          )}
        </div>

      </div>
            </div>

    )})}
</div>
</div>
  </div>

  </div>


);

}

export default MyBookings;
