import { BrowserRouter, Route, Routes } from "react-router";
import Loading from "./components/routing/Loading";
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
  SelectSchoolPage,
} from "./pages/_index";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/selectSchool" element={<SelectSchoolPage />} />
        <Route path="/" element={<ProtectedRoute />}>
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
