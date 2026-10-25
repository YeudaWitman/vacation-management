import axios from "axios";
import { auth } from "../auth";
import router from "../router";

// One Axios instance for the whole app. "/api" is forwarded to the backend by the Vite proxy.
export const http = axios.create({ baseURL: "/api" });

// Runs before every request: attach the JWT if we have one.
http.interceptors.request.use((config) => {
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Runs on every response. A 401 on a page other than login means the token is missing,
// invalid or expired (8 hours): clear the session and send the user to the login page.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && auth.token) {
      auth.logout();
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

// The backend answers errors as { error: "message" }. Turn any failure into text for the screen.
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) return String(error.response.data.error);
    if (!error.response) return "Cannot reach the server. Is the backend running?";
  }
  return "Something went wrong. Please try again.";
}
