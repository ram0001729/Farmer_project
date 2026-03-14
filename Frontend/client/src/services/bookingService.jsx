import axios from "axios"

const API = import.meta.env.VITE_API_URL

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

// CREATE BOOKING
export const createBooking = async (data) => {
  const res= await api.post("/booking", data);
      return res.data;

};

// GET SINGLE BOOKING (for payment page)
export const getBookingById = async (id) => {
  const res = await api.get(`/booking/${id}`);
  return res.data.booking;
};

// USER BOOKINGS
export const getMyBookings =async () => {
  const res= await api.get("/booking/me");
      return res.data.bookings;

};

// PROVIDER BOOKINGS
export const getProviderBookings = async () => {
  const res= await api.get("/booking/provider");
      return res.data.bookings;

};

// STATUS UPDATES
export const confirmBooking = async (id) => {
  const res= await api.patch(`/booking/${id}/confirm`);
      return res.data;

};

export const startBooking =async  (id) => {
const res= await api.patch(`/booking/${id}/start`);
      return res.data;

};

export const completeBooking = async  (id) => {
    const res= await api.patch(`/booking/${id}/complete`);
    return res.data;
};

export const cancelBooking = async (id) => {
  const res= await api.patch(`/booking/${id}/cancel`);
  return res.data;
};
