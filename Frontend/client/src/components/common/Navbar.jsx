import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import WeatherCard from "@/components/common/WeatherCard";

import LanguageSwitcher from "@/components/common/LanguageSwitcher";
function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showWeather, setShowWeather] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

const [role, setRole] = useState(localStorage.getItem("role"));
const linkStyle = ({ isActive }) =>
  `px-4 py-2 rounded-xl transition-all duration-200 ${
    isActive
      ? "bg-[#F57C00] text-white shadow-md"
      : "text-[#D8C9B6] hover:bg-[#E79B63]/30"
  }`;

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
   <header className="sticky top-0.5 z-50 w-[95%] max-w-7xl mx-auto">
  <div className="bg-[#3FA21A]/80 backdrop-blur-xl border border-[#D8C9B6]/40 rounded-2xl shadow-xl px-6 py-3 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-orange-600 shadow overflow-hidden bg-white">
            <img
              src="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1768772826/farmer_jebfjw.png"
              alt="Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>
<span className="text-xl font-bold text-[#F57C00] tracking-tight">
  AgriLink
</span>



        </div>

        {/* Navigation */}
<nav className="flex flex-wrap items-center gap-2 text-sm font-medium">

    <>
       <NavLink to="/" className={({ isActive }) =>
        `px-4 py-2 rounded-xl transition ${
          isActive ? "bg-green-600 text-white" : "hover:bg-green-100"
        }`
      }>
        {t("Home")}
      </NavLink>

      <NavLink to="/search" className={({ isActive }) =>
        `px-4 py-2 rounded-xl transition ${
          isActive ? "bg-green-600 text-white" : "hover:bg-green-100"
        }`
      }>
        {t("Services")}
      </NavLink>

    

    <NavLink
        to="/login"
className="px-5 py-2 rounded-xl font-semibold bg-[#F57C00] text-white shadow-md transition-all duration-300 hover:bg-[#E79B63] hover:scale-105 active:scale-95"
      >
        {t("Login")}
      </NavLink>

<div className="flex items-center gap-4">
  <LanguageSwitcher />
</div>

      <NavLink
  to="/register"
className="px-5 py-2 rounded-xl font-semibold bg-[#F57C00] text-white shadow-md transition-all duration-300 hover:bg-[#E79B63] hover:scale-105 active:scale-95"
>
  {t("Get Started")}
</NavLink>

    </>

    <>



<div
  className="relative"
  onMouseEnter={() => setShowWeather(true)}
  onMouseLeave={() => setShowWeather(false)}
>
  <button className="px-4 py-2 rounded-xl hover:bg-green-100">
    {t("Weather")}
  </button>

  {showWeather && (
    <div className="absolute right-0 mt-3 z-50 w-72">
      <WeatherCard />
    </div>
  )}
</div>


    </>

</nav>

      </div>
    </header>
  );
}

export default Navbar;
