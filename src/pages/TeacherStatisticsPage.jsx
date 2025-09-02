import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useNavigate } from "react-router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  Users,
  Calendar,
  Award,
  Leaf,
  TrendingUp,
  ArrowLeft,
  BarChart3,
  LeafyGreen,
  CalendarHeart,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import clsx from "clsx";
import ProfilePage from "./ProfilePage";
import ProfilePhoto from "../components/profile/ProfilePhoto";

export default function TeacherStatisticsPage() {
  const { currentUser } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);

  // Załaduj uczniów z klasy nauczyciela i ich statystyki
  useEffect(() => {
    if (!currentUser?.classId) return;

    const loadStudentsStatistics = async () => {
      setLoading(true);
      try {
        // Pobierz informacje o klasie
        const classDoc = await getDoc(doc(db, "classes", currentUser.classId));
        if (classDoc.exists()) {
          const classData = classDoc.data();
          setClassName(classData.name || "");

          // Pobierz informacje o szkole
          if (classData.schoolId) {
            const schoolDoc = await getDoc(
              doc(db, "schools", classData.schoolId),
            );
            if (schoolDoc.exists()) {
              setSchoolName(schoolDoc.data().name || "");
            }
          }
        }

        // Pobierz uczniów z tej klasy
        const studentsQuery = query(
          collection(db, "users"),
          where("classId", "==", currentUser.classId),
          where("role", "==", "student"),
          where("isVerified", "==", true),
        );

        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(studentsData);
      } catch (error) {
        console.error("Error loading students statistics:", error);
        showError("Błąd podczas ładowania statystyk");
      } finally {
        setLoading(false);
      }
    };

    loadStudentsStatistics();
  }, [currentUser?.classId, showError]);

  // Oblicz statystyki całej klasy
  const classStats = students.reduce(
    (acc, student) => {
      const counters = student.counters || {};
      return {
        totalActions: acc.totalActions + (counters.totalActions || 0),
        totalChallenges: acc.totalChallenges + (counters.totalChallenges || 0),
        totalActiveDays: acc.totalActiveDays + (counters.totalActiveDays || 0),
        recyclingActions:
          acc.recyclingActions + (counters.recyclingActions || 0),
        educationActions:
          acc.educationActions + (counters.educationActions || 0),
        savingActions: acc.savingActions + (counters.savingActions || 0),
        transportActions:
          acc.transportActions + (counters.transportActions || 0),
        energyActions: acc.energyActions + (counters.energyActions || 0),
        foodActions: acc.foodActions + (counters.foodActions || 0),
      };
    },
    {
      totalActions: 0,
      totalChallenges: 0,
      totalActiveDays: 0,
      recyclingActions: 0,
      educationActions: 0,
      savingActions: 0,
      transportActions: 0,
      energyActions: 0,
      foodActions: 0,
    },
  );

  const categoryStats = [
    {
      name: "Recykling",
      count: classStats.recyclingActions,
      icon: "♻️",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      name: "Edukacja",
      count: classStats.educationActions,
      icon: "📚",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      name: "Oszczędzanie",
      count: classStats.savingActions,
      icon: "💰",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      name: "Transport",
      count: classStats.transportActions,
      icon: "🚲",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      name: "Energia",
      count: classStats.energyActions,
      icon: "⚡",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      name: "Jedzenie",
      count: classStats.foodActions,
      icon: "🥗",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        emoji="📊"
        title="Statystyki klasy"
        subtitle={`${className} • ${schoolName}`}
      />

      {/* Ogólne statystyki klasy */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
              <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {classStats.totalActions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Wszystkie EkoDziałania
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {classStats.totalChallenges}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Wszystkie EkoWyzwania
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {students.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Aktywnych uczniów
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/20">
              <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {students.length > 0
                  ? Math.round(classStats.totalActions / students.length)
                  : 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Średnia na ucznia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kategorie EkoDziałań */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          EkoDziałania wg kategorii
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {categoryStats.map((category) => (
            <div
              key={category.name}
              className={clsx(
                "rounded-lg p-3 transition-all duration-200 hover:scale-105",
                category.bgColor,
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <div>
                  <p className={clsx("font-medium", category.color)}>
                    {category.count}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {category.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista uczniów */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Uczniowie ({students.length})
        </h3>
        {students.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Brak aktywnych uczniów w klasie
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students
              .sort(
                (a, b) =>
                  (b.counters?.totalActions || 0) -
                  (a.counters?.totalActions || 0),
              )
              .map((student, index) => (
                <div
                  key={student.id}
                  className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50 hover:shadow-lg active:scale-[0.98] dark:border-gray-700 dark:hover:bg-gray-700"
                  onClick={() => navigate(`/teacher/student/${student.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <div
                        className={clsx(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white",
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-orange-500"
                                : "bg-gray-500",
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex flex-1 flex-row items-center justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {student.displayName || student.email}
                          </h4>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1 text-green-500 dark:text-green-400">
                            <LeafyGreen className="h-4 w-4" />
                            <span>EkoDziałań</span>
                            {student.counters?.totalActions || 0}
                          </div>
                          <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400">
                            <CalendarHeart className="h-4 w-4" />
                            <span>EkoWyzwania</span>
                            {student.counters?.totalChallenges || 0}
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400">
                            <Award className="h-4 w-4" />
                            <span>EkoOdznaki</span>
                            {Object.keys(student.earnedBadges || {}).length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
