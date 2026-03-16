import FarmerQuickNav from "@/components/farmer/FarmerQuickNav";
import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";
import LabourCard from "@/components/farmer/LabourCard";
import { useEffect, useState } from "react";
import { getListing } from "../../services/listingService";
import FarmerTips from "@/components/farmer/FarmerTips";
import DriverTracking from "@/components/common/DriverTracking";

function FarmerHome() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const data = await getListing();
      setProviders(data);
      console.log(data)
    } catch (err) {
      console.error("Failed to fetch providers", err);
    }
  };



  return (
    <div className="min-h-screen ">
      {/* Top Navbar */}


      {/* Body Layout */}
      <div className="flex-1 ">
        {/* Sidebar */}
        {/* Main Content */}
        <main className="flex-1 py-1 px-8">
          <div className="max-w-6xl mx-auto space-y-12 ">
            
            {/* Quick Actions */}
            <FarmerQuickNav />

            


            {/* Drivers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Available Drivers
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {providers
    .filter((provider) => provider.providerRole === "driver")
    .map(provider => (
      <LabourCard
        key={provider._id}
        labour={provider}
      />
    ))}
</div>

            </section>
            {/* Labour */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                 Available Labour
              </h2>
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {providers
    .filter((provider) => provider.providerRole === "labour")
    .map(provider => (
      <LabourCard
        key={provider._id}
        labour={provider}
      />
    ))}
</div>

            </section>

            
            <FarmerTips />

          
          </div>
        </main>
      </div>
    </div>
  );
}

export default FarmerHome;
