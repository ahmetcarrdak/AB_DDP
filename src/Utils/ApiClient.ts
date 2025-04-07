import axios from "axios";

// API'nin ana domaini
export const domain = "https://ab_ddp_api.railway.internal/api/";

// Axios instance oluştur
const apiClient = axios.create({
    baseURL: domain,
    headers: {
        "Content-Type": "application/json",
    },
});

// Her istekte token eklemek için bir interceptor kullan
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Token'ı localStorage'dan al
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Bearer Token ekle
    }
    return config;
});

export default apiClient;
