import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API,
});

// Attach token automatically (same pattern)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const searchListings = async (params) => {
  const res = await api.get("/listings/search", {
    params, // { query, providerRole, available }
  });

  return res.data.listings;
};