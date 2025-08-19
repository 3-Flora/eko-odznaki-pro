import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

import {
  Trophy,
  Star,
  Calendar,
  School,
  Users,
  Trash2,
  LogOut,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { availableBadges } from "../data/badges";
import { ConfirmModal } from "../components/modal/ConfirmModal";
import { useNavigate } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function ProfilePage() {
  const { currentUser, logout, deleteAccount } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [classNameState, setClassNameState] = useState("");

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    deleteAccount();
  };

  const earnedBadges = availableBadges.filter(
    (badge) => (currentUser?.points || 0) >= badge.pointsRequired,
  );

  // Ładuje czytelne nazwy szkoły/klasy, gdy w dokumencie użytkownika są tylko identyfikatory
  useEffect(() => {
    let mounted = true;
    const loadNames = async () => {
      if (!currentUser) return;

      setSchoolName(currentUser.school || "");
      setClassNameState(currentUser.className || "");

      try {
        if (currentUser.schoolId) {
          const sRef = doc(db, "schools", currentUser.schoolId);
          const sSnap = await getDoc(sRef);
          if (mounted && sSnap.exists()) {
            const data = sSnap.data();
            setSchoolName(data.name || data.title || "");
          }
        }

        if (currentUser.classId) {
          const cRef = doc(db, "classes", currentUser.classId);
          const cSnap = await getDoc(cRef);
          if (mounted && cSnap.exists()) {
            const data = cSnap.data();
            setClassNameState(data.name || data.title || "");
          }
        }
      } catch (err) {
        console.error("Failed to load school/class names:", err);
      }
    };

    loadNames();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const stats = [
    {
      label: "Punkty",
      value: currentUser?.points || 0,
      icon: Trophy,
      color: "text-yellow-600",
    },
    {
      label: "Odznaki",
      value: earnedBadges.length,
      icon: Star,
      color: "text-purple-600",
    },
    {
      label: "Dni aktywności",
      value: 15,
      icon: Calendar,
      color: "text-blue-600",
    },
  ];

  return (
    <>
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-center text-white dark:bg-gradient-to-r dark:from-green-700 dark:to-emerald-900"
      >
        <div className="relative mb-4 inline-block">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="h-24 w-24 rounded-full border-4 border-white"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20">
              <span className="text-3xl font-bold">
                {currentUser?.displayName?.charAt(0) || "U"}
              </span>
            </div>
          )}
          <div className="absolute -right-2 -bottom-2 rounded-full bg-yellow-400 p-2">
            <Trophy className="h-6 w-6 text-yellow-800" />
          </div>
        </div>

        <h1 className="mb-1 text-2xl font-bold">{currentUser?.displayName}</h1>
        <p className="mb-2 text-green-100">
          {currentUser?.role === "teacher" ? "Nauczyciel" : "Uczeń"}
        </p>

        {/* Verification status */}
        <div className="mb-4 flex items-center justify-center">
          {currentUser?.isVerified ? (
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Zweryfikowany przez nauczyciela</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
              <HelpCircle className="h-4 w-4" />
              <span>Oczekuje weryfikacji</span>
            </div>
          )}
        </div>

        <div className="mt-4 mb-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <School className="mr-1 h-6 w-6" />
            <span className="text-sm">
              {schoolName || "Nie wybrano szkoły"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="mr-1 h-6 w-6" />
            <span className="text-sm">{classNameState}</span>
          </div>
        </div>
      </motion.div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="rounded-2xl bg-white p-4 text-center shadow-lg dark:bg-gray-800"
          >
            <stat.icon className={`mx-auto mb-2 h-8 w-8 ${stat.color}`} />
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          Twoje odznaki
        </h2>

        {earnedBadges.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">🏆</div>
            <p className="text-gray-600 dark:text-gray-300">
              Zdobądź pierwszą odznakę!
            </p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-400">
              Zgłaszaj działania eco, aby zdobywać punkty i odznaki
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`${badge.color} rounded-xl p-4 text-center text-white dark:bg-green-700`}
              >
                <div className="mb-2 text-3xl">{badge.icon}</div>
                <h3 className="mb-1 text-sm font-bold">{badge.name}</h3>
                <p className="text-xs opacity-90">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      {/* Logtout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex cursor-pointer items-center rounded-xl bg-gray-50 p-4 shadow-md transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={handleLogout}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-300">
          <LogOut size={18} />
          Wyloguj
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex cursor-pointer items-center rounded-xl bg-red-50 p-4 shadow-md transition-colors hover:bg-red-100 dark:bg-red-900 dark:hover:bg-red-800"
        onClick={() => {
          setShowDeleteModal(true);
        }}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-300">
          <Trash2 size={18} /> Usuń konto
        </span>
      </motion.div>
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Potwierdź usunięcie"
        description="Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można cofnąć."
        confirmLabel="Usuń konto"
        confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      />
    </>
  );
}
