import axios from 'axios'

const api = axios.create({
    // Aquí pegamos la URL de tu Backend que ya está vivo en Render
    baseURL: 'https://backend-instinto.onrender.com'
})

export default api