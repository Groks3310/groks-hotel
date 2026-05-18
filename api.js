import axios from 'axios'

const api = axios.create({ baseURL: '/api', withCredentials: true })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use((res) => res, (err) => {
  if (err.response?.status === 401) localStorage.removeItem('token')
  return Promise.reject(err)
})

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/profile', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (d) => api.put('/auth/password', d),
}
export const roomsAPI = {
  getAll: (p) => api.get('/rooms', { params: p }),
  getOne: (id) => api.get(`/rooms/${id}`),
  checkAvailability: (p) => api.get('/rooms/availability', { params: p }),
  create: (d) => api.post('/rooms', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, d) => api.put(`/rooms/${id}`, d),
  delete: (id) => api.delete(`/rooms/${id}`),
}
export const bookingsAPI = {
  create: (d) => api.post('/bookings', d),
  getMy: () => api.get('/bookings/my'),
  getAll: () => api.get('/bookings/all'),
  getOne: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  updateStatus: (id, s) => api.put(`/bookings/${id}/status`, { bookingStatus: s }),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
}
export const paymentsAPI = {
  initialize: (bookingId) => api.post('/payments/initialize', { bookingId }),
  verify: (ref) => api.get(`/payments/verify/${ref}`),
}
export const reviewsAPI = {
  getRoomReviews: (roomId) => api.get(`/reviews/room/${roomId}`),
  create: (d) => api.post('/reviews', d),
  delete: (id) => api.delete(`/reviews/${id}`),
  getAll: () => api.get('/reviews/all'),
}
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
}
export default api