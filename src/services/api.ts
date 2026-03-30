import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// You can add token interceptors here later if needed

export default api;