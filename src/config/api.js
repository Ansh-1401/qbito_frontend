import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}`,
});

// We can add interceptors here later if we want global JWT handling
export default api;
