import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export const createJob = async (jobData) => {
  const res = await api.post("/jobs", jobData);
  return res.data;
};


// 📋 GET ALL JOBS (with filters & pagination)
export const getJobs = async (filters = {}) => {
  const res = await api.get("/jobs", { params: filters });
  return res.data;
};


// 🔍 GET SINGLE JOB
export const getJobById = async (jobId) => {
  const res = await api.get(`/jobs/${jobId}`);
  return res.data;
};


// ✏️ UPDATE JOB
export const updateJob = async (jobId, updatedData) => {
  const res = await api.put(`/jobs/${jobId}`, updatedData);
  return res.data;
};


// 🔁 TOGGLE JOB STATUS (Active / Inactive)
export const toggleJobStatus = async (jobId) => {
  const res = await api.patch(`/jobs/${jobId}/toggle-status`);
  return res.data;
};


// 🗑 SOFT DELETE JOB
export const deleteJob = async (jobId) => {
  const res = await api.delete(`/jobs/${jobId}`);
  return res.data;
};
