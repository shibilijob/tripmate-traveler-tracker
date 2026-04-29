import axios from 'axios';
import Swal from 'sweetalert2';

export const setupInterceptors = (axiosInstance) => {
  // Request Interceptor
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // 401 status then it shold not a retry
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh')) {
        originalRequest._retry = true;

        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, 
            { withCredentials: true }
          );

          localStorage.setItem("token", data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          
          return axiosInstance(originalRequest);
        } catch (refreshError) {

    return new Promise((resolve) => {
        Swal.fire({
            title: 'Session Expired',
            text: 'Due to security issues, you have been logged out.',
            icon: 'warning',
            confirmButtonText: 'Login Again',
            allowOutsideClick: false,
            confirmButtonColor: '#11889c',
        }).then((result) => {
            if (result.isConfirmed) {
                // if user click then clear user details
                localStorage.clear(); 
                window.location.href = "/login";
                resolve();
            }
        });
    });
}
      }
      return Promise.reject(error);
    }
  );
};