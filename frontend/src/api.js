import axios from "axios";

// During development, connect to local backend
// In production, use the remote backend URL from environment variable
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export default API;
