import { useEffect, useMemo, useState } from "react";
import { FiDroplet, FiFilter, FiPackage, FiSearch, FiShoppingCart, FiTool, FiTrendingUp } from "react-icons/fi";
import { createMarketOrder, getMarketItems, getMarketPrices, getMyMarketOrders } from "@/services/marketService";
import { useTranslation } from "react-i18next";
import SuccessLottieOverlay from "@/components/common/SuccessLottieOverlay";

const fallbackInventory = [
  {
    id: "fert-urea",
    category: "fertilizer",
    name: "Urea 46% N",
    image:
      "https://images.unsplash.com/photo-1585314062604-1a357de8b000?auto=format&fit=crop&w=900&q=80",
    price: 299,
    unit: "50 kg bag",
    brand: "IFFCO",
    stock: "In stock",
    rating: 4.5,
    bestFor: "Wheat, Paddy",
    delivery: "Delivery in 2 days",
  },
  {
    id: "fert-dap",
    category: "fertilizer",
    name: "DAP 18-46",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
    price: 1350,
    unit: "50 kg bag",
    brand: "Coromandel",
    stock: "In stock",
    rating: 4.6,
    bestFor: "Cotton, Maize",
    delivery: "Delivery in 3 days",
  },
  {
    id: "fert-potash",
    category: "fertilizer",
    name: "MOP Potash",
    image:
      "https://images.unsplash.com/photo-1592982537447-6f2a6a0d5b93?auto=format&fit=crop&w=900&q=80",
    price: 980,
    unit: "50 kg bag",
    brand: "IPL",
    stock: "Low stock",
    rating: 4.2,
    bestFor: "Sugarcane, Pulses",
    delivery: "Delivery in 2 days",
  },
  {
    id: "eq-sprayer",
    category: "equipment",
    name: "Power Sprayer 20L",
    image:
      "https://images.unsplash.com/photo-1625768372444-16f6c68f0f13?auto=format&fit=crop&w=900&q=80",
    price: 3499,
    unit: "per unit",
    brand: "KisanPro",
    stock: "In stock",
    rating: 4.3,
    bestFor: "Pesticide spraying",
    delivery: "Delivery in 1 day",
  },
  {
    id: "eq-seed-drill",
    category: "equipment",
    name: "Mini Seed Drill",
    image:
      "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?auto=format&fit=crop&w=900&q=80",
    price: 8999,
    unit: "per unit",
    brand: "AgroTech",
    stock: "In stock",
    rating: 4.4,
    bestFor: "Line sowing",
    delivery: "Delivery in 4 days",
  },
  {
    id: "eq-rotavator",
    category: "equipment",
    name: "Rotavator Blade Set",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=900&q=80",
    price: 2650,
    unit: "set",
    brand: "FieldGear",
    stock: "Low stock",
    rating: 4.1,
    bestFor: "Soil preparation",
    delivery: "Delivery in 2 days",
  },
];

function CategoryChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
        active
          ? "bg-[#F57C00] text-white shadow-sm"
          : "bg-white border border-green-200 text-green-800 hover:bg-green-50"
      }`}
    >
      {children}
    </button>
  );
}

function FarmerMarket() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderType, setOrderType] = useState("purchase");
  const [rentalDuration, setRentalDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [marketPrices, setMarketPrices] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (query.trim()) params.query = query.trim();
        if (category !== "all") params.category = category;

        const res = await getMarketItems(params);
        setItems(Array.isArray(res.items) ? res.items : []);
      } catch (err) {
        setItems([]);
        setError(err.response?.data?.error || t("Unable to load market items. Showing demo data."));
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [query, category]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await getMyMarketOrders();
        setOrderHistory(Array.isArray(res.orders) ? res.orders : []);
      } catch (_) {
        setOrderHistory([]);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await getMarketPrices();
        if (res.success && res.data) setMarketPrices(res.data);
      } catch (_) {
        // prices are nice-to-have; silently fail
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      id: item._id,
      stock: item.stockQty > 20 ? "In stock" : item.stockQty > 0 ? "Low stock" : "Out of stock",
      rating: item.rating ?? 4.3,
      delivery: item.meta?.delivery || "Delivery in 2-4 days",
      rentalAvailable: Boolean(item.rentalAvailable),
      rentalPrice: Number(item.rentalPrice || 0),
      rentalUnit: item.rentalUnit || "day",
      minimumRentalPeriod: Number(item.minimumRentalPeriod || 1),
    }));
  }, [items]);

  const openBuyModal = (item) => {
    setSelectedItem(item);
    setPaymentMethod("");
    const canRent = item.category === "equipment" && item.rentalAvailable;
    setOrderType(canRent ? "rental" : "purchase");
    setRentalDuration(Math.max(1, Number(item.minimumRentalPeriod || 1)));
  };

  const closeBuyModal = () => {
    setSelectedItem(null);
    setPaymentMethod("");
    setOrderType("purchase");
    setRentalDuration(1);
  };

  const selectedTotal = useMemo(() => {
    if (!selectedItem) return 0;
    if (orderType === "rental") {
      return (selectedItem.rentalPrice || 0) * Math.max(1, Number(rentalDuration) || 1);
    }
    return selectedItem.price || 0;
  }, [orderType, rentalDuration, selectedItem]);

  const confirmPurchase = async () => {
    if (!paymentMethod || !selectedItem) return;

    try {
      setBuying(true);
      if (!selectedItem._id && !selectedItem.id) {
        alert(t("Demo item selected. Connect backend item for real purchase."));
        return;
      }

      await createMarketOrder({
        itemId: selectedItem._id || selectedItem.id,
        quantity: 1,
        paymentMethod: paymentMethod.toLowerCase(),
        orderType,
        rentalDuration: orderType === "rental" ? rentalDuration : undefined,
      });

      try {
        const historyRes = await getMyMarketOrders();
        setOrderHistory(Array.isArray(historyRes.orders) ? historyRes.orders : []);
      } catch (_) {}

      const msg =
        orderType === "rental"
          ? `${selectedItem.name} rented for ${rentalDuration} ${selectedItem.rentalUnit} via ${paymentMethod}`
          : `${selectedItem.name} ordered via ${paymentMethod} payment`;
      closeBuyModal();
      setOrderSuccessMsg(msg);
      setShowOrderSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || t("Failed to place order"));
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 bg-[radial-gradient(circle_at_top,#F5F5DC_0%,#D9F99D_45%,#ffffff_100%)]">
      {showOrderSuccess && (
        <SuccessLottieOverlay
          message={orderSuccessMsg || t("Order Placed!")}
          onClose={() => setShowOrderSuccess(false)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Live Mandi Prices */}
        {marketPrices && Object.keys(marketPrices.prices || {}).length > 0 && (
          <div className="rounded-2xl bg-white border border-green-200 shadow-sm px-5 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FiTrendingUp className="text-green-700" />
                <span className="text-sm font-bold text-[#1f5f2c]">Live Mandi Prices</span>
                {marketPrices.fetchedAt && (
                  <span className="text-xs text-[#6d8a72]">
                    · {new Date(marketPrices.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 capitalize">
                {marketPrices.source === "stub" ? "Demo Data" : marketPrices.source}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(marketPrices.prices).map(([crop, price]) => (
                <div
                  key={crop}
                  className="flex items-center gap-1.5 rounded-xl border border-orange-100 bg-[#fff7ed] px-3 py-2"
                >
                  <span className="text-sm font-semibold text-[#1f3f28]">{crop}</span>
                  <span className="text-sm font-bold text-[#c46800]">
                    ₹{Number(price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-[#8a6a42]">/qtl</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {orderHistory.length > 0 && (
          <div className="rounded-2xl bg-white border border-green-200 shadow-sm p-5">
            <h2 className="text-lg font-bold text-[#1f5f2c]">{t("Recent Purchases")}</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {orderHistory.slice(0, 4).map((order) => (
                <div key={order._id} className="rounded-xl border border-green-100 bg-green-50/50 p-3">
                  <p className="font-semibold text-[#294f32]">{order.itemId?.name || t("Item")}</p>
                  <p className="text-xs text-[#4e6f55] mt-0.5">
                    {t("Qty")}: {order.quantity} • {order.paymentMethod?.toUpperCase()} • Rs {order.totalAmount}
                  </p>
                  <p className="text-xs text-[#4e6f55] mt-1">
                    {order.orderType === "rental"
                      ? `Rental${order.rentalDuration ? ` • ${order.rentalDuration} ${order.rentalUnit}` : ""}`
                      : "Purchase"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-white/95 border border-green-200 shadow-md p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1f5f2c]">{t("Farmer Market")}</h1>
              <p className="text-[#3b5f41] mt-1">{t("Buy fertilizers and equipment needed for your farm.")}</p>
              {error && <p className="text-xs text-[#b85f00] mt-1">{error}</p>}
            </div>
            <div className="bg-[#F57C00]/10 text-[#b85f00] border border-[#F57C00]/25 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <FiShoppingCart />
              {filteredItems.length} {t("items")}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-[#f8fbf5] border border-green-200 rounded-xl px-4 py-3">
              <FiSearch className="text-green-700" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search by name, brand, crop use")}
                className="w-full bg-transparent outline-none text-[#27442f] placeholder:text-[#6d8a72]"
              />
            </div>

            <div className="flex items-center gap-3 bg-[#f8fbf5] border border-green-200 rounded-xl px-4 py-3">
              <FiFilter className="text-green-700" />
              <div className="flex flex-wrap gap-2">
                <CategoryChip active={category === "all"} onClick={() => setCategory("all")}>
                  {t("All")}
                </CategoryChip>
                <CategoryChip active={category === "fertilizer"} onClick={() => setCategory("fertilizer")}>
                  {t("Fertilizers")}
                </CategoryChip>
                <CategoryChip active={category === "equipment"} onClick={() => setCategory("equipment")}>
                  {t("Equipment")}
                </CategoryChip>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white border border-green-200 p-10 text-center text-[#516b56]">
            {t("Loading market items...")}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-white border border-green-200 p-10 text-center text-[#516b56]">
            {t("No items found. Try another search or category.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const isFertilizer = item.category === "fertilizer";
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-green-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition p-5"
                >
                  <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-40">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {isFertilizer ? <FiDroplet className="text-emerald-700" /> : <FiTool className="text-[#F57C00]" />}
                      <span className={isFertilizer ? "text-emerald-800" : "text-[#b85f00]"}>
                        {isFertilizer ? t("Fertilizer") : t("Equipment")}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{item.stock}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1f3f28] mt-4">{item.name}</h3>
                  <p className="text-sm text-[#5f7a65] mt-1">{t("Brand")}: {item.brand}</p>

                  <div className="mt-4 p-3 rounded-xl bg-[#fff7ed] border border-[#fed7aa]">
                    <p className="text-sm text-[#8a5a22]">{t("Price")}</p>
                    <p className="text-2xl font-bold text-[#c46800]">Rs {item.price.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-[#8a6f52] mt-0.5">{item.unit}</p>
                    {item.category === "equipment" && item.rentalAvailable ? (
                      <p className="mt-2 text-xs font-semibold text-green-700">
                        Rent: Rs {item.rentalPrice.toLocaleString("en-IN")} / {item.rentalUnit}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm text-[#33523b]">
                    <p className="flex items-center gap-2">
                      <FiPackage className="text-green-700" />
                      {t("Best for")}: {item.bestFor}
                    </p>
                    <p>{t("Rating")}: {item.rating} / 5</p>
                    <p>{item.delivery}</p>
                    <p className="text-xs text-[#5f7a65]">{t("Payment")}: {t("Online and Offline available")}</p>
                    {item.category === "equipment" && item.rentalAvailable ? (
                      <p className="text-xs text-green-700">Rental available from {item.minimumRentalPeriod} {item.rentalUnit}</p>
                    ) : null}
                  </div>

                  <button
                    className="mt-5 w-full py-2.5 rounded-xl bg-[#F57C00] hover:bg-[#d86f0a] text-white font-semibold transition"
                    type="button"
                    onClick={() => openBuyModal(item)}
                  >
                    {t("Buy Now")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#1f3f28]">{t("Buy")} {selectedItem.name}</h2>
            <p className="text-sm text-[#5f7a65] mt-1">
              {orderType === "rental"
                ? `${t("Rental Price")}: Rs ${selectedItem.rentalPrice.toLocaleString("en-IN")} / ${selectedItem.rentalUnit}`
                : `${t("Price")}: Rs ${selectedItem.price.toLocaleString("en-IN")} (${selectedItem.unit})`}
            </p>

            {selectedItem.category === "equipment" && selectedItem.rentalAvailable ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-[#27442f]">Choose order type</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType("purchase")}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      orderType === "purchase"
                        ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200]"
                        : "border-green-200 hover:bg-green-50"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("rental")}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      orderType === "rental"
                        ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200]"
                        : "border-green-200 hover:bg-green-50"
                    }`}
                  >
                    Rent
                  </button>
                </div>

                {orderType === "rental" && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <label className="block text-sm font-semibold text-[#27442f] mb-2">
                      Rental duration ({selectedItem.rentalUnit})
                    </label>
                    <input
                      type="number"
                      min={selectedItem.minimumRentalPeriod || 1}
                      value={rentalDuration}
                      onChange={(e) => setRentalDuration(Math.max(selectedItem.minimumRentalPeriod || 1, Number(e.target.value) || 1))}
                      className="w-full rounded-lg border border-green-200 px-3 py-2 outline-none"
                    />
                    <p className="mt-2 text-xs text-[#47624e]">
                      Minimum rental: {selectedItem.minimumRentalPeriod} {selectedItem.rentalUnit}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold text-[#27442f]">{t("Select payment method")}</p>

              <button
                type="button"
                onClick={() => setPaymentMethod("Online")}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  paymentMethod === "Online"
                    ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200]"
                    : "border-green-200 hover:bg-green-50"
                }`}
              >
                {t("Online Payment (UPI / Card / Netbanking)")}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Offline")}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  paymentMethod === "Offline"
                    ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200]"
                    : "border-green-200 hover:bg-green-50"
                }`}
              >
                {t("Offline Payment (Cash on Delivery)")}
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-xs text-[#8a5a22]">Order Summary</p>
              <p className="text-lg font-bold text-[#9a5200]">Rs {selectedTotal.toLocaleString("en-IN")}</p>
              <p className="text-xs text-[#8a6f52] mt-1">
                {orderType === "rental"
                  ? `Rental for ${rentalDuration} ${selectedItem.rentalUnit}`
                  : "One-time purchase"}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeBuyModal}
                className="flex-1 rounded-xl border border-green-200 py-2.5 font-semibold text-[#2d4a35] hover:bg-green-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                disabled={!paymentMethod}
                onClick={confirmPurchase}
                className="flex-1 rounded-xl bg-[#F57C00] py-2.5 font-semibold text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {buying ? t("Processing...") : orderType === "rental" ? "Confirm Rental" : t("Confirm Buy")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerMarket;
