import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="page-wash flex-1">
        <Outlet />
      </main>
    </div>
  );
}
