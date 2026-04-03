import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://qbito-backend.onrender.com/api",
});

// We can add interceptors here later if we want global JWT handling
export default api;
