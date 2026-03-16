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




export const createListing=async (data)=>{
 const res=  await api.post('/listings/',data)
   return res.data
}




export const getListing=async(data)=>{
    const res=await api.get('/listings')
    return res.data.listings
}



export const getSingleListing = async (id) => {
  const res = await api.get(`/listings/${id}`)
  return res.data.listing
}



export const updateListing=async(id,data)=>{
    const res=await api.patch(`/listings/${id}`,data)
   return res.data
}



export const availableListing=async(id)=>{
    const res=await api.patch(`/listings/${id}/availability`)
   return res.data
}

export const setProviderAvailability = async (available) => {
  const res = await api.patch("/listings/me/availability", { available });
  return res.data;
};


export const deleteListing = async (id) => {
  const res = await api.delete(`/listings/${id}`);
  return res.data;
};



export const updateDriverLocation = async (lat, lng) => {
  const res = await api.patch("/listings/location", {
    lat,
    lng
  });

  return res.data;
};

export const uploadListingImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post("/listings/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

