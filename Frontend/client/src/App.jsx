import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ProviderHome from  "./components/Provider/ProviderHome";
import ProtectedRoute from "./components/common/ProtectedRoute";
import WeatherCard from "./components/common/WeatherCard";
import Layout from "./components/common/Layout";

import DashboardRouter from "./pages/DashboardRouter";
import Profile from "./components/common/Profile";
import FarmerPayment from "./components/farmer/FarmerPayment";
import MyBookings from "./components/farmer/MyBookings";

import FarmerForum from "./components/farmer/FarmerForum";
import FarmerMarket from "./components/farmer/FarmerMarket";
import FarmerNews from "./components/farmer/FarmerNews";
import SearchResults from "./pages/SearchResults";
import MyListingsPage from "./components/Provider/MyListingsPage";

import MyListings from "./pages/MyListings";
import ProviderPaymentDashboard from "./components/Provider/ProviderPaymentDashboard";
import ProviderBookings from "./components/Provider/ProviderBookings";
import FarmerCard from "./components/Provider/FarmerCard";
import WomenEmpowermentSchemes from "./components/labour/WomenEmpowermentSchemes";

import ListingDashboard from "./components/Provider/ListingDashboard";

import FarmerHome from  "./components/farmer/FarmerHome";
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/payment/:bookingId" element={<FarmerPayment />} />
      <Route path="/FarmerPayment" element={<FarmerPayment />} />
      <Route path="/FarmerForum" element={<FarmerForum />} />
      <Route path="/farmer-market" element={<FarmerMarket />} />
      <Route path="/farmer-news" element={<FarmerNews />} />
      <Route path="/ListingDashboard" element={<ListingDashboard />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/MyListings" element={<MyListings />} />
      <Route path="/MyListingsPage" element={<MyListingsPage />} />
      <Route path="/FarmerCard" element={<FarmerCard />} />
      <Route path="/WeatherCard" element={<WeatherCard />} />

<Route path="/ProviderPaymentDashboard" element={<ProviderPaymentDashboard />} />
<Route path="/provider-bookings" element={<ProviderBookings />} />
<Route path="/labour-women-schemes" element={<WomenEmpowermentSchemes />} />

<Route path="/listing/edit/:id" element={<ListingDashboard />} />


      <Route path="/register" element={<Register />} />
           <Route path="/dashboard" element={<DashboardRouter />} />

        <Route
          path="/FarmerHome"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <FarmerHome />
            </ProtectedRoute>
          }
        />
<Route path="/my-bookings" element={<MyBookings />} />


<Route
          path="/ProviderHome"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderHome />
            </ProtectedRoute>
          }
        />



        {/* <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        /> */}

      </Route>

    </Routes>
  );
}

export default App;
