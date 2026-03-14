import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Wallet, CheckCircle, History, AlertCircle, Loader2, Banknote, Smartphone } from "lucide-react";
import { createOrder, verifyPayment, markPaymentFailed, getMyPayments, getPaymentConfig, initiatePayment } from "@/services/paymentService";
import { getBookingById } from "@/services/bookingService";
import { useTranslation } from "react-i18next";
import SuccessLottieOverlay from "@/components/common/SuccessLottieOverlay";

const PROVIDER_ROLE_LABELS = {
  labour: "Labour",
  driver: "Driver",
  equipment_provider: "Equipment",
};

export default function FarmerPayment() {
  const { t } = useTranslation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState(null);
  const [methodFilter, setMethodFilter] = useState("All");
  const [providerFilter, setProviderFilter] = useState("All");
  const [showSuccess, setShowSuccess] = useState(false);
  const [offlineLoading, setOfflineLoading] = useState(false);

  const today = new Date().toDateString();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const todayExpense = paymentHistory
    .filter((p) => p.status === "success")
    .reduce((sum, p) => (new Date(p.createdAt).toDateString() === today ? sum + (p.amount || 0) : sum), 0);

  const monthExpense = paymentHistory
    .filter((p) => p.status === "success")
    .reduce((sum, p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear ? sum + (p.amount || 0) : sum;
    }, 0);

  const filteredHistory = paymentHistory.filter((p) => {
    const isOnline = p.method === "online_payment";
    const isOffline = p.method === "offline_payment";
    const methodMatch = methodFilter === "All" || (methodFilter === "Online" && isOnline) || (methodFilter === "Offline" && isOffline);
    const providerRole = p.bookingId?.listingId?.providerRole;
    const providerLabel = providerRole ? PROVIDER_ROLE_LABELS[providerRole] : null;
    const providerMatch = providerFilter === "All" || providerLabel === providerFilter;
    return methodMatch && providerMatch;
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [configRes, historyRes] = await Promise.all([
          getPaymentConfig(),
          getMyPayments(),
        ]);

        const key = configRes.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY;
        setRazorpayKey(key);

        if (historyRes.payments) {
          setPaymentHistory(historyRes.payments);
        }

        if (bookingId) {
          const b = await getBookingById(bookingId);
          setBooking(b);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || t("Failed to load"));
        if (bookingId) {
          const errMsg = err.response?.data?.error || "";
          if (errMsg.includes("not found") || errMsg.includes("Not authorized")) {
            setBooking(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  const handlePayNow = async () => {
    if (!bookingId || !booking) return;

    const key = razorpayKey || import.meta.env.VITE_RAZORPAY_KEY;
    if (!key) {
      alert(t("Payment gateway not configured. Add VITE_RAZORPAY_KEY to .env or configure Razorpay keys on server."));
      return;
    }

    setPayLoading(true);
    setError(null);

    try {
      const data = await createOrder(bookingId);

      const options = {
        key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "Farmly",
        description: `${t("Payment for")} ${booking.listingId?.title || t("booking")}`,

        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBooking((prev) => (prev ? { ...prev, status: "confirmed", paymentStatus: "paid" } : prev));
            const { payments } = await getMyPayments();
            setPaymentHistory(payments || []);
            // Show success animation; onClose will navigate
            setShowSuccess(true);
          } catch (err) {
            alert(err.response?.data?.error || t("Payment verification failed"));
          }
        },

        modal: {
          ondismiss: async function () {
            setPayLoading(false);
            if (data.paymentId) {
              try {
                await markPaymentFailed(data.paymentId, { reason: "User closed payment modal" });
              } catch (_) {}
            }
          },
        },

        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response) => {
        setPayLoading(false);
        if (data.paymentId) {
          try {
            await markPaymentFailed(data.paymentId, { razorpay_error: response.error });
          } catch (_) {}
        }
        alert(response.error?.description || t("Payment failed"));
      });

      rzp.open();
    } catch (err) {
      setPayLoading(false);
      const msg = err.response?.data?.error || err.message || t("Payment error");
      setError(msg);
      alert(msg);
    }
  };

  const amount = booking?.price ?? 0;
  const isPending = booking?.status === "pending" && booking?.paymentType === "online";
  const isOfflinePending = booking?.status === "pending" && booking?.paymentType === "offline";

  const handleOfflineConfirm = async () => {
    if (!bookingId || !booking) return;
    setOfflineLoading(true);
    setError(null);
    try {
      await initiatePayment({ bookingId, amount: booking.price, method: "offline_payment" });
      setBooking((prev) => (prev ? { ...prev, status: "confirmed" } : prev));
      const { payments } = await getMyPayments();
      setPaymentHistory(payments || []);
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || t("Failed to record offline payment"));
    } finally {
      setOfflineLoading(false);
    }
  };

  const serviceLabel = booking?.listingId?.providerRole
    ? t(PROVIDER_ROLE_LABELS[booking.listingId.providerRole] || booking.listingId.providerRole)
    : t("Service");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-gray-600">{t("Loading...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      {showSuccess && (
        <SuccessLottieOverlay
          message={t("Payment Successful!")}
          onClose={() => {
            setShowSuccess(false);
            navigate("/my-bookings");
          }}
        />
      )}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: Payment Form (only when bookingId present and pending) */}
        <div className="md:col-span-2 rounded-3xl shadow-xl bg-white p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-700">{t("Payment")}</h1>
            <p className="text-sm text-gray-500">{t("Pay securely for your service")}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              <AlertCircle className="shrink-0" />
              {error}
            </div>
          )}

          {bookingId && !booking && (
            <div className="text-center py-8">
              <p className="text-gray-600">{t("Booking not found or you don't have access.")}</p>
              <button
                onClick={() => navigate("/my-bookings")}
                className="mt-4 text-green-600 font-medium hover:underline"
              >
                {t("Back to My Bookings")}
              </button>
            </div>
          )}

          {bookingId && booking && (
            <>
              <div className="bg-green-100 rounded-2xl p-4 text-center">
                <p className="text-sm text-green-800">{serviceLabel} • {booking.listingId?.title || t("Booking")}</p>
                <h2 className="text-3xl font-bold text-green-700">₹{amount.toLocaleString("en-IN")}</h2>
              </div>

              {/* Payment method section: Online & Offline */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">{t("Payment method")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center border-2 rounded-xl p-3 border-green-300 bg-green-50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-green-600" />
                      <span className="font-medium">{t("Online")}</span>
                    </div>
                    <CheckCircle className="text-green-600" />
                  </div>
                  <div className="flex justify-between items-center border rounded-xl p-3 border-gray-200 bg-gray-50 opacity-75">
                    <div className="flex items-center gap-3">
                      <Banknote className="text-gray-500" />
                      <span className="font-medium text-gray-500">{t("Offline")}</span>
                    </div>
                    <span className="text-xs text-gray-400">{t("Pay at service")}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t("This booking is online payment. Pay via UPI / Card / Net Banking.")}</p>
              </div>

              <button
                onClick={handlePayNow}
                disabled={!isPending || !razorpayKey || payLoading}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg py-4 font-semibold flex items-center justify-center gap-2"
              >
                {payLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("Opening...")}
                  </>
                ) : !isPending ? (
                  `${t("Already")} ${booking.status === "confirmed" ? t("Paid") : booking.status}`
                ) : !razorpayKey ? (
                  t("Payment gateway not configured")
                ) : (
                  t("Pay Now")
                )}
              </button>

              {/* Offline payment confirmation */}
              {isOfflinePending && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Banknote className="text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800">{t("Offline (Cash) Payment")}</p>
                  </div>
                  <p className="text-xs text-amber-700">
                    {t("Pay ₹")} {amount.toLocaleString("en-IN")} {t("in cash directly to the provider, then confirm below.")}
                  </p>
                  <button
                    onClick={handleOfflineConfirm}
                    disabled={offlineLoading}
                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 font-semibold flex items-center justify-center gap-2"
                  >
                    {offlineLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("Recording...")}
                      </>
                    ) : (
                      t("I have paid in cash")
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {!bookingId && (
            <div className="text-center py-6 text-gray-500">
              <p>{t("Select a booking from My Bookings to pay, or view your payment history on the right.")}</p>
              <button
                onClick={() => navigate("/my-bookings")}
                className="mt-4 text-green-600 font-medium hover:underline"
              >
                {t("Go to My Bookings")}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: History - Online & Offline, Labour / Equipment / Driver */}
        <div className="rounded-3xl shadow-xl bg-white p-6 space-y-6 sticky top-6">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">{t("Today's Expense")}</p>
            <p className="text-xl font-bold text-green-700">₹{todayExpense.toLocaleString("en-IN")}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">{t("This Month")}</p>
            <p className="text-xl font-bold text-green-700">₹{monthExpense.toLocaleString("en-IN")}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="text-green-600" />
              <h3 className="font-semibold text-green-700">{t("Payment History")}</h3>
            </div>

            {/* Online / Offline filter */}
            <div className="flex gap-2 mb-3">
              {["All", "Online", "Offline"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    methodFilter === m
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t(m)}
                </button>
              ))}
            </div>

            {/* Labour / Equipment / Driver filter */}
            <div className="flex flex-wrap gap-2 mb-3">
              {["All", "Labour", "Equipment", "Driver"].map((p) => (
                <button
                  key={p}
                  onClick={() => setProviderFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    providerFilter === p
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t(p)}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredHistory.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">{t("No payments yet")}</p>
              ) : (
                filteredHistory.map((p) => {
                  const providerLabel = p.bookingId?.listingId?.providerRole
                    ? t(PROVIDER_ROLE_LABELS[p.bookingId.listingId.providerRole] || p.bookingId.listingId.providerRole)
                    : t("Service");
                  const isOnline = p.method === "online_payment";
                  return (
                    <div
                      key={p._id}
                      className={`border rounded-xl p-3 flex justify-between items-start ${
                        p.status === "success" ? "border-green-200" : "border-red-200"
                      }`}
                    >
                      <div>
                        <p className="font-medium">₹{(p.amount || 0).toLocaleString("en-IN")}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "--"}
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
                            {isOnline ? t("Online") : t("Offline")}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium shrink-0 ${
                          p.status === "success" ? "text-green-600" : p.status === "failed" ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
