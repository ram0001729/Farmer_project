import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Get Razorpay key from backend (no auth needed - public key) */
export const getPaymentConfig = async () => {
  const res = await api.get("/payments/config");
  return res.data;
};

export const createOrder = async (bookingId) => {
  const res = await api.post("/payments/create-order", {
    bookingId,
  });

  return res.data;
};


export const verifyPayment = async (payload) => {
  const res = await api.post("/payments/success", payload);
  return res.data;
};

export const markPaymentFailed = async (paymentId, meta = {}) => {
  const res = await api.post("/payments/failed", { paymentId, meta });
  return res.data;
};


export const getMyPayments = async () => {
  const res = await api.get("/payments/my-payments");
  return res.data;
};


export const refundPayment = async (paymentId) => {
  const res = await api.patch(`/payments/${paymentId}/refund`);
  return res.data;
};

/** Provider earnings */
export const getProviderEarnings = async () => {
  const res = await api.get("/payments/provider/earnings");
  return res.data;
};

/**
 * Initiate a payment record (used for offline cash payment tracking for bookings)
 * POST /payments/initiate
 */
export const initiatePayment = async ({ bookingId, amount, method }) => {
  const res = await api.post("/payments/initiate", { bookingId, amount, method });
  return res.data;
};