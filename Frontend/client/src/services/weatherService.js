const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function getCurrentWeather(city) {
  const res = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
  );

  if (!res.ok) throw new Error("Failed to fetch weather");

  return res.json();
}
