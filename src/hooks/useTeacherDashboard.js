import { useEffect, useState } from "react";
import {
  getTeacherClassStats,
  getPendingVerifications,
} from "../services/teacherService";

export default function useTeacherDashboard(enabled, classId) {
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !classId) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [s, p] = await Promise.all([
          getTeacherClassStats(classId),
          getPendingVerifications(classId),
        ]);
        if (mounted) {
          setStats(s);
          setPendingVerifications(p);
        }
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enabled, classId]);

  return { stats, pendingVerifications, loading, error };
}
