import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navbar } from "./components/layout/Navbar";
import { BottomNav } from "./components/layout/BottomNav";
import Pages from "./pages";
import DeviceEnvironmentProvider, {
  useDeviceEnvironment,
} from "./contexts/DeviceEnvironmentContext";
import Loading from "./components/loading/Loading";
const {
  ActivityPage,
  AuthPage,
  ChallengesPage,
  DashboardPage,
  ProfilePage,
  RankingPage,
} = Pages;

const renderContent = (activeTab) => {
  switch (activeTab) {
    case "dashboard":
      return <DashboardPage />;
    case "submit":
      return <ActivityPage />;
    case "ranking":
      return <RankingPage />;
    case "challenges":
      return <ChallengesPage />;
    case "profile":
      return <ProfilePage />;
    default:
      return <DashboardPage />;
  }
};

const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLogin, setIsLogin] = useState(true);
  const { mobileDeviceType } = useDeviceEnvironment();

  // Show loading spinner while auth is loading
  if (loading) {
    return <Loading />;
  }

  // Show auth page if user is not logged in
  if (!currentUser) {
    return <AuthPage isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />;
  }

  return (
    <div
      className={`flex flex-col min-h-screen bg-gray-50 ${
        mobileDeviceType === "SEorAndroid" && "pt-11"
      } ${mobileDeviceType === "notch" && "pt-18"}`}
    >
      <Navbar onTabChange={setActiveTab} />
      <Debug />
      <main className="flex-1 py-16 overflow-auto">
        {/* TODO: CHANGE TO REACT ROUTER */}
        {renderContent(activeTab)}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <DeviceEnvironmentProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DeviceEnvironmentProvider>
  );
}
