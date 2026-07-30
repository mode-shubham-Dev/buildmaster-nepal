import axios from "axios";

/**
 * The single Axios instance used for ALL API calls in the app.
 * baseURL points at our Laravel API's v1 prefix, so we only ever
 * write the endpoint path (e.g. "/login") when making requests.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://api.test/api/v1
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * Runs automatically before every request leaves the app.
 * It grabs the auth token from localStorage (if we have one)
 * and attaches it as a Bearer token — exactly like we did
 * manually in Postman. So we never have to add it by hand.
 */
api.interceptors.request.use((config) => {
  // localStorage only exists in the browser, not during server render
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * RESPONSE INTERCEPTOR
 * Runs automatically after every response comes back.
 * If the API ever returns 401 (token invalid/expired), we clear
 * the stale token and bounce the user to the login page.
 */
api.interceptors.response.use(
  (response) => response, // success → pass through untouched
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      // Avoid redirect loop if we're already on the login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
