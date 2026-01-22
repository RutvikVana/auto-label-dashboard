import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://auto-label-backend.onrender.com/api";
";

const API = axios.create({
  baseURL
});

export default API;
