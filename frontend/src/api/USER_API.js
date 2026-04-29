import axios from 'axios';
import { setupInterceptors } from "./interceptor";

const USER_API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/user`, 
  withCredentials: true
});

setupInterceptors(USER_API)

export default USER_API;