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
import { getAllEcoChallenges } from "../services/ecoChallengeService";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import PullToRefreshWrapper from "../components/ui/PullToRefreshWrapper";
import { SubmissionsGrid } from "../components/submissions";
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
        const challengesData = await getAllEcoChallenges();
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
        <div className="flex gap-2">
          {[
            { id: "actions", label: "EkoDziałania", icon: "🌱" },
            { id: "challenges", label: "EkoWyzwania", icon: "🏆" },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setSelectedType(id)}
              className={clsx(
                "flex flex-1 cursor-pointer items-center justify-center rounded-lg px-4 py-3 transition-all duration-200",
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
        <div className="flex gap-2">
          {[
            { id: "pending", label: "Nowe", count: pendingCount },
            { id: "approved", label: "Zatwierdzone", count: approvedCount },
            { id: "rejected", label: "Odrzucone", count: rejectedCount },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className={clsx(
                "flex flex-1 cursor-pointer items-center justify-center rounded-lg px-2 py-1 transition-all duration-200",
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

      {/* Grid zgłoszeń */}
      <SubmissionsGrid
        submissions={paginatedSubmissions}
        selectedType={selectedType}
        selectedTab={selectedTab}
        getEcoActionById={getEcoActionById}
        getChallengeById={getChallengeById}
        onViewDetails={(submissionId) =>
          navigate(`/teacher/submission/${submissionId}`)
        }
      />

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="mb-2 text-gray-600 dark:text-gray-400">
            Strona {currentPage} z {totalPages} • Wyników:{" "}
            {filteredSubmissions.length}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
    </PullToRefreshWrapper>
  );
}
