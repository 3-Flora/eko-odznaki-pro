import { BrowserRouter, Route, Routes } from "react-router";
import Loading from "./components/loading/Loading";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import {
  ActivityPage,
  AuthPage,
  ChallengesPage,
  DashboardPage,
  ProfilePage,
  RankingPage,
  EditProfilePage,
} from "./pages";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
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
            <Route path="profile/edit" element={<EditProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
