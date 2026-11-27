import { useContext } from "react";
import { AnalysisDraftContext } from "../context/AnalysisDraftContext";

export const useAnalysisDraft = () => useContext(AnalysisDraftContext);
