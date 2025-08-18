import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  // Jeśli jeszcze ładuje, nie renderuj niczego (lub loading spinner)
  if (loading) {
    return null;
  }

  // Komponent sam sprawdza, czy użytkownik jest zalogowany.
  // If user is logged in but hasn't selected a class yet, force them to select school/class
  if (!!currentUser && !currentUser.classId) {
    return <Navigate to="/selectSchool" replace />;
  }

  return !!currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}
