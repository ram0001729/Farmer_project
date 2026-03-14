import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});


export const requestOtp = async (data) => {
  const res = await api.post("/auth/request-otp", data);
  return res.data;
};




export const verifyOtp = async (data) => {
  const res = await api.post("/auth/verify-otp",data)
 
  return res.data
};


export const setPassword = async (data, token) => {
  const res = await api.post("/auth/set-password", data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};


export const registerUser=async (data)=>{
  const res = await api.post("/auth/register-user",data)

   return res.data
}



export const loginWithPassword=async (data)=>{
  const res = await api.post("/auth/login-password",data)

   return res.data

   
}

