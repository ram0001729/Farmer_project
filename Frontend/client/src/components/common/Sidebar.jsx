import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

import {
  FiHome,
  FiCalendar,
  FiCreditCard,
  FiUser,
  FiBookOpen,
  FiShoppingBag,
  FiPlusCircle,
  FiHeart,
  FiLogOut,
} from "react-icons/fi";

function SidebarLink({ to, children, icon, isOpen }) {
  return (
    <NavLink
      to={to}
      title={!isOpen ? children : ""}
      className={({ isActive }) =>
        `flex items-center ${
          isOpen ? "gap-3 px-4 justify-start" : "justify-center"
        } py-3 rounded-xl transition-all
        ${
          isActive
            ? "bg-[#F57C00] text-white"
            : "text-white/80 hover:bg-[#F57C00] hover:text-white"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {isOpen && <span>{children}</span>}
    </NavLink>
  );
}

function SidebarAction({ onClick, children, icon, isOpen }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isOpen ? children : ""}
      className={`flex items-center w-full ${
        isOpen ? "gap-3 px-4 justify-start" : "justify-center"
      } py-3 rounded-xl transition-all text-white/80 hover:bg-[#F57C00] hover:text-white`}
    >
      <span className="text-lg">{icon}</span>
      {isOpen && <span>{children}</span>}
    </button>
  );
}


function Sidebar({ isOpen, toggleSidebar, onLogout }) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate("/login");
  };


  const isProvider = ["driver", "labour", "equipment_provider"].includes(role);
  const listingsLabel = role === "equipment_provider" ? "Manage Equipment" : "My Listings";

  return (
    <>
      {/* Hamburger */}
   {/* Hamburger */}
      

      {/* Sidebar */}

<aside
  className={`relative mt-16 h-screen bg-[#3FA21A]/80 text-white flex flex-col rounded-md transition-all duration-500 ${
    isOpen ? "w-56" : "w-10"
  }`}
>
   <button
  onClick={toggleSidebar}
  className="absolute top-3 -right-1 bg-green p-2 rounded-lg  flex flex-col justify-center items-center w-10 h-10"
>
  <span
    className={`block h-0.5 w-6 bg-white transition-all duration-300
    ${isOpen ? "rotate-45 translate-y-1.5" : ""}`}
  ></span>

  <span
    className={`block h-0.5 w-6 bg-white my-1 transition-all duration-300
    ${isOpen ? "opacity-0" : ""}`}
  ></span>

  <span
    className={`block h-0.5 w-6 bg-white transition-all duration-300
    ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
  ></span>
</button>

  {isOpen && (
    <div className="mt-14 px-3 pb-2">
      <div className="flex items-center gap-2.5 rounded-xl bg-white/10 border border-white/15 px-3 py-2">
        <div className="w-9 h-9 rounded-full border-2 border-orange-600 shadow overflow-hidden bg-white">
          <img
            src="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1768772826/farmer_jebfjw.png"
            alt="AgriLink Logo"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        <span className="text-lg font-bold text-[#F57C00] leading-none">AgriLink</span>
      </div>
    </div>
  )}

  <div className={`${isOpen ? "mt-2" : "mt-16"} flex flex-col gap-3`}>

        {/* FARMER MENU */}
        {role === "farmer" && (
          <>

            <SidebarLink to="/FarmerHome" icon={<FiHome />} isOpen={isOpen}>
              {t("Dashboard")}
            </SidebarLink>

            <SidebarLink to="/my-bookings" icon={<FiCalendar />} isOpen={isOpen}>
              {t("My Bookings")}
            </SidebarLink>
            <SidebarLink to="/FarmerPayment" icon={<FiCreditCard />}isOpen={isOpen}>
              {t("Payments")}
            </SidebarLink>
            <SidebarLink to="/farmer-market" icon={<FiShoppingBag />}isOpen={isOpen}>
              {t("Farmer Market")}
            </SidebarLink>
            <SidebarLink to="/farmer-news" icon={<FiBookOpen />}isOpen={isOpen}>
              {t("Success News")}
            </SidebarLink>
            <SidebarLink to="/Profile" icon={<FiUser />}isOpen={isOpen}>
              {t("Profile")}
            </SidebarLink>
            <SidebarAction onClick={handleLogout} icon={<FiLogOut />} isOpen={isOpen}>
              {t("Logout")}
            </SidebarAction>
          </>
        )}

        {/* PROVIDER MENU */}
        {isProvider && (
          <>

            <SidebarLink to="/ProviderHome" icon={<FiHome />}isOpen={isOpen}>
              {t("Dashboard")}
            </SidebarLink>

            <SidebarLink to="/MyListingsPage" icon={<FiPlusCircle />}isOpen={isOpen}>
              {t(listingsLabel)}
            </SidebarLink>
            {role !== "driver" && (
              <SidebarLink to="/provider-bookings" icon={<FiCalendar />} isOpen={isOpen}>
                {t("My Bookings")}
              </SidebarLink>
            )}
            <SidebarLink to="/ProviderPaymentDashboard" icon={<FiCreditCard />}isOpen={isOpen}>
              {t("Payments & Earnings")}
            </SidebarLink>
            {role === "labour" && (
              <SidebarLink to="/labour-women-schemes" icon={<FiHeart />} isOpen={isOpen}>
                {t("Women Schemes")}
              </SidebarLink>
            )}
            <SidebarLink to="/Profile" icon={<FiUser />} isOpen={isOpen}>
              {t("Profile")}
            </SidebarLink>
            <SidebarAction onClick={handleLogout} icon={<FiLogOut />} isOpen={isOpen}>
              {t("Logout")}
            </SidebarAction>
  
          </>

        )}
  </div>
      </aside>
    </>
  );
}

export default Sidebar;