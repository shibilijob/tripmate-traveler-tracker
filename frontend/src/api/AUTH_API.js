import axios from "axios";
import { setupInterceptors } from "./interceptor";

const AUTH_API = axios.create({
 baseURL: `${import.meta.env.VITE_BACKEND_URL}/auth`,
  withCredentials: true
})

setupInterceptors(AUTH_API)

export default AUTH_API;