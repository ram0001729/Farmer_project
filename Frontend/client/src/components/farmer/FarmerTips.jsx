import { useState, useEffect } from "react";
import { farmingTips } from "./farmingTips";

function FarmerTips() {
  const [tipIndex, setTipIndex] = useState(0);

  const basePrices = {
    Wheat: 2450,
    Rice: 2100,
    Maize: 1850,
    Cotton: 7200,
  };

  const [resourceIndex, setResourceIndex] = useState(1); // critical resource factor
  const [volatility, setVolatility] = useState(0.04); // 4% typical change per tick
  const [marketPrices, setMarketPrices] = useState(() =>
    Object.entries(basePrices).map(([crop, base]) => ({
      crop,
      price: `₹${base} / quintal`,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % farmingTips.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setResourceIndex((prev) => {
        const change = (Math.random() * 2 - 1) * volatility; // +/- volatility
        const next = Math.max(0.85, Math.min(1.15, prev + change));
        return next;
      });
    }, 4000); // refresh frequently to simulate volatility

    return () => clearInterval(interval);
  }, [volatility]);

  useEffect(() => {
    setMarketPrices(
      Object.entries(basePrices).map(([crop, base]) => {
        const adjusted = Math.max(0, Math.round(base * resourceIndex));
        return {
          crop,
          price: `₹${adjusted} / quintal`,
        };
      })
    );
  }, [resourceIndex]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      <div className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-green-100 
      border border-green-200 rounded-3xl shadow-xl p-10 flex items-center justify-between gap-14">

        {/* Decorative background */}
        <div className="absolute -top-12 -left-12 w-64 h-80 bg-green-200/40 rounded-full blur-3xl"></div>

        {/* LEFT SIDE → Farming Tips */}
        <div className="max-w-xl z-10">
          <h3 className="text-3xl font-bold text-green-800 mb-4">
            🌾 Better Farming Tips
          </h3>

          <p className="text-gray-800 text-lg font-semibold leading-relaxed transition-all duration-500">
            {farmingTips[tipIndex]}
          </p>
        </div>

        {/* CENTER → Farmer Image */}
        <img
          src="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1770308111/Indian_Farmer_Agriculture_Life_keqkby.jpg"
          alt="Farmer"
          className="w-44 h-44 object-cover rounded-2xl shadow-lg z-10"
        />

        {/* RIGHT SIDE → Market Prices */}
        <div className="flex flex-col gap-4 z-10">
          <div className="flex items-center justify-between px-6 py-3 bg-white rounded-2xl shadow-md border border-green-100">
            <div>
              <p className="text-xs text-gray-500">Fertilizer index</p>
              <p className="text-lg font-semibold text-gray-700">{(resourceIndex * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Volatility</p>
              <p className="text-lg font-semibold text-gray-700">{(volatility * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {marketPrices.map((item, index) => (
              <div
                key={index}
                className="bg-white px-6 py-4 rounded-2xl shadow-md border border-green-100"
              >
                <p className="text-lg font-semibold text-gray-700">
                  {item.crop}
                </p>

                <p className="text-green-700 font-bold text-lg">
                  {item.price}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default FarmerTips;