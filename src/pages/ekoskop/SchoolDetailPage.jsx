import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";
import EcoCategoriesStats from "../../components/badges/EcoCategoriesStats";
import { Copy, Edit, Mail, Phone } from "lucide-react";
import NavButton from "../../components/ui/NavButton";
import clsx from "clsx";

export default function SchoolDetailPage() {
  const { schoolId } = useParams();
  const [school, setSchool] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (schoolId) {
      loadSchoolDetails();
    }
  }, [schoolId]);

  const loadSchoolDetails = async () => {
    try {
      setLoading(true);

      // Pobierz dane szkoły
      const schoolDoc = await getDoc(doc(db, "schools", schoolId));
      if (!schoolDoc.exists()) {
        showError("Nie znaleziono szkoły");
        return;
      }

      const schoolData = { id: schoolDoc.id, ...schoolDoc.data() };
      setSchool(schoolData);

      // Pobierz klasy w szkole
      const classesSnapshot = await getDocs(
        query(collection(db, "classes"), where("schoolId", "==", schoolId)),
      );
      const classesData = classesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classesData);

      // Pobierz wszystkich użytkowników w szkole - uproszczone zapytanie
      const allUsersSnapshot = await getDocs(
        query(collection(db, "users"), where("schoolId", "==", schoolId)),
      );

      const allUsers = allUsersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtruj w pamięci zamiast w bazie danych
      const studentsData = allUsers.filter((user) => user.role === "student");
      const teachersData = allUsers.filter((user) => user.role === "teacher");

      setStudents(studentsData);
      setTeachers(teachersData);

      // Oblicz statystyki
      const schoolStats = calculateSchoolStats(studentsData, classesData);
      setStats(schoolStats);
    } catch (error) {
      console.error("Error loading school details:", error);
      showError("Nie udało się załadować szczegółów szkoły");
    } finally {
      setLoading(false);
    }
  };

  const calculateSchoolStats = (students, classes) => {
    const totalStudents = students.length;
    const totalClasses = classes.length;

    // Oblicz łączne statystyki
    const totalCounters = students.reduce(
      (acc, student) => {
        const counters = student.counters || {};
        acc.totalActions += counters.totalActions || 0;
        acc.totalChallenges += counters.totalChallenges || 0;
        acc.recyclingActions += counters.recyclingActions || 0;
        acc.educationActions += counters.educationActions || 0;
        acc.savingActions += counters.savingActions || 0;
        acc.transportActions += counters.transportActions || 0;
        acc.energyActions += counters.energyActions || 0;
        acc.foodActions += counters.foodActions || 0;
        return acc;
      },
      {
        totalActions: 0,
        totalChallenges: 0,
        recyclingActions: 0,
        educationActions: 0,
        savingActions: 0,
        transportActions: 0,
        energyActions: 0,
        foodActions: 0,
      },
    );

    // Statystyki per klasa
    const classStats = classes
      .map((classData) => {
        const classStudents = students.filter(
          (s) => s.classId === classData.id,
        );
        const classActions = classStudents.reduce(
          (sum, student) => sum + (student.counters?.totalActions || 0),
          0,
        );

        return {
          ...classData,
          studentCount: classStudents.length,
          totalActions: classActions,
        };
      })
      .sort((a, b) => b.totalActions - a.totalActions);

    // Top studenci
    const topStudents = students
      .map((student) => ({
        ...student,
        totalActions: student.counters?.totalActions || 0,
      }))
      .sort((a, b) => b.totalActions - a.totalActions)
      .slice(0, 10);

    return {
      totalStudents,
      totalClasses,
      totalCounters,
      classStats,
      topStudents,
    };
  };

  const getClassName = (classId) => {
    const classData = classes.find((c) => c.id === classId);
    return classData?.name || "Nieznana klasa";
  };

  if (loading) {
    return <Loading />;
  }

  if (!school) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🏫</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Nie znaleziono szkoły
          </h3>
          <Link
            to="/ekoskop/schools"
            className="text-green-600 hover:text-green-500"
          >
            Powrót do listy szkół
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <PageHeader emoji="🏫" title={school.name} subtitle={school.address} />

        <NavButton
          href={`/ekoskop/schools/edit/${schoolId}`}
          style="lightBlue"
          icon={Edit}
          fullWidth={false}
          size="sm"
        >
          Edytuj szkołę
        </NavButton>
      </div>
      {/* School Info */}
      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Podsumowanie
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div className="bgp-gray-50 rounded-lg p-4 text-center dark:bg-gray-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalClasses}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {stats.totalClasses === 1 ? "Klasa" : "Klasy"}
            </div>
          </div>

          <div className="bgp-gray-50 rounded-lg p-4 text-center dark:bg-gray-700">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.totalStudents}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Uczniów</div>
          </div>

          <div className="bgp-gray-50 rounded-lg p-4 text-center dark:bg-gray-700">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {teachers.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Nauczycieli</div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-center sm:col-span-3 dark:bg-gray-700">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.totalCounters?.totalActions || 0}
            </div>
            <div className="text-gray-600 dark:text-gray-400">EkoDziałań</div>
          </div>
        </div>
      </div>
      {/* Category Statistics */}
      {stats.totalCounters && (
        <EcoCategoriesStats
          title="Statystyki kategorii EkoDziałań"
          userCounters={stats.totalCounters}
          showGrid={true}
        />
      )}

      {/* Contact */}
      {(school.email || school.phone) && (
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Kontakt
          </h3>
          {school.email && (
            <span
              onClick={() => {
                navigator.clipboard.writeText(school.email);
                showSuccess("Adres email skopiowany do schowka!");
              }}
              className="group mb-4 flex cursor-pointer items-center justify-center rounded-lg bg-gray-50 px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
            >
              <span className="flex flex-1 gap-2">
                <Mail className="group-hover:text-gray-300" /> {school.email}
              </span>
              <Copy className="group-hover:text-gray-300" />
            </span>
          )}
          {school.phone && (
            <span
              onClick={() => {
                navigator.clipboard.writeText(school.phone);
                showSuccess("Numer telefonu skopiowany do schowka!");
              }}
              className="group flex cursor-pointer items-center justify-center rounded-lg bg-gray-50 px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
            >
              <span className="flex flex-1 gap-2">
                <Phone className="group-hover:text-gray-300" /> {school.phone}
              </span>
              <Copy className="group-hover:text-gray-300" />
            </span>
          )}
        </div>
      )}
      {/* Class Rankings */}
      {stats.classStats && stats.classStats.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Ranking klas
          </h3>
          <div className="space-y-3">
            {stats.classStats.map((classData, index) => (
              <div
                key={classData.id}
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
                      {classData.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {classData.studentCount} uczniów
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {classData.totalActions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    EkoDziałań
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Top Students */}
      {stats.topStudents && stats.topStudents.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Najaktywniejszi uczniowie
          </h3>
          <div className="space-y-3">
            {stats.topStudents.slice(0, 5).map((student, index) => (
              <div
                key={student.id}
                className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={() => navigate(`/teacher/student/${student.id}`)}
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
                      {student.displayName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getClassName(student.classId)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {student.totalActions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    EkoDziałań
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
