import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Loading from "./components/routing/Loading";
import NavigationWrapper from "./components/routing/NavigationWrapper";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import ToastContainer from "./components/ui/ToastContainer";
import {
  ActivityPage,
  SubmitActivityPage,
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
  NotificationsPage,
  CreateNotificationPage,
  // Ekoskop pages
  EkoskopSchoolsPage,
  CreateSchoolPage,
  EditSchoolPage,
  EkoskopStatisticsPage,
  EkoskopArticlesPage,
  CreateArticlePage,
  EditArticlePage,
  EkoskopEcoActionsPage,
  CreateEcoActionPage,
  EditEcoActionPage,
  EkoskopBadgesPage,
  CreateBadgePage,
  EditBadgePage,
  EkoskopUsersPage,
  CreateTeacherPage,
  TeacherApplicationsPage,
  SchoolDetailPage,
  // Other pages
  TeacherApplicationPage,
} from "./pages/_index";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <NavigationWrapper>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/selectSchool" element={<SelectSchoolPage />} />
          <Route
            path="/teacher-application"
            element={<TeacherApplicationPage />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute
                allowedRoles={["student", "teacher", "ekoskop"]}
              />
            }
          >
            <Route path="" element={<Layout />}>
              <Route index element={<DashboardPage />} />

              {/* Routes for students */}
              <Route
                path="submit"
                element={<ProtectedRoute allowedRoles={["student"]} />}
              >
                <Route index element={<ActivityPage />} />
                <Route path="action" element={<SubmitActivityPage />} />
              </Route>

              {/* General Routes for all users */}
              <Route path="challenges" element={<ChallengesPage />} />
              <Route path="ranking" element={<RankingPage />} />
              <Route path="notifications" element={<NotificationsPage />} />

              {/* Routes for teachers and ekoskop */}
              <Route
                path="create-notification"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "ekoskop"]} />
                }
              >
                <Route index element={<CreateNotificationPage />} />
              </Route>

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

              {/* Routes for ekoskop */}
              <Route
                path="ekoskop"
                element={<ProtectedRoute allowedRoles={["ekoskop"]} />}
              >
                <Route path="schools" element={<EkoskopSchoolsPage />} />
                <Route path="schools/create" element={<CreateSchoolPage />} />
                <Route
                  path="schools/edit/:schoolId"
                  element={<EditSchoolPage />}
                />
                <Route path="statistics" element={<EkoskopStatisticsPage />} />
                <Route path="articles" element={<EkoskopArticlesPage />} />
                <Route path="articles/create" element={<CreateArticlePage />} />
                <Route
                  path="articles/edit/:articleId"
                  element={<EditArticlePage />}
                />
                <Route path="eco-actions" element={<EkoskopEcoActionsPage />} />
                <Route
                  path="eco-actions/create"
                  element={<CreateEcoActionPage />}
                />
                <Route
                  path="eco-actions/edit/:actionId"
                  element={<EditEcoActionPage />}
                />
                <Route path="badges" element={<EkoskopBadgesPage />} />
                <Route path="badges/create" element={<CreateBadgePage />} />
                <Route
                  path="badges/edit/:badgeId"
                  element={<EditBadgePage />}
                />
                <Route path="users" element={<EkoskopUsersPage />} />
                <Route
                  path="users/create-teacher"
                  element={<CreateTeacherPage />}
                />
                <Route
                  path="users/teacher-applications"
                  element={<TeacherApplicationsPage />}
                />
                <Route path="school/:schoolId" element={<SchoolDetailPage />} />
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
      </NavigationWrapper>
    </BrowserRouter>
  );
}
