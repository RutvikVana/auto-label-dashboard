import axios from "axios";

// Get API URL from environment variable or default to local backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with base URL
const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Export both the instance and the base URL for flexibility
export { API_URL };
export default API;
