import { useEffect, useState } from "react";
import { getActiveEcoChallenge } from "../services/ecoChallengeService";

export default function useActiveEcoChallenge(enabled) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getActiveEcoChallenge();
        if (mounted) setData(res);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return { data, loading, error };
}
