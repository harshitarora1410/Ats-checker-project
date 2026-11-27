import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { api } from "./services";
import { USE_MOCK } from "./config";

export default function App() {
  // GET /api/warm wakes the Render + Neon backend so the first real call isn't slow
  useEffect(() => {
    if (!USE_MOCK) api.warm().catch(() => {});
  }, []);

  return <AppRoutes />;
}
