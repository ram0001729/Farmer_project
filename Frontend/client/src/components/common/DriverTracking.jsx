import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiCircle, FiMapPin, FiTruck } from "react-icons/fi";
import { getSingleListing } from "@/services/listingService";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon in Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function haversineDistance([lng1, lat1], [lng2, lat2]) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function interpolateCoords(start, end, progress) {
  if (!start || !end) return null;
  const t = clamp(progress, 0, 1);
  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
  ];
}

function formatCoords(coords) {
  if (!coords || coords.length !== 2) return "--";
  const [lng, lat] = coords;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

// [lng, lat] -> [lat, lng] for Leaflet
function toLatLng(coords) {
  if (!coords || coords.length !== 2) return null;
  return [coords[1], coords[0]];
}

// Rapido-style truck icon for driver (moves when location updates)
const driverIcon = new L.DivIcon({
  className: "driver-marker",
  html: `
    <div style="
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    ">🚚</div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Destination pin icon
const destinationIcon = new L.DivIcon({
  className: "destination-marker",
  html: `
    <div style="
      background: #dc2626;
      width: 32px; height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Fits map bounds to show both driver and destination
function FitBounds({ driverPos, destinationPos }) {
  const map = useMap();
  useEffect(() => {
    if (!driverPos || !destinationPos) return;
    const bounds = L.latLngBounds([driverPos, destinationPos]);
    map.fitBounds(bounds.pad(0.3));
  }, [map, driverPos, destinationPos]);
  return null;
}

function DriverTracking({ booking, listingId }) {
  const listingIdToFetch = booking?.listingId?._id || listingId;
  const destination = booking?.location?.coordinates;

  const [driverLocation, setDriverLocation] = useState(null);
  const [routeStartLocation, setRouteStartLocation] = useState(null);
  const [clockTick, setClockTick] = useState(Date.now());
  const [error, setError] = useState(null);

  // Keep time flowing so simulated progress updates even when GPS updates are slow.
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now());
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setDriverLocation(null);
    setRouteStartLocation(null);
    setError(null);
  }, [listingIdToFetch, booking?._id]);

  useEffect(() => {
    if (!driverLocation || !destination || routeStartLocation) return;
    setRouteStartLocation(driverLocation);
  }, [driverLocation, destination, routeStartLocation]);

  const initialDistanceKm = useMemo(() => {
    if (!routeStartLocation || !destination) return null;
    return haversineDistance(routeStartLocation, destination);
  }, [routeStartLocation, destination]);

  const liveDistanceKm = useMemo(() => {
    if (!driverLocation || !destination) return null;
    return haversineDistance(driverLocation, destination);
  }, [driverLocation, destination]);

  const liveProgress = useMemo(() => {
    if (initialDistanceKm === null || liveDistanceKm === null) return 0;
    if (initialDistanceKm < 0.05) return 0;
    return clamp(1 - liveDistanceKm / initialDistanceKm, 0, 1);
  }, [initialDistanceKm, liveDistanceKm]);

  const timeProgress = useMemo(() => {
    if (!booking) return 0;
    if (booking.status === "completed") return 1;
    if (booking.status !== "started" || !booking.startAt || !initialDistanceKm) return 0;

    const elapsedMin = (clockTick - new Date(booking.startAt).getTime()) / 60000;
    const speedKmh = 30;
    const totalMin = Math.max(2, (initialDistanceKm / speedKmh) * 60);

    return clamp(elapsedMin / totalMin, 0, 0.98);
  }, [booking, clockTick, initialDistanceKm]);

  const effectiveProgress = useMemo(() => {
    const byDistance =
      initialDistanceKm !== null &&
      initialDistanceKm > 0.2 &&
      liveDistanceKm !== null &&
      liveDistanceKm <= 0.1;
    if (booking?.status === "completed" || byDistance) return 1;
    return clamp(Math.max(liveProgress, timeProgress), 0, 0.99);
  }, [booking?.status, initialDistanceKm, liveDistanceKm, liveProgress, timeProgress]);

  const renderedDriverLocation = useMemo(() => {
    if (routeStartLocation && destination && initialDistanceKm !== null && initialDistanceKm >= 0.05) {
      return interpolateCoords(routeStartLocation, destination, effectiveProgress);
    }
    return driverLocation;
  }, [routeStartLocation, destination, initialDistanceKm, effectiveProgress, driverLocation]);

  const driverDistanceKm = useMemo(() => {
    if (!renderedDriverLocation || !destination) return null;
    return haversineDistance(renderedDriverLocation, destination);
  }, [renderedDriverLocation, destination]);

  const stage = useMemo(() => {
    const confirmed = !!booking;
    const started =
      booking?.status === "started" ||
      booking?.status === "completed" ||
      effectiveProgress >= 0.08;
    const onTheWay = started && effectiveProgress >= 0.2;
    const arrivingSoon = effectiveProgress >= 0.5 || (driverDistanceKm !== null && driverDistanceKm <= 1);
    const reached =
      booking?.status === "completed" ||
      effectiveProgress >= 0.98 ||
      (driverDistanceKm !== null && driverDistanceKm <= 0.1);

    return {
      confirmed,
      started,
      onTheWay,
      arrivingSoon,
      reached,
    };
  }, [booking, effectiveProgress, driverDistanceKm]);

  const etaMinutes = useMemo(() => {
    if (driverDistanceKm === null) return null;
    const speedKmh = 35;
    return Math.max(1, Math.round((driverDistanceKm / speedKmh) * 60));
  }, [driverDistanceKm]);




  const steps = [
    {
      title: "Booking confirmed",
      time: booking
        ? new Date(booking.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--",
      done: stage.confirmed,
    },
    {
      title: "Driver started",
      time:
        stage.started && booking?.startAt
          ? new Date(booking.startAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : stage.started
            ? "Started"
            : "--",
      done: stage.started,
    },
    {
      title: "On the way",
      time: driverDistanceKm !== null ? `${driverDistanceKm.toFixed(1)} km away` : "--",
      done: stage.onTheWay,
    },
    {
      title: "Arriving soon",
      time: stage.arrivingSoon ? "Almost there" : "--",
      done: stage.arrivingSoon,
    },
    {
      title: "Reached your farm",
      time: stage.reached ? "Now" : "--",
      done: stage.reached,
    },
  ];










  useEffect(() => {
    if (!listingIdToFetch) return;

    let isMounted = true;

    const fetchLocation = async () => {
      try {
        const listing = await getSingleListing(listingIdToFetch);
        const coords = listing?.location?.coordinates;
        if (isMounted && coords) {
          setDriverLocation(coords);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch driver location", err);
        setError("Unable to fetch tracking info");
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [listingIdToFetch]);

  const handleOpenLiveMap = () => {
    if (!driverLocation || !destination) return;
    const [dLng, dLat] = driverLocation;
    const [tLng, tLat] = destination;
    const url = `https://www.google.com/maps/dir/${dLat},${dLng}/${tLat},${tLng}`;
    window.open(url, "_blank");
  };

  const driverLatLng = toLatLng(renderedDriverLocation);
  const destinationLatLng = toLatLng(destination);
  const hasMapData = driverLatLng || destinationLatLng;
  const center = driverLatLng || destinationLatLng || [20.5937, 78.9629]; // India fallback

  const eta = etaMinutes ? `${etaMinutes} mins` : "--";

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-w-xl">
      {/* Rapido-style: Map on top with moving driver icon */}
      {hasMapData && (
        <div className="h-56 w-full rounded-t-2xl overflow-hidden bg-gray-100">
          <MapContainer
            center={center}
            zoom={12}
            className="h-full w-full rounded-t-2xl z-0"
            zoomControl={true}
            style={{ minHeight: 224 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {driverLatLng && (
              <Marker position={driverLatLng} icon={driverIcon}>
                <Popup>Driver (live)</Popup>
              </Marker>
            )}
            {driverLatLng && destinationLatLng && (
              <Polyline
                positions={[driverLatLng, destinationLatLng]}
                pathOptions={{ color: "#16a34a", weight: 4, opacity: 0.85, dashArray: "8, 8" }}
              />
            )}
            {destinationLatLng && (
              <Marker position={destinationLatLng} icon={destinationIcon}>
                <Popup>Your farm</Popup>
              </Marker>
            )}
            {driverLatLng && destinationLatLng && (
              <FitBounds driverPos={driverLatLng} destinationPos={destinationLatLng} />
            )}
          </MapContainer>
        </div>
      )}

      {/* Dashboard card: ETA, distance, steps (Rapido-style) */}
      <div className="p-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiTruck className="text-green-600 text-xl" />
            Driver Tracking
          </h3>
          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
            ETA {eta}
          </span>
        </div>

        {driverDistanceKm !== null && (
          <p className="text-gray-600 text-sm mb-4">
            Driver is <span className="font-semibold text-gray-800">{driverDistanceKm.toFixed(1)} km</span> away
          </p>
        )}

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <div className="rounded-xl bg-gray-50 p-3 mb-4 border border-gray-100">
          <p className="text-xs text-gray-500">Driver</p>
          <p className="text-sm font-medium text-gray-700">{formatCoords(renderedDriverLocation || driverLocation)}</p>
          <p className="text-xs text-gray-500 mt-1">Destination</p>
          <p className="text-sm font-medium text-gray-700">{formatCoords(destination)}</p>
        </div>

        {/* Step timeline */}
        <div className="relative pl-6 border-l-2 border-green-200 ml-1 space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="relative flex items-start gap-3">
              <div className="absolute -left-[29px] top-0.5 z-10">
                {step.done ? (
                  <FiCheckCircle className="text-green-600 text-lg bg-white rounded-full" />
                ) : index === steps.length - 1 ? (
                  <FiMapPin className="text-red-500 text-lg" />
                ) : (
                  <FiCircle className="text-gray-400 text-lg" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{step.title}</p>
                <p className="text-xs text-gray-500">{step.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-between items-center gap-3">
          <button
            disabled={!driverLocation || !destination}
            onClick={handleOpenLiveMap}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-medium shadow-sm"
          >
            Open in Google Maps
          </button>
          <p className="text-xs text-gray-500 shrink-0">Live location updates every 5s</p>
        </div>
      </div>
    </div>
  );
}

export default DriverTracking;
