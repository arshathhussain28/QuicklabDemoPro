import axios from 'axios';
import { DemoRequest } from '../context/AppDataContext';

export const API_URL = `https://quicklabdemopro.onrender.com/api`;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global Response Interceptor for 403 (Account Deactivated mid-session)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            // Prevent redirect loop if the failure was naturally during login
            if (!error.config.url.includes('/auth/login')) {
                console.warn('Access denied or account deactivated. Logging out.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    getProfile: () => api.get('/auth/profile'),
    register: (data: any) => api.post('/auth/register', data), // Admin only
};

export const masterData = {
    getAll: () => api.get('/master-data'),
};

export const requests = {
    create: (data: any) => api.post('/requests', data),
    getAll: () => api.get('/requests'),
    getById: (id: string) => api.get(`/requests/${id}`),
    updateStatus: (id: string, data: any) => api.patch(`/requests/${id}/status`, data),
    getPDF: (id: string) => `${API_URL}/requests/${id}/pdf`, // specific logic might be needed
};

export default api;
