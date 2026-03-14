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




export const createPost = async (postData) => {
  const formData = new FormData();

  formData.append("crop", postData.crop);
  formData.append("title", postData.title);
  formData.append("description", postData.description);

  if (postData.image) {
    formData.append("image", postData.image);
  }

  const res = await api.post("/forum/create", formData);

  return res.data;
};





export const getPosts=async()=>{
const res=await api.get("/forum/all");
return res.data;
}



export const addReply =async(postId,data)=>{
    const res=await api.post(`/forum/reply/${postId}`,data);
    return res.data;
}


