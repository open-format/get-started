import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOSTNAME,
  withCredentials: true, // Ensure cookies are sent with requests
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await apiClient.post(
          "/auth/refresh-token"
        );

        if (refreshResponse.status === 200) {
          return apiClient(originalRequest);
        } else {
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("Error during token refresh:", refreshError);
      }
    }
    console.log("<<< 6 >>>");
    return Promise.reject(error);
  }
);

export default apiClient;
