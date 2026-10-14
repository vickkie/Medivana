import axios from "axios";
import axiosRetry from "axios-retry";
import * as SecureStore from "expo-secure-store";
import { BACKEND_PORT } from "@env";

// Single key holding the active session token (kept in Keychain/Keystore,
// never in AsyncStorage). One device = one active session.
export const TOKEN_KEY = "medivana.auth.token";

const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const attachInterceptors = (instance) => {
  instance.interceptors.request.use(async (config) => {
    if (!config.headers.Authorization) {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
};

// Shared client for all new code: `api.get("/api/...")`.
const api = axios.create({ baseURL: BACKEND_PORT, timeout: 15000 });
attachInterceptors(api);
axiosRetry(api, { retries: 2, retryDelay: axiosRetry.exponentialDelay });

// Give legacy call sites the same auth/timeout/401 behavior without migrating:
// the default axios instance gets the interceptors, retries, and a real timeout.
attachInterceptors(axios);
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
axios.defaults.timeout = 15000;

export default api;
