import { useEffect, useState } from "react";
import { getLimitedEcoActions } from "../services/ecoActionService";

export default function useLimitedEcoActions(enabled, limit = 3) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getLimitedEcoActions(limit);
        if (mounted) setData(res || []);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enabled, limit]);

  return { data, loading, error };
}
