import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  getGoogleAuthUrl: () => `${API_URL}/auth/google`,
};

// Hotels API
export const hotelsAPI = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  getRooms: (id) => api.get(`/hotels/${id}/rooms`),
  checkAvailability: (id, params) => api.get(`/hotels/${id}/availability`, { params }),
  getExtras: (id) => api.get(`/hotels/${id}/extras`),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
};

// Rooms API
export const roomsAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  checkout: (id) => api.post(`/bookings/${id}/checkout`),
};

// Reviews API
export const reviewsAPI = {
  getHotelReviews: (hotelId, params) => api.get(`/reviews/hotel/${hotelId}`, { params }),
  getByBooking: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Payments API
export const paymentsAPI = {
  createIntent: (bookingId) => api.post('/payments/create-intent', { bookingId }),
  getStatus: (bookingId) => api.get(`/payments/${bookingId}/status`),
  simulate: (bookingId) => api.post('/payments/simulate', { bookingId }),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getBookings: (id, params) => api.get(`/users/${id}/bookings`, { params }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getReports: (params) => api.get('/admin/reports', { params, responseType: 'blob' }),
  getNotifications: () => api.get('/admin/notifications'),
};

export default api;
