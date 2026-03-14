export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          type: "Point",
          coordinates: [
            position.coords.longitude,
            position.coords.latitude,
          ],
        });
      },
      (error) => reject(error)
    );
  });
};
