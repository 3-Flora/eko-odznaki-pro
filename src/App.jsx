import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Loading from "./components/routing/Loading";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/ui/ToastContainer";
import {
  ActivityPage,
  SubmitActionPage,
  AuthPage,
  BadgesPage,
  ChallengesPage,
  DashboardPage,
  ProfilePage,
  RankingPage,
  EditProfilePage,
  SelectSchoolPage,
  DebugPage,
  MySubmissionsPage,
  EditPasswordPage,
  EditEmailPage,
  StudentsPage,
  TeacherStatisticsPage,
  TeacherSubmissionsPage,
  StudentDetailPage,
  SubmissionDetailPage,
} from "./pages/_index";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/selectSchool" element={<SelectSchoolPage />} />
          <Route
            path="/"
            element={<ProtectedRoute allowedRoles={["student", "teacher"]} />}
          >
            <Route path="" element={<Layout />}>
              <Route index element={<DashboardPage />} />

              {/* Routes for students */}
              <Route
                path="submit"
                element={<ProtectedRoute allowedRoles={["student"]} />}
              >
                <Route index element={<ActivityPage />} />
                <Route path="action" element={<SubmitActionPage />} />
              </Route>

              {/* General Routes for all users */}
              <Route path="challenges" element={<ChallengesPage />} />
              <Route path="ranking" element={<RankingPage />} />

              {/* Routes for teachers */}
              <Route
                path="teacher"
                element={<ProtectedRoute allowedRoles={["teacher"]} />}
              >
                <Route path="students" element={<StudentsPage />} />
                <Route path="statistics" element={<TeacherStatisticsPage />} />
                <Route
                  path="submissions"
                  element={<TeacherSubmissionsPage />}
                />
                <Route
                  path="submission/:submissionId"
                  element={<SubmissionDetailPage />}
                />
                <Route
                  path="student/:studentId"
                  element={<StudentDetailPage />}
                />
              </Route>

              {/* Legacy route for students page (backward compatibility) */}
              <Route
                path="students"
                element={<ProtectedRoute allowedRoles={["teacher"]} />}
              >
                <Route index element={<StudentsPage />} />
              </Route>

              {/* Profile Routes */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/badges" element={<BadgesPage />} />
              <Route
                path="profile/submissions"
                element={<MySubmissionsPage />}
              />
              <Route path="profile/edit" element={<EditProfilePage />} />
              <Route
                path="profile/edit/password"
                element={<EditPasswordPage />}
              />
              <Route path="profile/edit/email" element={<EditEmailPage />} />
              <Route path="profile/debug" element={<DebugPage />} />

              {/* Redirect all unknown routes to the dashboard */}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}
