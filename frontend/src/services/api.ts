import axios, { InternalAxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken();
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
