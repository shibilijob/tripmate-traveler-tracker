import axios from 'axios';

const API = axios.create({
  // Use import.meta.env for Vite projects
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/user`, 
  withCredentials: true
});

export default API;