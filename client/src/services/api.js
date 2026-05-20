const API_URL = ''; // Proxied through Vite proxy to http://localhost:5000 in dev
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired session storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are logged in, trigger refresh to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (data) => {
    const res = await api.post('/api/auth/signup', data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post('/api/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/api/auth/users');
    return res.data;
  },
};

export const projectAPI = {
  getAll: async () => {
    const res = await api.get('/api/projects');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/api/projects/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/api/projects', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/api/projects/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/api/projects/${id}`);
    return res.data;
  },
};

export const taskAPI = {
  getAll: async (filters = {}) => {
    const res = await api.get('/api/tasks', { params: filters });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/api/tasks/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/api/tasks', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/api/tasks/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/api/tasks/${id}`);
    return res.data;
  },
  addComment: async (id, text) => {
    const res = await api.post(`/api/tasks/${id}/comments`, { text });
    return res.data;
  },
};

export const activityAPI = {
  getAll: async () => {
    const res = await api.get('/api/activities');
    return res.data;
  },
};

export default api;
