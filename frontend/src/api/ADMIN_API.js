import axios from "axios";

const ADMIN_API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/admin`, 
  withCredentials: true
})

export default ADMIN_API;