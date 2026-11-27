import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const baseURL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

const refreshTokens = async () => {
  const refresh_token = tokenStorage.getRefresh();
  if (!refresh_token) throw new Error("No refresh token");
  // plain axios (not `api`) so this call can't trigger the interceptor again
  const { data } = await axios.post(`${baseURL}/auth/refresh`, { refresh_token });
  tokenStorage.set(data);
  return data.access_token;
};

const isAuthUrl = (url = "") =>
  ["/auth/login", "/auth/signup", "/auth/refresh"].some((p) => url.includes(p));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry && !isAuthUrl(original.url)) {
      original._retry = true;
      try {
        refreshPromise ??= refreshTokens().finally(() => (refreshPromise = null));
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        tokenStorage.clear();
        window.dispatchEvent(new Event("auth:expired"));
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
