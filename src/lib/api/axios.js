import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const publicRoutes = ['/login', '/verify-email', '/register', '/'];

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const isPublicRoute = publicRoutes.some((route) =>
          window.location.pathname.startsWith(route)
        );

        if (!isPublicRoute) {
          window.location.href = '/login';
        }
      }
    }

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(errorMessage);
  }
);
export default api;