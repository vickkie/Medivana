import axios from "axios";
import axiosRetry from "axios-retry";
import * as SecureStore from "expo-secure-store";
import { BACKEND_PORT } from "@env";

// Single key holding the active session token (kept in Keychain/Keystore,
// never in AsyncStorage). One device = one active session.
export const TOKEN_KEY = "medivana.auth.token";
export const REFRESH_KEY = "medivana.auth.refresh";

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

// Single-flight refresh: concurrent 401s share one refresh call.
let refreshPromise = null;
const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      let refreshToken = null;
      try {
        refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      } catch {
        refreshToken = null;
      }
      if (!refreshToken) return null;

      try {
        const { data } = await axios.post(
          `${BACKEND_PORT}/auth/refresh`,
          { refreshToken },
          { timeout: 15000, __isRefreshRequest: true },
        );
        const token = data?.TOKEN;
        if (!token) return null;
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        if (data?.REFRESH_TOKEN) {
          await SecureStore.setItemAsync(REFRESH_KEY, data.REFRESH_TOKEN);
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return token;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
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
    async (error) => {
      if (error?.response?.status === 401 && onUnauthorized) {
        const config = error.config;
        // On a 401, try one silent refresh+retry before forcing logout.
        if (config && !config.__retriedWithRefresh && !config.__isRefreshRequest) {
          config.__retriedWithRefresh = true;
          const token = await refreshAccessToken();
          if (token) {
            config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
            return instance(config);
          }
        }
        onUnauthorized();
      }
      return Promise.reject(error);
    },
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
