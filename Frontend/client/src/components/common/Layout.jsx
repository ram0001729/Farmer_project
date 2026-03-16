import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";



function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const { isLoggedIn } = useAuth();

  // Open sidebar on route change if logged in
  useEffect(() => {
    if (!isLandingPage && isLoggedIn) {
      setIsOpen(true);
    }
  }, [location.pathname, isLoggedIn, isLandingPage]);

  const handleSidebarLogout = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F2E3BB]">
      {!isLandingPage && (
        <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} onLogout={handleSidebarLogout} />
      )}

      <div
        className={`flex-1 transition-all duration-500 ease-in-out
  ${isLandingPage ? "ml-0" : isOpen ? "ml-2" : "ml-12"}`}
      >
        <Navbar />

        <main className="px-3 pt-6 pb-10">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default Layout;