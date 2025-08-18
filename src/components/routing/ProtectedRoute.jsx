import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  // Jeśli jeszcze ładuje, nie renderuj niczego (lub loading spinner)
  if (loading) {
    return null;
  }

  // Komponent sam sprawdza, czy użytkownik jest zalogowany.
  // Użycie !! jawnie konwertuje obiekt (gdy zalogowany) lub null (gdy wylogowany) na true/false.
  return !!currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}
