import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function FarmerQuickNav() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    navigate(`/search?query=${query}`);
  };

  return (
    <div
      className="
        w-full
        bg-[#A8DF8E]
        rounded-2xl
        shadow-md shadow-black/5
        border border-black/10
        p-6
        space-y-6
      "
    >
      {/* 🔍 Search Bar */}
      <div className="relative w-full">
        <form
          onSubmit={handleSearch}
          className="w-full flex items-center bg-gray-50 border border-black/10 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-orange-400 transition"
        >
          <FiSearch className="text-gray-500 text-lg mr-3" />

          <input
            type="text"
            placeholder="Search for labour, drivers, or equipment..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />

          {/* <button
            type="submit"
            className="ml-4 px-5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold"
          >
            Search
          </button> */}
        </form>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
onClick={() =>
    navigate("/search?providerRole=labour&available=true")
  }          className="
            flex-1 flex items-center justify-center gap-3
            py-3 rounded-xl font-semibold text-black
            bg-[#F57C00]
            hover:from-orange-700 hover:to-amber-700
            transition-all duration-300
            shadow-md shadow-orange-600/30
            hover:shadow-lg hover:-translate-y-0.5
          "
        >
          Book Labour
        </button>

        {/* Farmer Forum */}
        <button
          onClick={() => navigate("/FarmerForum")}
          className="
            flex-1 flex items-center justify-center gap-3
            py-3 rounded-xl font-semibold text-black
            bg-green-700
            shadow-md
          "
        >
          Ask Farming Help
        </button>

        {/* <button
          onClick={() => navigate("/farmer-market")}
          className="
            flex-1 flex items-center justify-center gap-3
            py-3 rounded-xl font-semibold text-black
            bg-[#E7B10A]
            hover:bg-[#d8a109]
            transition-all duration-300
            shadow-md shadow-yellow-600/30
            hover:shadow-lg hover:-translate-y-0.5
          "
        >
          Buy Inputs
        </button> */}

        {/* <button
          onClick={() => navigate("/farmer-news")}
          className="
            flex-1 flex items-center justify-center gap-3
            py-3 rounded-xl font-semibold text-black
            bg-[#B7E4C7]
            hover:bg-[#a5d9b7]
            transition-all duration-300
            shadow-md shadow-green-600/20
            hover:shadow-lg hover:-translate-y-0.5
          "
        >
          Success Stories
        </button> */}

        {/* Book Driver */}
        <button
          onClick={() => navigate("/search?providerRole=driver&available=true")
}
          className="
            flex-1 flex items-center justify-center gap-3
            py-3 rounded-xl font-semibold text-black
            bg-[#F57C00]
            hover:from-orange-600 hover:to-yellow-600
            transition-all duration-300
            shadow-md shadow-orange-500/30
            hover:shadow-lg hover:-translate-y-0.5
          "
        >
          Book Driver
        </button>
      </div>
    </div>
  );
}

export default FarmerQuickNav;
