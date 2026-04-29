import axios from "axios";
import { setupInterceptors } from "./interceptor";

const ADMIN_API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/admin`, 
  withCredentials: true
})

setupInterceptors(ADMIN_API)

export default ADMIN_API;