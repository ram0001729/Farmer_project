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

export const getMarketItems = async (params = {}) => {
  const res = await api.get("/market/items", { params });
  return res.data;
};

export const createMarketOrder = async (data) => {
  const res = await api.post("/market/orders", data);
  return res.data;
};

export const getMyMarketOrders = async () => {
  const res = await api.get("/market/orders/me");
  return res.data;
};

export const getProviderMarketOrders = async () => {
  const res = await api.get("/market/orders/provider");
  return res.data;
};

export const getProviderAnalytics = async () => {
  const res = await api.get("/market/provider/analytics");
  return res.data;
};

export const createMarketItem = async (data) => {
  const res = await api.post("/market/items", data);
  return res.data;
};

export const getMyMarketItems = async () => {
  const res = await api.get("/market/items/me");
  return res.data;
};

export const getMarketPrices = async () => {
  const res = await api.get("/market/prices");
  return res.data;
};

export const getNearbyCropMarkets = async (params = {}) => {
  const res = await api.get("/market/nearby-crop-markets", { params });
  return res.data;
};
