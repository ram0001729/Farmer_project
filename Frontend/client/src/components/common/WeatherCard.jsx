import { useEffect, useState } from "react";
import { getCurrentWeather } from "../../services/weatherService";

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeatherByLocation(lat, lon) {
      try {
        const data = await getCurrentWeather(`${lat},${lon}`);
        setWeather(data);
      } catch (err) {
        setError("Unable to fetch weather");
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        () => {
          setError("Location permission denied");
        }
      );
    } else {
      setError("Geolocation not supported");
    }
  }, []);

  if (error) return <div>{error}</div>;
  if (!weather) return <div>Loading weather...</div>;

    return (
  <div className="w-full max-w-md mx-auto">
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-lg bg-green/240 border border-white/30 shadow-2xl">

      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 to-emerald-400/20 pointer-events-none"></div>

      <div className="relative z-10">

        {/* Location + Icon */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-black">
              {weather.location.name}
            </h3>
            <p className="text-sm text-black">
              {weather.location.region}, {weather.location.country}
            </p>
          </div>

       
        </div>

        {/* Temperature */}
        <div className="mt-6">
          <h1 className="text-5xl font-extrabold text-black">
            {weather.current.temp_c}°C
          </h1>
          <p className="text-lg font-medium text-black mt-1">
            {weather.current.condition.text}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-lm text-black">
          <div className="bg-white/50 p-3 rounded-xl">
            Wind
            <p className="font-semibold text-black">
              {weather.current.wind_kph} kph
            </p>
          </div>

          <div className="bg-white/50 p-3 rounded-xl">
             Humidity
            <p className="font-semibold text-black">
              {weather.current.humidity}%
            </p>
          </div>

          <div className="bg-white/50 p-3 rounded-xl">
           Feels Like
            <p className="font-semibold text-black">
              {weather.current.feelslike_c}°C
            </p>
          </div>

          <div className="bg-white/50 p-3 rounded-xl">
            UV Index
            <p className="font-semibold text-black">
              {weather.current.uv}
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
);
}