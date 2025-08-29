import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useNavigate, useSearchParams } from "react-router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { getEcoActions } from "../services/ecoActionService";
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
import clsx from "clsx";

export default function TeacherSubmissionsPage() {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [submissions, setSubmissions] = useState([]);
  const [ecoActions, setEcoActions] = useState([]);
  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("pending"); // Paginacja
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sprawdź czy filtrujemy po konkretnym uczniu
  const filterByStudent = searchParams.get("student");

  // Załaduj zgłoszenia EkoDziałań
  useEffect(() => {
    if (!currentUser?.classId) return;

    const loadSubmissions = async () => {
      setLoading(true);
      try {
        // Pobierz dane EkoDziałań
        const ecoActionsData = await getEcoActions();
        setEcoActions(ecoActionsData);

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

        // Pobierz zgłoszenia z tej klasy
        let submissionsQuery = query(
          collection(db, "submissions"),
          where("classId", "==", currentUser.classId),
          orderBy("createdAt", "desc"),
          limit(100),
        );

        // Jeśli filtrujemy po konkretnym uczniu
        if (filterByStudent) {
          submissionsQuery = query(
            collection(db, "submissions"),
            where("studentId", "==", filterByStudent),
            orderBy("createdAt", "desc"),
            limit(100),
          );
        }

        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissionsData = submissionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error loading submissions:", error);
        showError("Błąd podczas ładowania zgłoszeń");
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [currentUser?.classId, filterByStudent, showError]);

  // Znajdź EkoDziałanie po ID
  const getEcoActionById = (ecoActionId) => {
    return ecoActions.find((action) => action.id === ecoActionId);
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

  const filteredSubmissions = submissions.filter((submission) => {
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

  // Reset paginacji przy zmianie taba
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  const pendingCount = submissions.filter(
    (s) => !s.status || s.status === "pending",
  ).length;
  const approvedCount = submissions.filter(
    (s) => s.status === "approved",
  ).length;
  const rejectedCount = submissions.filter(
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
    <>
      <PageHeader
        emoji="✅"
        title={filterByStudent ? "Zgłoszenia ucznia" : "Weryfikacja EkoDziałań"}
        subtitle={`${className} • ${schoolName}`}
      />

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
                "flex flex-1 items-center justify-center rounded-lg px-4 py-3 transition-all duration-200",
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
                ? "Brak nowych zgłoszeń do weryfikacji"
                : `Brak ${selectedTab === "approved" ? "zatwierdzonych" : "odrzuconych"} zgłoszeń`}
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
                  className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
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
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm",
                        statusInfo.bgColor,
                        statusInfo.color,
                      )}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {/* {statusInfo.text} */}
                    </div>
                  </div>

                  {/* Szczegóły EkoDziałania */}
                  <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                    <h4 className="mb-2 font-medium text-gray-800 dark:text-white">
                      EkoDziałanie
                    </h4>
                    {(() => {
                      const ecoAction = getEcoActionById(
                        submission.ecoActionId,
                      );
                      if (ecoAction) {
                        return (
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                              style={{ backgroundColor: ecoAction.style.color }}
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
                            ID: {submission.ecoActionId}
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
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Komentarz ucznia:
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {submission.comment}
                      </p>
                    </div>
                  )}

                  {/* Zdjęcia */}
                  {submission.photoUrls && submission.photoUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Zdjęcia ({submission.photoUrls.length}):
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
                  <div className="pt-2">
                    <Button
                      onClick={() =>
                        navigate(`/teacher/submission/${submission.id}`)
                      }
                      className="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600"
                    >
                      Zobacz szczegóły i weryfikuj
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
    </>
  );
}
