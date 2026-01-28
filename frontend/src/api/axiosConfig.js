import axios from 'axios';

// Esta línea hace la magia:
// Busca una variable en la nube llamada VITE_API_URL.
// Si no la encuentra (porque estás en tu PC), usa localhost.
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: baseURL,
});

export default api;