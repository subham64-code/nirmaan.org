import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging and URL normalization
api.interceptors.request.use(
  (config) => {
    // Normalize URL: remove leading slash to ensure it appends to baseURL correctly
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("nirmaan_token");
      if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // If sending FormData, let the browser set Content-Type (including boundary)
    if (config.data instanceof FormData) {
      if (config.headers) {
        // Remove any preset content-type so browser can add multipart/form-data with boundary
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status && status < 500) {
      console.warn('API Response:', status, url);
    } else {
      console.error('API Response Error:', status, url);
    }

    return Promise.reject(error);
  }
);

export function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getMediaUrl(url?: string | null): string {
  if (!url || url === "[object FileList]") return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const backendBase = apiUrl.replace(/\/api$/, "");
  return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

