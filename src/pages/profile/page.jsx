import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

import {
  Trophy,
  Star,
  Calendar,
  School,
  Users,
  Trash2,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { availableBadges } from "../../data/badges";
import { ConfirmModal } from "../../components/modal/ConfirmModal";

export default function ProfilePage() {
  const { currentUser, logout, deleteAccount } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    (badge) => (currentUser?.points || 0) >= badge.pointsRequired
  );

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
    <div className="flex flex-col gap-6 p-4 pb-20 justify-normal">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-center text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl"
      >
        <div className="relative inline-block mb-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="w-24 h-24 border-4 border-white rounded-full"
            />
          ) : (
            <div className="flex items-center justify-center w-24 h-24 border-4 border-white rounded-full bg-white/20">
              <span className="text-3xl font-bold">
                {currentUser?.displayName?.charAt(0) || "U"}
              </span>
            </div>
          )}
          <div className="absolute p-2 bg-yellow-400 rounded-full -bottom-2 -right-2">
            <Trophy className="w-6 h-6 text-yellow-800" />
          </div>
        </div>

        <h1 className="mb-1 text-2xl font-bold">{currentUser?.displayName}</h1>
        <p className="mb-2 text-green-100">
          {currentUser?.isGuest
            ? "Użytkownik gość"
            : currentUser?.role === "teacher"
            ? "Nauczyciel"
            : "Uczeń"}
        </p>

        <div className="flex items-center justify-center mt-4 space-x-4">
          {!currentUser?.isGuest && (
            <>
              <div className="flex items-center">
                <School className="w-4 h-4 mr-1" />
                <span className="text-sm">{currentUser?.school}</span>
              </div>
              {currentUser?.className && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    Klasa {currentUser?.className}
                  </span>
                </div>
              )}
            </>
          )}
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
            className="p-4 text-center bg-white shadow-lg rounded-2xl"
          >
            <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-white shadow-lg rounded-2xl"
      >
        <h2 className="mb-4 text-xl font-bold text-gray-800">Twoje odznaki</h2>

        {currentUser?.isGuest ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">👤</div>
            <p className="text-gray-600">Tryb gościa</p>
            <p className="mt-2 text-sm text-gray-400">
              Zaloguj się, aby zdobywać punkty i odznaki
            </p>
          </div>
        ) : earnedBadges.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">🏆</div>
            <p className="text-gray-600">Zdobądź pierwszą odznakę!</p>
            <p className="mt-2 text-sm text-gray-400">
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
                className={`${badge.color} rounded-xl p-4 text-white text-center`}
              >
                <div className="mb-2 text-3xl">{badge.icon}</div>
                <h3 className="mb-1 text-sm font-bold">{badge.name}</h3>
                <p className="text-xs opacity-90">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Available Badges - Hidden for guests */}
      {!currentUser?.isGuest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-white shadow-lg rounded-2xl"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Odznaki do zdobycia
          </h2>

          <div className="space-y-3">
            {availableBadges
              .filter(
                (badge) => (currentUser?.points || 0) < badge.pointsRequired
              )
              .map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-center p-4 bg-gray-50 rounded-xl"
                >
                  <div className="mr-4 text-2xl opacity-50">{badge.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1 text-xs text-gray-500">
                        <span>
                          {currentUser?.points || 0} / {badge.pointsRequired}{" "}
                          pkt
                        </span>
                        <span>
                          {Math.round(
                            ((currentUser?.points || 0) /
                              badge.pointsRequired) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 transition-all duration-500 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                          style={{
                            width: `${Math.min(
                              ((currentUser?.points || 0) /
                                badge.pointsRequired) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Logtout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center p-4 transition-colors shadow-md cursor-pointer bg-gray-50 rounded-xl hover:bg-gray-100"
        onClick={handleLogout}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <LogOut size={18} />
          Wyloguj
        </span>
      </motion.div>

      {/* Delete Account Button - Hidden for guests */}
      {!currentUser?.isGuest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex items-center p-4 transition-colors shadow-md cursor-pointer bg-red-50 rounded-xl hover:bg-red-100"
          onClick={() => {
            setShowDeleteModal(true);
          }}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <Trash2 size={18} /> Usuń konto
          </span>
        </motion.div>
      )}

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Potwierdź usunięcie"
        description="Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można cofnąć."
        confirmLabel="Usuń konto"
        confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
}
