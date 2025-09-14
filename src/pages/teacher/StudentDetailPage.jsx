import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate, useParams } from "react-router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  Calendar,
  Award,
  Leaf,
  TrendingUp,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { useBadges } from "../../hooks/useBadges";
import BadgesStats from "../../components/badges/BadgesStats";
import EcoCategoriesStats from "../../components/badges/EcoCategoriesStats";
import clsx from "clsx";

export default function StudentDetailPage() {
  const { currentUser } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook do zarządzania odznakamii ucznia
  const {
    badgeProgress,
    loading: badgesLoading,
    stats: badgeStats,
    earnedBadges,
  } = useBadges(student);

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBadge(null);
  };

  // Załaduj dane ucznia i jego zgłoszenia
  useEffect(() => {
    if (!currentUser?.classId || !studentId) return;
    const loadStudentData = async () => {
      setLoading(true);
      try {
        // Pobierz dane ucznia
        const studentDoc = await getDoc(doc(db, "users", studentId));
        if (!studentDoc.exists()) {
          showError("Nie znaleziono ucznia");
          navigate("/teacher/statistics");
          return;
        }

        const studentData = { id: studentDoc.id, ...studentDoc.data() };

        // Sprawdź czy uczeń należy do klasy nauczyciela
        if (studentData.classId !== currentUser.classId) {
          showError("Brak uprawnień do przeglądania tego ucznia");
          navigate("/teacher/statistics");
          return;
        }
        setStudent(studentData);

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

        // Pobierz zgłoszenia ucznia
        setSubmissionsLoading(true);
        const submissionsQuery = query(
          collection(db, "submissions"),
          where("studentId", "==", studentId),
          limit(50),
        );

        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissionsData = submissionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Sortowanie po stronie klienta
        submissionsData.sort((a, b) => {
          const dateA = a.createdAt || new Date(0);
          const dateB = b.createdAt || new Date(0);
          return dateB - dateA;
        });

        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error loading student data:", error);
        showError("Błąd podczas ładowania danych ucznia");
      } finally {
        setLoading(false);
        setSubmissionsLoading(false);
      }
    };

    loadStudentData();
  }, [currentUser?.classId, studentId, showError, navigate]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("pl", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          text: "Zatwierdzone",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
        };
      case "rejected":
        return {
          icon: XCircle,
          text: "Odrzucone",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
        };
      default:
        return {
          icon: Clock,
          text: "Oczekuje",
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <User className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Nie znaleziono ucznia
          </p>
        </div>
      </div>
    );
  }

  const studentCounters = student.counters || {};

  return (
    <>
      {/* Header z powrotem */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {student.displayName || student.email}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {className} • {schoolName}
          </p>
        </div>
      </div>

      {/* Podstawowe statystyki ucznia */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
              <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {studentCounters.totalActions || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                EkoDziałania
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
                {studentCounters.totalChallenges || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                EkoWyzwania
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {studentCounters.totalActiveDays || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dni aktywności
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
              <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {badgeStats.earned}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Odznaki
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statystyki odznak */}
      <div className="">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Odznaki ucznia
        </h3>
        <BadgesStats stats={badgeStats} showFilters={false} />
      </div>

      {/* Zdobyte odznaki ucznia */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Zdobyte odznaki ({badgeStats.earned})
        </h3>
        {!badgesLoading && earnedBadges.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Uczeń nie zdobył jeszcze żadnych odznak
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {earnedBadges.slice(0, 6).map((badge, index) => {
            const maxLvl = badge.template?.levels
              ? Object.keys(badge.template.levels).length
              : null;

            return (
              <Badge
                key={badge.id || index}
                icon={
                  badge.currentLevelData?.icon ||
                  badge.nextLevelData?.icon ||
                  "🏅"
                }
                name={badge.name}
                description={badge.description}
                lvl={badge.currentLevel}
                maxLvl={maxLvl}
                progress={badge.progress}
                progressText={badge.progressText}
                nextLevelData={badge.nextLevelData}
                isEarned={badge.isEarned}
                badgeImage={
                  badge.currentLevelData?.image || badge.nextLevelData?.image
                }
                onClick={() => handleBadgeClick(badge)}
              />
            );
          })}
        </div>

        {badgesLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-gray-200 p-4 dark:bg-gray-600"
              >
                <div className="mb-3 flex justify-center">
                  <div className="h-12 w-12 rounded-xl bg-gray-300 dark:bg-gray-500" />
                </div>
                <div className="h-4 rounded bg-gray-300 dark:bg-gray-500" />
                <div className="mt-2 h-3 rounded bg-gray-300 dark:bg-gray-500" />
              </div>
            ))}
          </div>
        )}
        {earnedBadges.length > 6 && (
          <div className="mt-4 text-center">
            <Button
              onClick={() => navigate(`/teacher/student/${studentId}/badges`)}
              className="text-sm text-green-600 hover:text-green-700 dark:text-green-400"
            >
              Zobacz wszystkie odznaki ({badgeStats.earned})
            </Button>
          </div>
        )}
      </div>

      {/* Kategorie EkoDziałań ucznia */}
      <div className="">
        <EcoCategoriesStats
          userCounters={student.counters || {}}
          title="EkoDziałania wg kategorii"
          showGrid={true}
        />
      </div>

      {/* Ostatnie zgłoszenia ucznia */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Ostatnie zgłoszenia ({submissions.length})
        </h3>
        {submissionsLoading ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Ładowanie zgłoszeń...
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Brak zgłoszeń od tego ucznia
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 10).map((submission) => {
              const statusInfo = getStatusInfo(submission.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={submission.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        EkoDziałanie
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(submission.createdAt)}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                        statusInfo.bgColor,
                        statusInfo.color,
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.text}
                    </div>
                  </div>

                  {submission.comment && (
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      {submission.comment}
                    </p>
                  )}

                  {submission.photoUrls && submission.photoUrls.length > 0 && (
                    <div className="flex gap-2">
                      {submission.photoUrls.slice(0, 3).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Zdjęcie ${index + 1}`}
                          className="h-16 w-16 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ))}
                      {submission.photoUrls.length > 3 && (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            +{submission.photoUrls.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {submissions.length > 10 && (
              <div className="pt-2 text-center">
                <Button
                  onClick={() =>
                    navigate(`/teacher/submissions?student=${studentId}`)
                  }
                  className="text-sm text-green-600 hover:text-green-700 dark:text-green-400"
                >
                  Zobacz wszystkie zgłoszenia ({submissions.length})
                </Button>
              </div>
            )}
          </div>
        )}
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
