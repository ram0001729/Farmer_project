import { Navigate } from "react-router-dom";

function DashboardRouter() {
  const role = localStorage.getItem("role");

  if (!role) return <Navigate to="/login" />;

  switch (role) {
    case "farmer":
      return <Navigate to="/FarmerHome" />;
    case "driver":
    case "labour":
    case "equipment_provider":
      return <Navigate to="/ProviderHome" />;
    // case "admin":
    //   return <Navigate to="/dashboard/admin" />;
    default:
      return <Navigate to="/login" />;
  }
}

export default DashboardRouter;
