import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!!currentUser && !currentUser.classId) {
    return <Navigate to="/selectSchool" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    console.log("ZAKAZ");
    return <Navigate to="/" replace />;
  }

  return !!currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}
