import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      refreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
        return Promise.reject(err);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  charts: (days = 7) => api.get(`/dashboard/charts?days=${days}`),
  activities: () => api.get('/dashboard/activities'),
  calendar: () => api.get('/dashboard/calendar'),
};

export const crudApi = (resource) => ({
  list: (params) => api.get(`/${resource}`, { params }),
  get: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  remove: (id) => api.delete(`/${resource}/${id}`),
});

export const searchApi = (q) => api.get('/search', { params: { q } });
export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
export const reportApi = {
  types: () => api.get('/reports/types'),
  generate: (type, params) => api.get(`/reports/${type}`, { params }),
};
export const aiApi = { insights: (farmId) => api.get('/ai/insights', { params: { farmId } }) };
export const adminApi = {
  users: {
    list: (params) => api.get('/users', { params }),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    remove: (id) => api.delete(`/users/${id}`),
  },
  settings: { get: () => api.get('/settings'), update: (key, value) => api.put('/settings', { key, value }) },
  activityLogs: (params) => api.get('/activity-logs', { params }),
  backup: () => api.post('/backup'),
  listBackups: () => api.get('/backup'),
  restore: (formData) => api.post('/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
