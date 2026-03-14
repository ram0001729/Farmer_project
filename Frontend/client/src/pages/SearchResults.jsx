import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { searchListings } from "../services/searchService";
import LabourCard from "@/components/farmer/LabourCard";
import { useAuth } from "@/context/AuthContext";
function SearchResults() {
  const [params] = useSearchParams();

  const query = params.get("query");
  const providerRole = params.get("providerRole");
  const available = params.get("available");

  const { role } = useAuth();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!role) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await searchListings({
          query,
          providerRole,
          available,
        });

        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
        setError("Search failed");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, providerRole, available, role]);

  if (loading) return <p className="p-6">Searching services...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {providerRole
          ? `Available ${providerRole}`
          : `Search results for "${query}"`}
      </h2>

      {results.length === 0 ? (
        <p>No matching services found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <LabourCard key={item._id} labour={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
