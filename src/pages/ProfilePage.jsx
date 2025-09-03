import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  School,
  Users,
  LogOut,
  CheckCircle,
  ArrowRight,
  Edit2,
  LeafyGreen,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { getSchoolName, getClassName } from "../services/nameCache";
import {
  getBadgeTemplates,
  calculateBadgeProgress,
  getRecentBadgesForProfile,
} from "../services/badgeService";
import Badge, { BadgeModal } from "../components/ui/Badge";
import ProfilePhoto from "../components/profile/ProfilePhoto";
import Button from "../components/ui/Button";
import clsx from "clsx";

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const [schoolName, setSchoolName] = useState("");
  const [classNameState, setClassNameState] = useState("");
  const [badgeProgress, setBadgeProgress] = useState([]);
  const [recentBadges, setRecentBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Cache badge templates so we don't refetch them on every user change
  const badgeTemplatesRef = useRef(null);

  const handleBadgeClick = useCallback((badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBadge(null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [logout]);

  // Pobierz postęp odznak z bazy danych (memoized, używa cache dla szablonów)
  const loadBadgeProgress = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      if (!badgeTemplatesRef.current) {
        badgeTemplatesRef.current = await getBadgeTemplates();
      }

      const progress = calculateBadgeProgress(
        currentUser.counters || {},
        currentUser.earnedBadges || {},
        badgeTemplatesRef.current,
      );
      setBadgeProgress(progress);

      // Pobierz ostatnie 3 odznaki do wyświetlenia na profilu
      const recent = getRecentBadgesForProfile(
        progress,
        currentUser.earnedBadges || {},
      );
      setRecentBadges(recent);
    } catch (error) {
      console.error("Error loading badge progress:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadBadgeProgress();
  }, [loadBadgeProgress]);

  // Filtruj odznaki: pokazuj zdobyte + te w trakcie zdobywania (mają jakiś postęp)
  const displayBadges = useMemo(
    () =>
      badgeProgress.filter((badge) => badge.isEarned || badge.currentCount > 0),
    [badgeProgress],
  );

  // Statystyki zdobytych odznak
  const earnedBadgesCount = useMemo(
    () => badgeProgress.filter((badge) => badge.isEarned).length,
    [badgeProgress],
  );

  // Ładuje czytelne nazwy szkoły/klasy, używając cache (localStorage + pamięć)
  useEffect(() => {
    let mounted = true;
    const loadNames = async () => {
      if (!currentUser) return;

      setSchoolName("");
      setClassNameState("");

      try {
        if (currentUser.schoolId) {
          const sName = await getSchoolName(currentUser.schoolId);
          if (mounted) setSchoolName(sName || "");
        }

        if (currentUser.classId) {
          const cName = await getClassName(currentUser.classId);
          if (mounted) setClassNameState(cName || "");
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

  const stats = useMemo(
    () => [
      {
        label: "Dni aktywności",
        value: currentUser?.counters?.totalActiveDays || 0,
        icon: Calendar,
        color: "text-blue-600",
      },
      {
        label: "Zdobyte Odznaki",
        value: earnedBadgesCount,
        icon: Award,
        color: "text-purple-600",
      },
      {
        label: "EkoDziałania",
        value: currentUser?.counters?.totalActions || 0,
        icon: LeafyGreen,
        color: "text-green-600",
      },
    ],
    [currentUser, earnedBadgesCount],
  );

  return (
    <>
      <div className="space-y-4 md:grid md:grid-cols-3 md:gap-6">
        {/* Left column: Profile header (stays full-width on mobile) */}
        <div className="md:col-span-1">
          <div className="flex flex-col rounded-3xl bg-gray-500 p-6 text-center text-white md:text-left dark:bg-gray-700">
            <div className="mb-2 flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-start">
              <ProfilePhoto currentUser={currentUser} />

              <div className="flex-1 text-left">
                <h1 className="mb-1 text-2xl font-bold">
                  {currentUser?.displayName}
                </h1>
                <p className="mb-2 text-green-100">
                  {currentUser?.role === "teacher" ? "Nauczyciel" : "Uczeń"}
                </p>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <School className="mr-1 h-6 w-6" />
                <span className="text-sm">{schoolName || ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="mr-1 h-6 w-6" />
                <span className="text-sm">{classNameState}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                size="sx"
                style="lightBlue"
                icon={Edit2}
                onClick={() => navigate("/profile/edit")}
                className="!w-fit"
              >
                Edytuj profil
              </Button>

              <Button
                size="sx"
                style="gray"
                icon={LogOut}
                onClick={handleLogout}
                className="!w-fit"
              >
                Wyloguj się
              </Button>
            </div>
          </div>
        </div>

        {/* Right column: stats, quick actions, badges */}
        <div className="flex flex-col gap-4 md:col-span-2">
          {currentUser.role === "teacher" ? null : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white p-4 text-center shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl dark:bg-gray-800"
                  >
                    <stat.icon
                      className={clsx("mx-auto mb-2 h-8 w-8", stat.color)}
                    />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/profile/submissions")}
                  className="flex items-center justify-center gap-3 rounded-xl bg-white p-4 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-left font-semibold text-gray-800 dark:text-white">
                    Moje zgłoszenia
                  </p>
                </button>
                <button
                  onClick={() => navigate("/profile/badges")}
                  className="flex items-center justify-center gap-3 rounded-xl bg-white p-4 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-700">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-left font-semibold text-gray-800 dark:text-white">
                    Moje Odznaki
                  </p>
                </button>
              </div>

              {/* Badges Section */}
              <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Ostatnie odznaki
                  </h2>
                  <button
                    onClick={() => navigate("/profile/badges")}
                    className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  >
                    Zobacz wszystkie
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {!loading && recentBadges.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Jeszcze nie zdobyłeś żadnych odznak. Zacznij wykonywać
                      EkoDziałania!
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {recentBadges.map((badge, index) => {
                    return (
                      <Badge
                        {...badge}
                        key={badge.id}
                        onClick={() => handleBadgeClick(badge)}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal szczegółów odznaki */}
      <BadgeModal
        badge={selectedBadge}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
