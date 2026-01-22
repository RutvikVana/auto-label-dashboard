import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://auto-label-dashboard-v3f4.onrender.com/api";

const API = axios.create({
  baseURL
});

export default API;
