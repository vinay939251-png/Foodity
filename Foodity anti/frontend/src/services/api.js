import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodity_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('foodity_token');
      localStorage.removeItem('foodity_user');
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getMe: () => api.get('/auth/me/'),
  updateProfile: (data) => {
    return api.patch('/auth/me/', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
};

// Recipes
export const recipesAPI = {
  list: (params) => api.get('/recipes/', { params }),
  detail: (id) => api.get(`/recipes/${id}/`),
  create: (data) => api.post('/recipes/', data),
  update: (id, data) => api.put(`/recipes/${id}/`, data),
  delete: (id) => api.delete(`/recipes/${id}/`),
  like: (id) => api.post(`/recipes/${id}/like/`),
  save: (id, boardId) => api.post(`/recipes/${id}/save/`, boardId ? { board_id: boardId } : {}),
  getComments: (id) => api.get(`/recipes/${id}/comments/`),
  addComment: (id, text, parentId) => api.post(`/recipes/${id}/comments/`, { text, parent_id: parentId }),
  generateAIAssistant: (data) => api.post('/recipes/ai-generate/', data),
  askAIChef: (id, message, history) => api.post(`/recipes/${id}/ask-ai/`, { message, history }),
};

// Boards
export const boardsAPI = {
  list: () => api.get('/boards/'),
  detail: (id) => api.get(`/boards/${id}/`),
  create: (data) => api.post('/boards/', data),
  delete: (id) => api.delete(`/boards/${id}/`),
};

// Chat
export const chatAPI = {
  listConversations: () => api.get('/chat/'),
  startConversation: (userId) => api.post('/chat/', { user_id: userId }),
  getMessages: (convoId) => api.get(`/chat/${convoId}/`),
  sendMessage: (convoId, text, recipeId) => api.post(`/chat/${convoId}/`, { text, recipe_id: recipeId }),
};

// Users
export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}/`),
  search: (q) => api.get('/users/search/', { params: { q } }),
};

// Tracker
export const trackerAPI = {
  list: (date) => api.get('/tracker/', { params: { date } }),
  add: (data) => api.post('/tracker/', data),
  delete: (id) => api.delete(`/tracker/${id}/`),
};

// Health
export const healthAPI = {
  check: () => api.get('/health/'),
};

export default api;
