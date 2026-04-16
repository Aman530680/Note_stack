import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to every request
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

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Notes
export const uploadNote = (formData) => api.post('/notes/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getNotes = () => api.get('/notes');
export const searchNotes = (query, subject) => api.get('/notes/search', { params: { query, subject } });
export const getNote = (id) => api.get(`/notes/${id}`);
export const incrementDownload = (id) => api.put(`/notes/${id}/download`);
export const getTrendingNotes = () => api.get('/notes/trending');

// Admin
export const getAllNotes = () => api.get('/notes/admin/all');
export const approveNote = (id, status) => api.put(`/notes/${id}/approve`, { status });
export const deleteNote = (id) => api.delete(`/notes/${id}`);

// Student - My Notes
export const getMyNotes = () => api.get('/notes/my/all');
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteOwnNote = (id) => api.delete(`/notes/my/${id}`);

// Ratings
export const submitRating = (data) => api.post('/ratings', data);
export const getRatings = (noteId) => api.get(`/ratings/${noteId}`);
export const checkUserRating = (noteId) => api.get(`/ratings/check/${noteId}`);
export const getAllComments = () => api.get('/ratings/admin/comments');
export const approveComment = (id) => api.put(`/ratings/${id}/approve-comment`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markAsSeen = (id) => api.put(`/notifications/${id}/seen`);
export const markAllAsSeen = () => api.put('/notifications/seen/all');
export const getUnseenCount = () => api.get('/notifications/unseen/count');

export default api;
