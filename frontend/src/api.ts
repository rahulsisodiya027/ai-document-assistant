import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        console.log("JWT token:", token);

        if (token && token !== "undefined") {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;