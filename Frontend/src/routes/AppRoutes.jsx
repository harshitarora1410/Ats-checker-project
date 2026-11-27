import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import AnalyzingPage from "../pages/AnalyzingPage";
import RankingPage from "../pages/RankingPage";
import CandidatePage from "../pages/CandidatePage";
import ReportPage from "../pages/ReportPage";
import SettingsPage from "../pages/SettingsPage";
import HistoryPage from "../pages/HistoryPage";
import NotFoundPage from "../pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* P2 — no navbar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AppLayout />}>
        {/* P1 — public */}
        <Route path="/" element={<MainPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/analyze/:jobId/progress" element={<AnalyzingPage />} /> {/* P3 */}
          <Route path="/analyze/:jobId/results" element={<RankingPage />} /> {/* P4 */}
          <Route path="/analyze/:jobId/resumes/:resumeId" element={<CandidatePage />} /> {/* P5 */}
          <Route path="/settings" element={<SettingsPage />} /> {/* P7 */}
          <Route path="/history" element={<HistoryPage />} /> {/* P8 */}
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* P6 — full-screen report viewer, no navbar */}
      <Route element={<ProtectedRoute />}>
        <Route path="/analyze/:jobId/resumes/:resumeId/report" element={<ReportPage />} />
      </Route>
    </Routes>
  );
}
