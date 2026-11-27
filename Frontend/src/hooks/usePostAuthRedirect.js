import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAnalysisDraft } from "./useAnalysisDraft";
import { pathForParams } from "../lib/intent";
import { loadSettings } from "../lib/settingsStore";

/**
 * After a successful login/signup, send the user where they were going (flow step 3):
 *   intent=history  -> /history
 *   intent=settings -> /settings
 *   intent=score    -> create the analysis from the in-memory draft -> /analyze/:jobId/progress
 *   next=/path      -> that path
 *   nothing         -> /
 */
export function usePostAuthRedirect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const draft = useAnalysisDraft();

  return useCallback(
    async (user) => {
      if (params.get("intent") !== "score") {
        navigate(pathForParams(params), { replace: true });
        return;
      }

      // the draft is lost if the page was reloaded on the login screen
      if (!draft.isReady) {
        navigate("/", {
          replace: true,
          state: { notice: "Please add the job description and resumes again, then click Score Resumes." },
        });
        return;
      }

      const { provider, weights } = loadSettings(user?.id);
      try {
        const jobId = await draft.submit({ provider, sectionWeights: weights });
        navigate(`/analyze/${jobId}/progress`, { replace: true });
      } catch {
        // the main page shows draft.submitError and still has the files
        navigate("/", { replace: true });
      }
    },
    [params, navigate, draft]
  );
}
