import { useState } from "react";
import HistoryPage from "./page/HistoryPage";
import SettingsPage from "./page/SettingsPage";

export default function App() {
  const [page, setPage] = useState("history");
  return (
    <>
    <HistoryPage/>
    <SettingsPage/>
    </>
  );
}
