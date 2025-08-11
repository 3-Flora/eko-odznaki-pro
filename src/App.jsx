import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navbar } from "./components/layout/Navbar";
import { BottomNav } from "./components/layout/BottomNav";

import Pages from "./pages";

const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLogin, setIsLogin] = useState(true);

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Pages.Dashboard />;
      case "submit":
        return <Pages.Activity />;
      case "ranking":
        return <Pages.Ranking />;
      case "challenges":
        return <Pages.Challenges />;
      case "profile":
        return <Pages.Profile />;
      default:
        return <Pages.Dashboard />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onTabChange={setActiveTab} />
      <main className="flex-1 py-16 overflow-auto">{renderContent()}</main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
