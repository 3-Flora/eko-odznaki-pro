import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useEffect, useRef } from "react";

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser, loading } = useAuth();
  const { showError } = useToast();
  const hasShownError = useRef(false);

  useEffect(() => {
    if (!currentUser && !hasShownError.current) {
      showError("Musisz być zalogowany, aby uzyskać dostęp do tej strony.");
      hasShownError.current = true;
    }
  }, [currentUser, showError]);

  useEffect(() => {
    if (
      currentUser &&
      allowedRoles &&
      !allowedRoles.includes(currentUser.role) &&
      !hasShownError.current
    ) {
      showError("Nie masz uprawnień do dostępu do tej strony.");
      hasShownError.current = true;
    }
  }, [currentUser, allowedRoles, showError]);

  if (loading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!currentUser.schoolId || !currentUser.classId) {
    return <Navigate to="/selectSchool" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}
