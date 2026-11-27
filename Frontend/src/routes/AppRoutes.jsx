import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import AnalyzePage from "../pages/AnalyzePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import PlaceholderPage from "../pages/PlaceholderPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* pages without navbar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* pages with navbar */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<AnalyzePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/analyze/:jobId/progress" element={<PlaceholderPage title="Analyzing (page 3)" />} />
          <Route path="/analyze/:jobId/results" element={<PlaceholderPage title="Ranking (page 4)" />} />
          <Route path="/analyze/:jobId/resumes/:resumeId" element={<PlaceholderPage title="Candidate details (page 5)" />} />
          <Route path="/history" element={<PlaceholderPage title="History (page 8)" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings (page 7)" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
