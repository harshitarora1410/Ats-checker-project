import api from "./axios";

export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password }).then((r) => r.data);

export const signupApi = ({ name, email, password }) =>
  api.post("/auth/signup", { name, email, password }).then((r) => r.data);

export const meApi = () => api.get("/auth/me").then((r) => r.data);

export const logoutApi = () => api.post("/auth/logout").catch(() => {});
