import MyListings from "../../pages/MyListings";
import ListingDashboard from "./ListingDashboard";

const MyListingsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <ListingDashboard/>   {/* component 1 */}
      <MyListings />      {/* component 2 */}
    </div>
  );
};

export default MyListingsPage;
