import { USE_MOCK } from "../config";
import { httpApi } from "./httpApi";
import { mockApi } from "./mockApi";

// Every page talks to `api`; switch with VITE_USE_MOCK in .env
export const api = USE_MOCK ? mockApi : httpApi;

export { AUTH_EXPIRED_EVENT } from "./request";
export { tokenStorage } from "./tokenStorage";
