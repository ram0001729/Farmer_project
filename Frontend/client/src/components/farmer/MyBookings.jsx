import { useEffect, useState } from "react";
import { getMyBookings } from "@/services/bookingService";
import LabourCard from "@/components/farmer/LabourCard";
import { cancelBooking } from "@/services/bookingService";
import { FiCalendar, FiClock, FiCheckCircle, FiWifi, FiBriefcase, FiZap, FiLayers } from "react-icons/fi";
import DriverTracking from "@/components/common/DriverTracking";
import { useTranslation } from "react-i18next";

const DRIVER_CANCEL_WINDOW_MS = 9 * 60 * 60 * 1000;

function toTimestamp(value, fallback = Date.now()) {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : fallback;
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "0m";
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function MyBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsData = await getMyBookings();
        setBookings(bookingsData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBookings();
  }, []);

  const hasActiveTracking = bookings.some(
    (booking) => booking.status === "confirmed" || booking.status === "started"
  );

  useEffect(() => {
    if (!hasActiveTracking) return undefined;

    const interval = setInterval(async () => {
      try {
        const bookingsData = await getMyBookings();
        setBookings(bookingsData);
      } catch (err) {
        console.error(err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [hasActiveTracking]);

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
      setBookings((prev) => prev.filter((b) => b._id !== booking._id));
    } catch (err) {
      alert(err.response?.data?.error || t("Failed to cancel booking"));
    }
  };

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "started").length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const onlineBookings = bookings.filter((b) => b.paymentType === "online").length;
  const offlineBookings = bookings.filter((b) => b.paymentType === "offline").length;

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "active") return b.status === "confirmed" || b.status === "started";
    if (filter === "completed") return b.status === "completed";
    return true;
  });

  const visibleBookings = filteredBookings;

  const metricCards = [
    {
      key: "all",
      title: t("Total"),
      value: totalBookings,
      icon: FiLayers,
      iconBg: "bg-slate-700",
      activeClass: "from-slate-100 to-slate-200 border-slate-300 ring-slate-200",
      idleClass: "from-slate-50 to-slate-100 border-slate-200",
      textClass: "text-slate-700",
      clickable: true,
    },
    {
      key: "active",
      title: t("Active Bookings"),
      value: activeBookings,
      icon: FiZap,
      iconBg: "bg-emerald-500",
      activeClass: "from-emerald-100 to-teal-100 border-emerald-300 ring-emerald-200",
      idleClass: "from-emerald-50 to-teal-50 border-emerald-200",
      textClass: "text-emerald-700",
      clickable: true,
    },
    {
      key: "completed",
      title: t("Completed Bookings"),
      value: completedBookings,
      icon: FiCheckCircle,
      iconBg: "bg-indigo-500",
      activeClass: "from-indigo-100 to-blue-100 border-indigo-300 ring-indigo-200",
      idleClass: "from-indigo-50 to-blue-50 border-indigo-200",
      textClass: "text-indigo-700",
      clickable: true,
    },
    {
      key: "online",
      title: t("Online Payment"),
      value: onlineBookings,
      icon: FiWifi,
      iconBg: "bg-violet-500",
      activeClass: "from-violet-100 to-fuchsia-100 border-violet-300 ring-violet-200",
      idleClass: "from-violet-50 to-fuchsia-50 border-violet-200",
      textClass: "text-violet-700",
      clickable: false,
    },
    {
      key: "offline",
      title: t("Offline Payment"),
      value: offlineBookings,
      icon: FiBriefcase,
      iconBg: "bg-amber-500",
      activeClass: "from-amber-100 to-orange-100 border-amber-300 ring-amber-200",
      idleClass: "from-amber-50 to-orange-50 border-amber-200",
      textClass: "text-amber-700",
      clickable: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#efe4bb_0%,#e7dbad_42%,#e4d6a4_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-3xl border border-white/45 bg-white/35 p-6 shadow-[0_10px_30px_rgba(90,70,20,0.10)] backdrop-blur-xl ring-1 ring-white/30">
          <h1 className="text-3xl font-bold text-emerald-800">{t("My Bookings")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("Overview of all your service bookings")}</p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((card) => {
            const Icon = card.icon;
            const isSelected = card.clickable && filter === card.key;
            const classSet = isSelected ? card.activeClass : card.idleClass;

            const commonClass = `min-h-[118px] rounded-2xl border bg-gradient-to-br ${classSet} p-5 text-left shadow-[0_8px_24px_rgba(56,48,18,0.10)] transition-all duration-300 flex flex-col justify-between backdrop-blur-md ring-1 ring-white/30`;

            const cardContent = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${card.textClass}`}>{card.title}</p>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${card.iconBg} shadow-md`}>
                    <Icon className="text-white text-base" />
                  </span>
                </div>
                <p className={`text-3xl font-bold leading-none ${card.textClass}`}>{card.value}</p>
              </>
            );

            if (card.clickable) {
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setFilter(card.key)}
                  className={`${commonClass} ${!isSelected ? "hover:shadow-md" : "ring-2"}`}
                >
                  {cardContent}
                </button>
              );
            }

            return (
              <div key={card.key} className={commonClass}>
                {cardContent}
              </div>
            );
          })}
        </section>

        <section className="rounded-3xl border border-white/45 bg-white/40 p-5 shadow-[0_14px_36px_rgba(74,58,24,0.12)] backdrop-blur-xl ring-1 ring-white/35 md:p-6">
          <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t("Your Bookings")}</h2>
              <p className="mt-1 text-sm text-slate-600">{t("Manage and track your scheduled services")}</p>
            </div>
            <span className="rounded-full border border-white/50 bg-white/50 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-md">
              {t("Showing")}: {visibleBookings.length}
            </span>
          </div>

          {visibleBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/50 bg-white/35 px-6 py-12 text-center backdrop-blur-md">
              <p className="text-base font-semibold text-slate-700">{t("No bookings found for this filter.")}</p>
              <p className="mt-1 text-sm text-slate-500">{t("Try switching filter to view other bookings.")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleBookings.map((booking) => {
      const listingData = booking?.listingId && typeof booking.listingId === "object" ? booking.listingId : null;
      const createdTs = toTimestamp(booking?.createdAt, now);
      const startTs = toTimestamp(booking?.startAt, createdTs);
      const endTs = toTimestamp(booking?.endAt, startTs);
      const isDriverBooking = booking?.providerRole === "driver" || listingData?.providerRole === "driver";
      const isDriverCancelWindowExpired = isDriverBooking && now - createdTs > DRIVER_CANCEL_WINDOW_MS;
      const isCompleted = booking?.status === "completed";
      const isStarted = booking?.status === "started";
      const isConfirmed = booking?.status === "confirmed";
      const isUpcoming = !isCompleted && !isStarted && isConfirmed;
      const isOngoing = isStarted;
      const isEnded = isCompleted;
      const bookingStateLabel = isEnded ? t("Completed") : isOngoing ? t("Ongoing") : t("Upcoming");
      const bookingStateClass = isEnded
        ? "bg-gray-100 text-gray-700 border-gray-200"
        : isOngoing
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-blue-50 text-blue-700 border-blue-200";

      return (
        <article
          key={booking._id}
          className="grid gap-5 rounded-2xl border border-white/45 bg-white/45 p-4 shadow-[0_12px_32px_rgba(72,56,20,0.10)] transition hover:shadow-[0_16px_36px_rgba(72,56,20,0.15)] backdrop-blur-lg ring-1 ring-white/35 xl:grid-cols-[minmax(330px,420px)_1fr]"
        >
          <div className="space-y-3">
            {listingData ? (
              <LabourCard
                showBookButton={false}
                showAvailabilityBadge={false}
                actionLabel={t("Cancel")}
                onAction={() => handleCancel(booking)}
                actionDisabled={booking.status === "completed" || isDriverCancelWindowExpired}
                actionClassName="bg-rose-500 hover:bg-rose-600 text-white"
                labour={{
                  ...listingData,
                  providerName: booking.providerId?.name,
                  locationName: listingData?.locationName || "",
                }}
              />
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
                <p className="font-semibold">{t("Service listing is no longer available")}</p>
                <p className="mt-1 text-xs text-amber-700">{t("Booking details are still shown below.")}</p>
              </div>
            )}

            <div className="rounded-2xl border border-white/45 bg-white/50 px-4 py-3 text-sm text-slate-700 backdrop-blur-md ring-1 ring-white/30">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("Booking Schedule")}
                </p>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${bookingStateClass}`}>
                  {bookingStateLabel}
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                <p className="flex items-start justify-between gap-3">
                  <span className="font-medium text-emerald-700">{t("Start")}</span>
                  <span className="text-right text-slate-800">
                    {Number.isFinite(startTs) ? new Date(startTs).toLocaleString() : t("Not available")}
                    {isUpcoming && (
                      <span className="block text-xs text-emerald-700">{t("starts in")} {formatDuration(startTs - now)}</span>
                    )}
                  </span>
                </p>

                <p className="flex items-start justify-between gap-3">
                  <span className="font-medium text-rose-600">{t("End")}</span>
                  <span className="text-right text-slate-800">
                    {Number.isFinite(endTs) ? new Date(endTs).toLocaleString() : t("Not available")}
                    {isOngoing && (
                      <span className="block text-xs text-rose-600">{t("ends in")} {formatDuration(endTs - now)}</span>
                    )}
                    {isEnded && (
                      <span className="block text-xs text-slate-500">{t("ended")} {formatDuration(now - endTs)} {t("ago")}</span>
                    )}
                  </span>
                </p>

                <p className="flex items-center justify-between gap-3 border-t border-dashed border-slate-300/70 pt-2">
                  <span className="font-medium text-blue-700">{t("Booked Since")}</span>
                  <span className="font-semibold text-blue-700">{formatDuration(now - createdTs)}</span>
                </p>
              </div>

              {isDriverCancelWindowExpired && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {t("Cancel available only within 9 hours for driver bookings.")}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/45 bg-gradient-to-r from-emerald-100/55 to-lime-100/50 p-4 backdrop-blur-lg ring-1 ring-white/30">
            {(booking.status === "confirmed" || booking.status === "started") && listingData ? (
              <DriverTracking booking={booking} />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-white/50 bg-white/40 px-5 text-center backdrop-blur-md">
                <p className="text-sm text-slate-600">{t("Tracking will start once your booking is confirmed.")}</p>
              </div>
            )}
          </div>
        </article>
      );
    })}
            </div>
          )}
        </section>
      </div>
    </div>
  );

}

export default MyBookings;
