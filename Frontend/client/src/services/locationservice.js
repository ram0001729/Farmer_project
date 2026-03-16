const buildLocationName = (address = {}) => {
  const parts = [
    address.suburb,
    address.village,
    address.town,
    address.city,
    address.county,
    address.state_district,
    address.state,
  ].filter(Boolean);

  return [...new Set(parts)].slice(0, 3).join(", ");
};

const reverseGeocodeCache = new Map();

export const getLocationNameFromCoordinates = async (latitude, longitude) => {
  const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      reverseGeocodeCache.set(cacheKey, "");
      return "";
    }

    const data = await response.json();
    const locationName = buildLocationName(data.address) || data.display_name || "";
    reverseGeocodeCache.set(cacheKey, locationName);
    return locationName;
  } catch {
    reverseGeocodeCache.set(cacheKey, "");
    return "";
  }
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        const locationName = await getLocationNameFromCoordinates(latitude, longitude);

        resolve({
          type: "Point",
          coordinates: [longitude, latitude],
          locationName,
        });
      },
      (error) => reject(error)
    );
  });
};
