import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API,
});

export const getSuccessNews = async (query = "") => {
  const res = await api.get("/news", {
    params: query ? { query } : {},
  });
  return res.data;
};

export const getGovernmentSchemes = async (params = {}) => {
  const res = await api.get("/news/schemes", { params });
  return res.data;
};
