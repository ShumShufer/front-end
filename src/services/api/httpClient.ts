import axios, { AxiosError } from "axios";
import { type ApiError } from "../../types/common.types.ts";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "data" in value
  );
}

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
httpClient.interceptors.request.use(
  (config) => {
    // @TODO: remove local storage logic and use secure measures
    const token = localStorage.getItem("token"); // Simplistic approach for now
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
httpClient.interceptors.response.use(
  // The API's standard response is { success, data, message, statusCode }.
  // Keeping the envelope handling here ensures pages and services consume
  // domain data only, while still accepting legacy endpoints during rollout.
  (response) =>
    isApiEnvelope(response.data) ? response.data.data : response.data,
  (error: AxiosError) => {
    let apiError: ApiError = {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred.",
    };

    if (error.response?.data) {
      const data = error.response.data as {
        error?: ApiError;
        message?: string;
      };
      if (data.error) apiError = data.error;
      else if (data.message) apiError = { code: "REQUEST_FAILED", message: data.message };
    } else if (error.request) {
      apiError = {
        code: "NETWORK_ERROR",
        message: "Could not connect to the server.",
      };
    }

    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., clear token, redirect to login)
      // This might be better handled in a centralized error event emitter
      // to let the AuthContext know, but for now we throw.
    }

    return Promise.reject(apiError);
  },
);

export default httpClient;
