import axios, { AxiosResponse, AxiosInstance } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getSession, signIn } from "next-auth/react";

interface ExtendedAxiosInstance extends AxiosInstance {
  post<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: any
  ): Promise<R>;
  // Add other methods (get, delete, etc.) if needed
}

//@TODO Handle the case where the refresh token is also invalid or expired, prompting the user to re-authenticate
const baseURL = process.env.NEXT_PUBLIC_API_HOSTNAME + "/api/v1";
const apiClient: ExtendedAxiosInstance = axios.create({
  baseURL,
}) as ExtendedAxiosInstance;

// Request interceptor: Attach token to every request
apiClient.interceptors.request.use(
  async (config) => {
    let session, token;

    if (typeof window === "undefined") {
      // This is server-side, so use getServerSession
      session = await getServerSession(config._req, config._res, authOptions);
    } else {
      session = await getSession();
      token = session?.user.access_token;
    }

    if (
      1 || // Temporarily refreshing access token on every API request
      (session &&
        typeof session.user.access_token === "undefined" &&
        session.user.refresh_token)
    ) {
      try {
        const res = await axios.post(`${baseURL}/auth/refresh_token`, {
          refreshToken: session.user.refresh_token,
        });
        if (res.status === 200) {
          session.user.access_token = res.data.accessToken;
          token = res.data.accessToken;
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        //@TODO Handle scenarios when the refresh token is also invalid (e.g., log the user out)
      }
    } else {
      token = session?.user.access_token;
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Check if the request is a POST to /auth/logout
    if (config.method === "post" && config.url?.endsWith("/auth/logout")) {
      const refreshToken = session?.user.refresh_token;

      // Append the refresh_token to the request body
      config.data = {
        ...config.data,
        refreshToken: refreshToken,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Refresh token after every request and handle token expiration
apiClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { _req, _res } = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      let refreshToken;
      let userAddress;
      let session;

      // Check if code is running on server
      if (typeof window === "undefined") {
        session = await getServerSession(_req, _res, authOptions);
      } else {
        session = await getSession();
      }

      refreshToken = session?.user.refresh_token;
      userAddress = session?.user?.address;

      if (refreshToken) {
        const res = await axios.post(`${baseURL}/auth/refresh_token`, {
          refreshToken,
        });

        if (res.status === 200) {
          session.user.access_token = res.data.accessToken;
          if (typeof window !== "undefined") {
            signIn("web3", {
              redirect: false,
              address: userAddress,
              access_token: res.data.accessToken,
              refresh_token: refreshToken,
            });
          }

          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${res.data.accessToken}`;
          return apiClient(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
