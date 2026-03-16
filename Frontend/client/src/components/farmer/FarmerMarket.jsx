import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowDown, FiArrowUp, FiDroplet, FiFilter, FiMinus, FiPackage, FiRefreshCw, FiSearch, FiShoppingCart, FiTool, FiTrendingUp } from "react-icons/fi";
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

const CROP_SYMBOLS = {
  Wheat:      "🌾",
  Paddy:      "🌿",
  Rice:       "🍚",
  Maize:      "🌽",
  Cotton:     "🪴",
  Soybean:    "🫘",
  Groundnut:  "🥜",
  Mustard:    "🌻",
  Onion:      "🧅",
  Tomato:     "🍅",
};

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
  const [marketFilter, setMarketFilter] = useState("all"); // all | rent | sale
  const [orderType, setOrderType] = useState("purchase");
  const [rentalDuration, setRentalDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullAddress: "",
    villageTown: "",
    pincode: "",
    landmark: "",
  });
  const [orderHistory, setOrderHistory] = useState([]);
  const [marketPrices, setMarketPrices] = useState(null);
  const [pricesRefreshing, setPricesRefreshing] = useState(false);
  const prevPricesRef = useRef({});
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
      setPricesRefreshing(true);
      try {
        const res = await getMarketPrices();
        if (res.success && res.data) {
          // Capture previous prices before updating
          if (marketPrices?.prices) {
            prevPricesRef.current = { ...marketPrices.prices };
          } else if (res.data.previousPrices) {
            prevPricesRef.current = { ...res.data.previousPrices };
          }
          setMarketPrices(res.data);
        }
      } catch (_) {
        // prices are nice-to-have; silently fail
      } finally {
        setPricesRefreshing(false);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30_000); // refresh every 30s for liveness
    return () => clearInterval(interval);
  }, []);

  const filteredItems = useMemo(() => {
    let mapped = items.map((item) => ({
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
    if (marketFilter === "rent") {
      mapped = mapped.filter((item) => item.category === "equipment" && item.rentalAvailable);
    } else if (marketFilter === "sale") {
      mapped = mapped.filter((item) =>
        (item.category === "equipment" && !item.rentalAvailable) || item.category === "fertilizer"
      );
    }
    return mapped;
  }, [items, marketFilter]);

  const openBuyModal = (item) => {
    setSelectedItem(item);
    setPaymentMethod("");
    setDeliveryAddress({ fullAddress: "", villageTown: "", pincode: "", landmark: "" });
    const canRent = item.category === "equipment" && item.rentalAvailable;
    setOrderType(canRent ? "rental" : "purchase");
    setRentalDuration(Math.max(1, Number(item.minimumRentalPeriod || 1)));
  };

  const closeBuyModal = () => {
    setSelectedItem(null);
    setPaymentMethod("");
    setOrderType("purchase");
    setRentalDuration(1);
    setDeliveryAddress({ fullAddress: "", villageTown: "", pincode: "", landmark: "" });
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
        deliveryAddress,
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
                {/* Pulsing live dot */}
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  LIVE
                </span>
                {marketPrices.fetchedAt && (
                  <span className="text-xs text-[#6d8a72]">
                    Updated {new Date(marketPrices.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {pricesRefreshing && (
                  <FiRefreshCw className="text-green-500 text-sm animate-spin" />
                )}
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 capitalize">
                  {marketPrices.source === "stub" ? "Demo" : marketPrices.source === "live-sim" ? "Simulated Live" : marketPrices.source}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(marketPrices.prices).map(([crop, price]) => {
                const prev = prevPricesRef.current[crop];
                const diff = prev != null ? price - prev : 0;
                const pct  = prev != null && prev !== 0 ? ((diff / prev) * 100).toFixed(1) : null;
                const up   = diff > 0;
                const down = diff < 0;

                return (
                  <div
                    key={crop}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-500 ${
                      up   ? "border-emerald-200 bg-emerald-50" :
                      down ? "border-rose-200 bg-rose-50" :
                             "border-orange-100 bg-[#fff7ed]"
                    }`}
                  >
                    <span className="text-xl leading-none select-none">{CROP_SYMBOLS[crop] ?? "🌱"}</span>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{crop}</p>
                      <p className={`text-sm font-bold ${up ? "text-emerald-700" : down ? "text-rose-600" : "text-[#c46800]"}`}>
                        ₹{Number(price).toLocaleString("en-IN")}
                        <span className="text-[10px] font-normal text-gray-400 ml-0.5">/qtl</span>
                      </p>
                    </div>
                    {pct != null && diff !== 0 ? (
                      <span className={`flex items-center gap-0.5 text-[11px] font-bold rounded-full px-1.5 py-0.5 ${
                        up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
                      }`}>
                        {up ? <FiArrowUp className="text-[10px]" /> : <FiArrowDown className="text-[10px]" />}
                        {Math.abs(pct)}%
                      </span>
                    ) : (
                      diff === 0 && prev != null && (
                        <span className="flex items-center gap-0.5 text-[11px] font-bold rounded-full px-1.5 py-0.5 bg-gray-100 text-gray-400">
                          <FiMinus className="text-[10px]" />
                        </span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {orderHistory.length > 0 && (
          <div className="rounded-2xl bg-white border border-green-200 shadow-sm p-5">
            <h2 className="text-lg font-bold text-[#1f5f2c]">{t("Recent Purchases")}</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {orderHistory.slice(0, 4).map((order) => {
                const item = order.itemId;
                const isRental = order.orderType === "rental";
                return (
                  <div key={order._id} className="flex items-center gap-3 rounded-xl border border-green-100 bg-gradient-to-br from-white to-green-50/50 p-3 shadow-sm">
                    {/* Item image */}
                    <div className="shrink-0 h-16 w-16 rounded-xl overflow-hidden border border-green-100 bg-gray-100">
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Item"}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl">
                          {item?.category === "fertilizer" ? "🌱" : "🔧"}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#294f32] truncate">{item?.name || t("Item")}</p>
                      <p className="text-xs text-[#4e6f55] mt-0.5 capitalize">
                        {item?.brand && <span className="font-medium">{item.brand} · </span>}
                        {item?.category}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isRental ? "bg-cyan-100 text-cyan-700" : "bg-orange-100 text-orange-700"}`}>
                          {isRental ? `Rental${order.rentalDuration ? ` · ${order.rentalDuration} ${order.rentalUnit}` : ""}` : "Purchase"}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                          {order.paymentMethod}
                        </span>
                        <span className="text-[11px] font-bold text-[#1d8192] ml-auto">
                          ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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

          {/* Rent/Sale Filter */}
          <div className="mt-4 flex gap-3 flex-wrap">
            <CategoryChip active={marketFilter === "all"} onClick={() => setMarketFilter("all")}>All</CategoryChip>
            <CategoryChip active={marketFilter === "rent"} onClick={() => setMarketFilter("rent")}>For Rent</CategoryChip>
            <CategoryChip active={marketFilter === "sale"} onClick={() => setMarketFilter("sale")}>For Sale</CategoryChip>
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
                  <div className="rounded-xl overflow-hidden border-2 border-[#f4d7a3] ring-1 ring-[#f7e7c8] bg-gray-50 h-40 shadow-inner">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {isFertilizer ? <FiDroplet className="text-emerald-700" /> : <FiTool className="text-[#F57C00]" />}
                      <span className={isFertilizer ? "text-emerald-800" : "text-[#b85f00]"}>
                        {isFertilizer ? t("Fertilizer") : t("Equipment")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {item.category === "equipment" && (
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            item.rentalAvailable
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {item.rentalAvailable ? t("For Rent") : t("For Sale")}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{item.stock}</span>
                    </div>
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
          <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-[#f7fff9] to-[#fff7ef] p-6 shadow-2xl">
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
                        ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200] shadow-md shadow-orange-200"
                        : "border-emerald-200 bg-white hover:bg-emerald-50 text-[#2f5540]"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("rental")}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      orderType === "rental"
                        ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200] shadow-md shadow-orange-200"
                        : "border-emerald-200 bg-white hover:bg-emerald-50 text-[#2f5540]"
                    }`}
                  >
                    Rent
                  </button>
                </div>

                {orderType === "rental" && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 px-4 py-3">
                    <label className="block text-sm font-semibold text-[#27442f] mb-2">
                      Rental duration ({selectedItem.rentalUnit})
                    </label>
                    <input
                      type="number"
                      min={selectedItem.minimumRentalPeriod || 1}
                      value={rentalDuration}
                      onChange={(e) => setRentalDuration(Math.max(selectedItem.minimumRentalPeriod || 1, Number(e.target.value) || 1))}
                      className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
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
                    ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200] shadow-md shadow-orange-200"
                    : "border-emerald-200 bg-white hover:bg-emerald-50 text-[#2f5540]"
                }`}
              >
                {t("Online Payment (UPI / Card / Netbanking)")}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("Offline")}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  paymentMethod === "Offline"
                    ? "border-[#F57C00] bg-[#fff7ed] text-[#9a5200] shadow-md shadow-orange-200"
                    : "border-emerald-200 bg-white hover:bg-emerald-50 text-[#2f5540]"
                }`}
              >
                {t("Offline Payment (Cash on Delivery)")}
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 px-4 py-3">
              <p className="text-sm font-semibold text-[#27442f]">Delivery Address</p>
              <textarea
                value={deliveryAddress.fullAddress}
                onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, fullAddress: e.target.value }))}
                placeholder="House/Plot, Street, Area"
                className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 outline-none text-sm focus:ring-2 focus:ring-emerald-200"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={deliveryAddress.villageTown}
                  onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, villageTown: e.target.value }))}
                  placeholder="Village / Town"
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 outline-none text-sm focus:ring-2 focus:ring-emerald-200"
                />
                <input
                  value={deliveryAddress.pincode}
                  onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                  placeholder="Pincode"
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 outline-none text-sm focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <input
                value={deliveryAddress.landmark}
                onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, landmark: e.target.value }))}
                placeholder="Landmark (optional)"
                className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 outline-none text-sm focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="mt-5 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-3">
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
                className="flex-1 rounded-xl border border-emerald-200 bg-white py-2.5 font-semibold text-[#2d4a35] hover:bg-emerald-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                disabled={!paymentMethod || !deliveryAddress.fullAddress.trim() || !deliveryAddress.pincode.trim()}
                onClick={confirmPurchase}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#F57C00] to-[#ff9a3c] py-2.5 font-semibold text-white shadow-md shadow-orange-300 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
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
