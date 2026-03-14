import React, { useEffect, useState } from "react";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getProviderEarnings } from "@/services/paymentService";

const PROVIDER_ROLE_LABELS = {
  labour: "Labour",
  driver: "Driver",
  equipment_provider: "Equipment",
};

export default function ProviderPaymentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [methodFilter, setMethodFilter] = useState("All"); // All | Online | Offline
  const [providerFilter, setProviderFilter] = useState("All"); // All | Labour | Equipment | Driver

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProviderEarnings();
        setData(res);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load earnings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#0F9B9C] animate-spin" />
          <p className="text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  const allPayments = data?.payments || [];
  const payments = allPayments.filter((p) => {
    const isOnline = p.method === "online_payment";
    const isOffline = p.method === "offline_payment";
    const methodMatch = methodFilter === "All" || (methodFilter === "Online" && isOnline) || (methodFilter === "Offline" && isOffline);
    const providerLabel = p.bookingId?.listingId?.providerRole
      ? PROVIDER_ROLE_LABELS[p.bookingId.listingId.providerRole]
      : null;
    const providerMatch = providerFilter === "All" || providerLabel === providerFilter;
    return methodMatch && providerMatch;
  });
  const stats = data?.stats || {
    totalEarnings: 0,
    pendingAmount: 0,
    thisMonthEarnings: 0,
    walletBalance: 0,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#072E33]">Provider Payments</h1>
          <button
            className="px-5 py-2 rounded-xl bg-[#0F9B9C] text-white font-semibold hover:bg-[#0C7075] transition cursor-not-allowed opacity-75"
            title="Coming soon"
            disabled
          >
            Withdraw Earnings
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700">
            <AlertCircle className="shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<IndianRupee />}
            label="Total Earnings"
            value={`₹${stats.totalEarnings.toLocaleString("en-IN")}`}
          />
          <StatCard icon={<Clock />} label="Pending" value={`₹${stats.pendingAmount.toLocaleString("en-IN")}`} />
          <StatCard
            icon={<TrendingUp />}
            label="This Month"
            value={`₹${stats.thisMonthEarnings.toLocaleString("en-IN")}`}
          />
          <StatCard
            icon={<Wallet />}
            label="Wallet Balance"
            value={`₹${stats.walletBalance.toLocaleString("en-IN")}`}
          />
        </div>

        {/* Payment History - Online & Offline, Labour / Equipment / Driver */}
        <div className="rounded-3xl bg-white shadow p-6">
          <h2 className="font-semibold text-[#072E33] mb-4">Payment History</h2>

          {/* Online / Offline filter */}
          <div className="flex gap-2 mb-3">
            {["All", "Online", "Offline"].map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  methodFilter === m ? "bg-[#0F9B9C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Labour / Equipment / Driver filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["All", "Labour", "Equipment", "Driver"].map((p) => (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  providerFilter === p ? "bg-[#0F9B9C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {payments.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">No payments received yet</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => {
                const providerLabel = p.bookingId?.listingId?.providerRole
                  ? PROVIDER_ROLE_LABELS[p.bookingId.listingId.providerRole] ||
                    p.bookingId.listingId.providerRole
                  : "Service";
                const isOnline = p.method === "online_payment";
                return (
                  <div
                    key={p._id}
                    className="flex justify-between items-center border rounded-xl p-4 hover:bg-gray-50/50 transition"
                  >
                    <div>
                      <p className="font-medium text-[#05161A]">
                        ₹{(p.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "--"} •{" "}
                        {p.payerId?.name || "Farmer"}
                      </p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {providerLabel}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isOnline ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`flex items-center gap-1 text-sm font-medium ${
                        p.status === "success"
                          ? "text-green-600"
                          : p.status === "initiated"
                          ? "text-yellow-600"
                          : p.status === "failed"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      <CheckCircle size={16} />
                      {p.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white shadow p-4">
      <div className="flex items-center gap-3">
        <div className="text-[#0F9B9C]">{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-[#05161A]">{value}</p>
        </div>
      </div>
    </div>
  );
}
