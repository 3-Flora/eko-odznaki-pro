import React from "react";
import { Home, Plus, Trophy, User, BookOpen, CheckSquare } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const BottomNav = ({ activeTab, onTabChange }) => {
  const { currentUser } = useAuth();

  const tabs = [
    { id: "dashboard", icon: Home, label: "Główna" },
    {
      id: "submit",
      icon: currentUser?.role === "teacher" ? CheckSquare : Plus,
      label: currentUser?.role === "teacher" ? "Sprawdź" : "Dodaj",
    },
    { id: "ranking", icon: Trophy, label: "Ranking" },
    { id: "challenges", icon: BookOpen, label: "Wyzwania" },
    { id: "profile", icon: User, label: "Profil" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 px-4 py-2 bg-white border-t border-gray-200">
      <div className="flex justify-around">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              activeTab === id
                ? "text-green-600 bg-green-50 scale-105"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
