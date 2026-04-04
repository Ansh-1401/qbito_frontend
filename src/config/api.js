import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://qbito-backend.onrender.com/api",
});

// Central JWT handling
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("s2d_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
