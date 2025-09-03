import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";
import EcoCategoriesStats from "../../components/badges/EcoCategoriesStats";

export default function EkoskopStatisticsPage() {
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalActions: 0,
    totalChallenges: 0,
    totalSubmissions: 0,
  });
  const [categoryStats, setCategoryStats] = useState({});
  const [schoolStats, setSchoolStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      // Pobierz podstawowe statystyki
      const [
        schoolsSnapshot,
        classesSnapshot,
        usersSnapshot,
        submissionsSnapshot,
        ecoActionsSnapshot,
        challengesSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "schools")),
        getDocs(collection(db, "classes")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "submissions")),
        getDocs(collection(db, "ecoActions")),
        getDocs(collection(db, "ecoChallenges")),
      ]);

      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const students = users.filter((user) => user.role === "student");
      const teachers = users.filter((user) => user.role === "teacher");
      const submissions = submissionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Oblicz statystyki kategorii na podstawie liczników użytkowników
      const globalCounters = students.reduce(
        (acc, student) => {
          const counters = student.counters || {};
          acc.recyclingActions += counters.recyclingActions || 0;
          acc.educationActions += counters.educationActions || 0;
          acc.savingActions += counters.savingActions || 0;
          acc.transportActions += counters.transportActions || 0;
          acc.energyActions += counters.energyActions || 0;
          acc.foodActions += counters.foodActions || 0;
          return acc;
        },
        {
          recyclingActions: 0,
          educationActions: 0,
          savingActions: 0,
          transportActions: 0,
          energyActions: 0,
          foodActions: 0,
        },
      );

      // Oblicz statystyki per szkoła
      const schoolsData = schoolsSnapshot.docs.map((schoolDoc) => {
        const schoolId = schoolDoc.id;
        const schoolData = schoolDoc.data();

        const schoolStudents = students.filter(
          (student) => student.schoolId === schoolId,
        );
        const schoolClasses = classesSnapshot.docs.filter(
          (classDoc) => classDoc.data().schoolId === schoolId,
        ).length;

        const schoolActions = schoolStudents.reduce(
          (sum, student) => sum + (student.counters?.totalActions || 0),
          0,
        );

        return {
          id: schoolId,
          name: schoolData.name,
          address: schoolData.address,
          studentCount: schoolStudents.length,
          classCount: schoolClasses,
          totalActions: schoolActions,
        };
      });

      setStats({
        totalSchools: schoolsSnapshot.size,
        totalClasses: classesSnapshot.size,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalActions:
          globalCounters.recyclingActions +
          globalCounters.educationActions +
          globalCounters.savingActions +
          globalCounters.transportActions +
          globalCounters.energyActions +
          globalCounters.foodActions,
        totalChallenges: challengesSnapshot.size,
        totalSubmissions: submissions.length,
      });

      setCategoryStats(globalCounters);
      setSchoolStats(
        schoolsData.sort((a, b) => b.totalActions - a.totalActions),
      );
    } catch (error) {
      console.error("Error loading statistics:", error);
      showError("Nie udało się załadować statystyk");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statystyki globalne"
        subtitle="Przegląd aktywności wszystkich szkół w systemie"
      />

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Szkoły</p>
              <p className="text-3xl font-bold">{stats.totalSchools}</p>
            </div>
            <div className="text-4xl opacity-80">🏫</div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Klasy</p>
              <p className="text-3xl font-bold">{stats.totalClasses}</p>
            </div>
            <div className="text-4xl opacity-80">📚</div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Uczniowie</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="text-4xl opacity-80">👨‍🎓</div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Nauczyciele</p>
              <p className="text-3xl font-bold">{stats.totalTeachers}</p>
            </div>
            <div className="text-4xl opacity-80">👩‍🏫</div>
          </div>
        </div>
      </div>

      {/* Activity Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">EkoDziałania</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalActions}
              </p>
            </div>
            <div className="text-3xl">🌱</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">EkoWyzwania</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalChallenges}
              </p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Zgłoszenia</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalSubmissions}
              </p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Statystyki kategorii (wszystkie szkoły)
        </h3>
        <EcoCategoriesStats
          userCounters={categoryStats}
          showGrid={true}
          title=""
        />
      </div>

      {/* School Rankings */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Ranking szkół
        </h3>

        {schoolStats.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Brak danych o szkołach
          </div>
        ) : (
          <div className="space-y-3">
            {schoolStats.map((school, index) => (
              <div
                key={school.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                          ? "bg-gray-400"
                          : index === 2
                            ? "bg-amber-600"
                            : "bg-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {school.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {school.studentCount} uczniów • {school.classCount} klas
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {school.totalActions}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    EkoDziałań
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
