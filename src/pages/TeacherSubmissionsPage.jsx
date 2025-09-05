import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useNavigate, useSearchParams } from "react-router";
import { useRegisterRefresh } from "../contexts/RefreshContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { getEcoActions } from "../services/ecoActionService";
import { getEcoChallenges } from "../services/ecoChallengeService";
import {
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import PullToRefreshWrapper from "../components/ui/PullToRefreshWrapper";
import clsx from "clsx";

// Cache konfiguracja
const CACHE_TTL = 5 * 60 * 1000; // 5 minut
const submissionsCache = new Map();

export default function TeacherSubmissionsPage() {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [submissions, setSubmissions] = useState([]);
  const [ecoActions, setEcoActions] = useState([]);
  const [ecoChallenges, setEcoChallenges] = useState([]);
  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedType, setSelectedType] = useState("actions"); // "actions" lub "challenges"
  const [lastRefresh, setLastRefresh] = useState(null);

  // Paginacja
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sprawdź czy filtrujemy po konkretnym uczniu
  const filterByStudent = searchParams.get("student");

  // Funkcje cache
  const getCacheKey = useCallback((classId, studentId = null) => {
    return `teacher_submissions_${classId}_${studentId || "all"}`;
  }, []);

  const getCachedData = useCallback((key) => {
    const cached = submissionsCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      submissionsCache.delete(key);
      return null;
    }

    return cached.data;
  }, []);

  const setCachedData = useCallback((key, data) => {
    const timestamp = Date.now();
    submissionsCache.set(key, {
      data,
      timestamp,
    });
    setLastRefresh(timestamp);
  }, []);

  // Funkcja ładowania danych z cache lub API
  const loadSubmissions = useCallback(
    async (forceRefresh = false) => {
      if (!currentUser?.classId) return;

      const cacheKey = getCacheKey(currentUser.classId, filterByStudent);

      // Sprawdź cache jeśli nie wymuszamy odświeżenia
      if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached !== null) {
          setSubmissions(cached.submissions);
          setEcoActions(cached.ecoActions);
          setEcoChallenges(cached.ecoChallenges);
          setClassName(cached.className);
          setSchoolName(cached.schoolName);

          // Ustaw timestamp ostatniego odświeżenia z cache
          const cacheEntry = submissionsCache.get(cacheKey);
          if (cacheEntry) {
            setLastRefresh(cacheEntry.timestamp);
          }
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      try {
        // Pobierz dane EkoDziałań
        const ecoActionsData = await getEcoActions();
        setEcoActions(ecoActionsData);

        // Pobierz dane EkoWyzwań
        const challengesData = await getEcoChallenges();
        setEcoChallenges(challengesData);

        // Pobierz informacje o klasie
        const classDoc = await getDoc(doc(db, "classes", currentUser.classId));
        let classNameData = "";
        let schoolNameData = "";

        if (classDoc.exists()) {
          const classData = classDoc.data();
          classNameData = classData.name || "";
          setClassName(classNameData);

          // Pobierz informacje o szkole
          if (classData.schoolId) {
            const schoolDoc = await getDoc(
              doc(db, "schools", classData.schoolId),
            );
            if (schoolDoc.exists()) {
              schoolNameData = schoolDoc.data().name || "";
              setSchoolName(schoolNameData);
            }
          }
        }

        // Pobierz wszystkie zgłoszenia z tej klasy (zarówno EkoDziałania jak i EkoWyzwania)
        let allSubmissionsQuery = query(
          collection(db, "submissions"),
          where("classId", "==", currentUser.classId),
          limit(100),
        );

        // Jeśli filtrujemy po konkretnym uczniu
        if (filterByStudent) {
          allSubmissionsQuery = query(
            collection(db, "submissions"),
            where("studentId", "==", filterByStudent),
            limit(100),
          );
        }

        const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);
        const allSubmissionsData = allSubmissionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          reviewedAt: doc.data().reviewedAt?.toDate() || null,
        }));

        // Sortowanie po stronie klienta
        allSubmissionsData.sort((a, b) => {
          const dateA = a.createdAt || new Date(0);
          const dateB = b.createdAt || new Date(0);
          return dateB - dateA;
        });

        setSubmissions(allSubmissionsData);

        // Zapisz do cache
        const cacheData = {
          submissions: allSubmissionsData,
          ecoActions: ecoActionsData,
          ecoChallenges: challengesData,
          className: classNameData,
          schoolName: schoolNameData,
        };
        setCachedData(cacheKey, cacheData);
      } catch (error) {
        console.error("Error loading submissions:", error);
        showError("Błąd podczas ładowania zgłoszeń");
      } finally {
        setLoading(false);
      }
    },
    [
      currentUser?.classId,
      filterByStudent,
      showError,
      getCacheKey,
      getCachedData,
      setCachedData,
    ],
  );

  // Funkcja odświeżania dla pull-to-refresh i globalnego systemu
  const refreshAll = useCallback(async () => {
    await loadSubmissions(true);
  }, [loadSubmissions]);

  // Rejestracja w globalnym systemie odświeżania
  useRegisterRefresh("teacher-submissions", refreshAll);

  // Załaduj zgłoszenia EkoDziałań
  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Funkcja do czyszczenia cache
  const clearCache = useCallback(() => {
    submissionsCache.clear();
  }, []);

  // Formatowanie ostatniego odświeżenia
  const formatLastRefresh = useMemo(() => {
    if (!lastRefresh) return null;

    const now = Date.now();
    const diffMinutes = Math.floor((now - lastRefresh) / (1000 * 60));

    if (diffMinutes < 1) return "przed chwilą";
    if (diffMinutes === 1) return "1 min temu";
    if (diffMinutes < 60) return `${diffMinutes} min temu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 godz. temu";
    return `${diffHours} godz. temu`;
  }, [lastRefresh]);

  // Znajdź EkoDziałanie po ID
  const getEcoActionById = (ecoActivityId) => {
    return ecoActions.find((action) => action.id === ecoActivityId);
  };

  // Znajdź EkoWyzwanie po ID
  const getChallengeById = (challengeId) => {
    return ecoChallenges.find((challenge) => challenge.id === challengeId);
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

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("pl", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getCurrentSubmissions = () => {
    return submissions.filter((submission) => {
      if (selectedType === "actions") {
        return submission.type === "eco_action";
      } else {
        return submission.type === "challenge";
      }
    });
  };

  const filteredSubmissions = getCurrentSubmissions().filter((submission) => {
    if (selectedTab === "pending")
      return !submission.status || submission.status === "pending";
    if (selectedTab === "approved") return submission.status === "approved";
    if (selectedTab === "rejected") return submission.status === "rejected";
    return true;
  });

  // Paginacja
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  // Reset paginacji przy zmianie taba lub typu
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, selectedType]);

  const currentSubmissions = getCurrentSubmissions();
  const pendingCount = currentSubmissions.filter(
    (s) => !s.status || s.status === "pending",
  ).length;
  const approvedCount = currentSubmissions.filter(
    (s) => s.status === "approved",
  ).length;
  const rejectedCount = currentSubmissions.filter(
    (s) => s.status === "rejected",
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <PullToRefreshWrapper onRefresh={refreshAll} threshold={80} enabled={true}>
      <PageHeader
        emoji="✅"
        title={filterByStudent ? "Zgłoszenia ucznia" : "Weryfikacja zgłoszeń"}
        subtitle={`${className} • ${schoolName}`}
      />

      {/* Selector typu zgłoszeń */}
      <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-gray-800">
        <div className="flex">
          {[
            { id: "actions", label: "EkoDziałania", icon: "🌱" },
            { id: "challenges", label: "EkoWyzwania", icon: "🏆" },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setSelectedType(id)}
              className={clsx(
                "flex flex-1 items-center justify-center rounded-lg px-4 py-3 transition-all duration-200",
                selectedType === id
                  ? "bg-blue-500 text-white shadow-lg dark:bg-blue-700"
                  : "text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400",
              )}
            >
              <span className="mr-2">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl bg-white p-2 shadow-sm dark:bg-gray-800">
        <div className="flex">
          {[
            { id: "pending", label: "Nowe", count: pendingCount },
            { id: "approved", label: "Zatwierdzone", count: approvedCount },
            { id: "rejected", label: "Odrzucone", count: rejectedCount },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className={clsx(
                "flex flex-1 items-center justify-center rounded-lg px-2 py-1 transition-all duration-200",
                selectedTab === id
                  ? "bg-green-500 text-white shadow-lg dark:bg-green-700"
                  : "text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400",
              )}
            >
              <span className="text-sm font-medium">
                {label} ({count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista zgłoszeń */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
            <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {selectedTab === "pending"
                ? `Brak nowych ${selectedType === "actions" ? "EkoDziałań" : "EkoWyzwań"} do weryfikacji`
                : `Brak ${selectedTab === "approved" ? "zatwierdzonych" : "odrzuconych"} ${selectedType === "actions" ? "EkoDziałań" : "EkoWyzwań"}`}
            </p>
          </div>
        ) : (
          <>
            {paginatedSubmissions.map((submission) => {
              const statusInfo = getStatusInfo(submission.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={submission.id}
                  className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {submission.studentName || "Nieznany uczeń"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {formatDate(submission.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full p-2 text-sm",
                        statusInfo.bgColor,
                        statusInfo.color,
                      )}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {/* {statusInfo.text} */}
                    </div>
                  </div>
                  {/* Szczegóły EkoDziałania lub EkoWyzwania */}
                  <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <h4 className="mb-2 font-medium text-gray-800 dark:text-white">
                      {selectedType === "actions"
                        ? "EkoDziałanie"
                        : "EkoWyzwanie"}
                    </h4>
                    {selectedType === "actions"
                      ? (() => {
                          const ecoAction = getEcoActionById(
                            submission.ecoActivityId,
                          );
                          if (ecoAction) {
                            return (
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                                  style={{
                                    backgroundColor: ecoAction.style.color,
                                  }}
                                >
                                  <span className="text-lg">
                                    {ecoAction.style.icon}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-white">
                                    {ecoAction.name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {ecoAction.category}
                                  </p>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                ID: {submission.ecoActivityId}
                              </p>
                            );
                          }
                        })()
                      : (() => {
                          const challenge = getChallengeById(
                            submission.ecoActivityId,
                          );
                          if (challenge) {
                            return (
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white">
                                  <span className="text-lg">🏆</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-white">
                                    {challenge.challengeName || challenge.name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {challenge.category || "EkoWyzwanie"}
                                  </p>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                ID: {submission.ecoActivityId}
                              </p>
                            );
                          }
                        })()}
                  </div>
                  {/* Komentarz ucznia */}
                  {submission.comment && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Komentarz ucznia:
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {submission.comment.length > 256
                          ? submission.comment.slice(0, 256) + "..."
                          : submission.comment}
                      </p>
                    </div>
                  )}
                  {/* Zdjęcia */}
                  {submission.photoUrls && submission.photoUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Zdjęcia:
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {submission.photoUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Zdjęcie ${index + 1}`}
                            className="h-20 w-20 rounded-lg object-cover"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Przycisk do szczegółów */}
                  <div className="">
                    <Button
                      onClick={() =>
                        navigate(`/teacher/submission/${submission.id}`)
                      }
                      className="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600"
                    >
                      Zobacz szczegóły
                    </Button>
                  </div>
                  {/* Info o recenzji */}
                  {submission.reviewedAt && (
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Sprawdzone: {formatDate(submission.reviewedAt)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Paginacja */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col items-center justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <div className="mb-2 text-gray-600 dark:text-gray-400">
                  Strona {currentPage} z {totalPages} • Wyników:{" "}
                  {filteredSubmissions.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Poprzednia
                  </Button>
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Następna
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
