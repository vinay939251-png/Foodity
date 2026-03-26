import axios from "axios";

const api = axios.create({
  // This is the URL of your Django server
  baseURL: "http://127.0.0.1:8000/api/",
});

// This piece of code automatically adds your "Security Token"
// to every request once you log in later.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
