import { Outlet, Navigate } from "react-router";

export default function ProtectedRoute({ isAuth }) {
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
