import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Pages from "./pages";
import DeviceEnvironmentProvider from "./contexts/DeviceEnvironmentContext";
import Loading from "./components/loading/Loading";
import { Navigate, BrowserRouter, Route, Routes, Outlet } from "react-router";
import Layout from "./components/layout/Layout";
const {
  ActivityPage,
  AuthPage,
  ChallengesPage,
  DashboardPage,
  ProfilePage,
  RankingPage,
} = Pages;

function ProtectedRoute({ isAuth }) {
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute isAuth={currentUser} />}>
          <Route path="" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="submit" element={<ActivityPage />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <DeviceEnvironmentProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DeviceEnvironmentProvider>
  );
}
