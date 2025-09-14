import { useState, useEffect } from "react";
import {
  Calendar,
  Camera,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Eye,
  X,
  User,
  FileText,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getEcoActions } from "../../services/ecoActionService";
import { getAllEcoChallenges } from "../../services/ecoChallengeService";
import Select from "../../components/ui/Select";
import PageHeader from "../../components/ui/PageHeader";
import clsx from "clsx";
import { useToast } from "../../contexts/ToastContext";

const ITEMS_PER_PAGE = 6;

const statusConfig = {
  approved: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    label: "Zatwierdzone",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Oczekuje",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    label: "Odrzucone",
  },
};

export default function MySubmissionsPage() {
  const { getAllUserSubmissions, currentUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [ecoActions, setEcoActions] = useState([]);
  const [ecoChallenges, setEcoChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // all, eco_action, challenge
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const { showError } = useToast();

  // Ładowanie danych
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [submissionsData, ecoActionsData, ecoChallengesData] =
          await Promise.all([
            getAllUserSubmissions(),
            getEcoActions(),
            getAllEcoChallenges(),
          ]);

        setSubmissions(submissionsData);
        setEcoActions(ecoActionsData);
        setEcoChallenges(ecoChallengesData);
      } catch (err) {
        console.error("Error loading data:", err);
        showError("Nie udało się załadować danych");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser, getAllUserSubmissions]);

  // Tworzenie mapy EcoActions i EcoChallenges dla szybkiego dostępu
  const ecoActionsMap = ecoActions.reduce((acc, action) => {
    acc[action.id] = action;
    return acc;
  }, {});

  const ecoChallengesMap = ecoChallenges.reduce((acc, challenge) => {
    acc[challenge.id] = challenge;
    return acc;
  }, {});

  // Filtrowanie submissions
  const filteredSubmissions = submissions.filter((submission) => {
    // Filtr typu
    if (typeFilter !== "all" && submission.type !== typeFilter) {
      return false;
    }

    // Filtr wyszukiwania
    let activityName = "";
    let activityDescription = "";

    if (submission.type === "eco_action") {
      const ecoAction = ecoActionsMap[submission.ecoActivityId];
      activityName = ecoAction?.name || "";
      activityDescription = ecoAction?.description || "";
    } else if (submission.type === "challenge") {
      const challenge = ecoChallengesMap[submission.ecoActivityId];
      activityName = challenge?.name || challenge?.challengeName || "";
      activityDescription =
        challenge?.description || challenge?.challengeDescription || "";
    }

    const matchesSearch =
      !searchTerm ||
      activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activityDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtr statusu
    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginacja
  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  // Reset strony po zmianie filtrów
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Nieznana data";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityInfo = (submission) => {
    if (submission.type === "eco_action") {
      const ecoAction = ecoActionsMap[submission.ecoActivityId];
      return {
        name: ecoAction?.name || "Nieznane EkoDziałanie",
        description: ecoAction?.description || "",
        type: "EkoDziałanie",
      };
    } else if (submission.type === "challenge") {
      const challenge = ecoChallengesMap[submission.ecoActivityId];
      return {
        name:
          challenge?.name || challenge?.challengeName || "Nieznane EkoWyzwanie",
        description:
          challenge?.description || challenge?.challengeDescription || "",
        type: "EkoWyzwanie",
      };
    }
    return {
      name: "Nieznana aktywność",
      description: "",
      type: "Nieznany typ",
    };
  };

  const getCategoryIcon = (submission) => {
    if (submission.type === "challenge") {
      return "🏆"; // Ikona dla EkoWyzwań
    }

    // Ikony dla EkoDziałań na podstawie kategorii
    const ecoAction = ecoActionsMap[submission.ecoActivityId];
    const category = ecoAction?.category;

    const icons = {
      Recykling: "♻️",
      Edukacja: "📚",
      Oszczędzanie: "💧",
      Transport: "🚲",
      Energia: "⚡",
      Jedzenie: "🥗",
    };
    return icons[category] || "🌍";
  };

  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const closeSubmissionModal = () => {
    setSelectedSubmission(null);
    setIsModalOpen(false);
  };

  const openPhotoModal = (photoUrl) => {
    setSelectedPhotoUrl(photoUrl);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setSelectedPhotoUrl(null);
    setIsPhotoModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Ładowanie zgłoszeń...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Moje Zgłoszenia"
        emoji="📋"
        subtitle="Przeglądaj wszystkie swoje EkoDziałania i EkoWyzwania"
      />
      {/* Filtry i wyszukiwanie */}
      <div className="space-y-4">
        {/* Wyszukiwanie */}
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj po nazwie działania..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Filtr typu */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Wszystkie aktywności</option>
              <option value="eco_action">EkoDziałania</option>
              <option value="challenge">EkoWyzwania</option>
            </Select>
          </div>

          {/* Filtr statusu */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Status:
            </span>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Wszystkie</option>
              <option value="approved">Zatwierdzone</option>
              <option value="pending">Oczekujące</option>
              <option value="rejected">Odrzucone</option>
            </Select>
          </div>
        </div>
      </div>
      {/* Statystyki */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {submissions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Łącznie
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {submissions.filter((s) => s.type === "eco_action").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              EkoDziałania
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {submissions.filter((s) => s.type === "challenge").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              EkoWyzwania
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {submissions.filter((s) => s.status === "approved").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Zatwierdzone
            </div>
          </div>
        </div>
      </div>
      {/* Lista zgłoszeń */}
      {currentSubmissions.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🌱</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
            {filteredSubmissions.length === 0 && submissions.length > 0
              ? "Brak pasujących zgłoszeń"
              : "Brak zgłoszeń"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredSubmissions.length === 0 && submissions.length > 0
              ? "Spróbuj zmienić filtry wyszukiwania"
              : "Zacznij zgłaszać swoje EkoDziałania i EkoWyzwania!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {currentSubmissions.map((submission, index) => {
            const activityInfo = getActivityInfo(submission);
            const StatusIcon =
              statusConfig[submission.status]?.icon || CheckCircle;

            return (
              <div
                key={submission.id}
                onClick={() => openSubmissionModal(submission)}
                className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] dark:bg-gray-800"
              >
                <div className="p-6">
                  {/* Header z statusem */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getCategoryIcon(submission)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {activityInfo.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {activityInfo.description}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {activityInfo.type}
                        </span>
                      </div>
                    </div>
                    <div
                      className={clsx(
                        "flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                        statusConfig[submission.status]?.bg,
                      )}
                    >
                      <StatusIcon
                        className={clsx(
                          "h-3 w-3",
                          statusConfig[submission.status]?.color,
                        )}
                      />
                      <span className={statusConfig[submission.status]?.color}>
                        {statusConfig[submission.status]?.label}
                      </span>
                    </div>
                  </div>
                  {/* Komentarz */}
                  {submission.comment && (
                    <div className="mb-4 flex items-start gap-2">
                      <MessageSquare className="mt-0.5 h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {submission.comment.substring(0, 200)}
                        {submission.comment.length > 200 && "..."}
                      </p>
                    </div>
                  )}
                  {/* Zdjęcia */}
                  {submission.photoUrls && submission.photoUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {submission.photoUrls.length === 1
                            ? "Zdjęcie załączone"
                            : `${submission.photoUrls.length} zdjęć załączonych`}
                        </span>
                      </div>
                      <div
                        className={
                          submission.photoUrls.length === 1
                            ? ""
                            : "grid grid-cols-2 gap-2"
                        }
                      >
                        {submission.photoUrls.map((photoUrl, index) => (
                          <img
                            key={index}
                            src={photoUrl}
                            alt={`Zdjęcie działania ${index + 1}`}
                            className={
                              submission.photoUrls.length === 1
                                ? "h-32 w-full rounded-lg object-cover"
                                : "h-24 w-full rounded-lg object-cover"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Fallback dla starych submission'ów z photoUrl */}
                  {submission.photoUrl && !submission.photoUrls && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Zdjęcie załączone
                        </span>
                      </div>
                      <img
                        src={submission.photoUrl}
                        alt="Zdjęcie działania"
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    </div>
                  )}
                  {/* Data zgłoszenia */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(submission.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={clsx(
              "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition",
              "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
              "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              currentPage === 1 &&
                "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Poprzednia
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm transition",
                  page === currentPage
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={clsx(
              "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition",
              "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
              "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              currentPage === totalPages &&
                "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            Następna
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Info o paginacji */}
      {filteredSubmissions.length > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-300">
          Wyświetlane {startIndex + 1}-
          {Math.min(endIndex, filteredSubmissions.length)} z{" "}
          {filteredSubmissions.length} zgłoszeń
        </div>
      )}

      {/* Modal szczegółów zgłoszenia */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-2xl transform rounded-t-2xl bg-white shadow-xl transition-all sm:rounded-2xl dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {getCategoryIcon(selectedSubmission)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Szczegóły zgłoszenia
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getActivityInfo(selectedSubmission).type}
                  </p>
                </div>
              </div>
              <button
                onClick={closeSubmissionModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Informacje o aktywności */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                    {getActivityInfo(selectedSubmission).type}
                  </h4>
                  <h5 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {getActivityInfo(selectedSubmission).name}
                  </h5>
                  <p className="text-gray-600 dark:text-gray-300">
                    {getActivityInfo(selectedSubmission).description}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status:
                  </span>
                  <div
                    className={clsx(
                      "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                      statusConfig[selectedSubmission.status]?.bg,
                      statusConfig[selectedSubmission.status]?.color,
                    )}
                  >
                    {(() => {
                      const StatusIcon =
                        statusConfig[selectedSubmission.status]?.icon ||
                        CheckCircle;
                      return <StatusIcon className="h-4 w-4" />;
                    })()}
                    {statusConfig[selectedSubmission.status]?.label}
                  </div>
                </div>

                {/* Komentarz użytkownika */}
                {selectedSubmission.comment && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Twój komentarz:
                      </span>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedSubmission.comment}
                      </p>
                    </div>
                  </div>
                )}

                {/* Zdjęcia */}
                {((selectedSubmission.photoUrls &&
                  selectedSubmission.photoUrls.length > 0) ||
                  selectedSubmission.photoUrl) && (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Załączone zdjęcia:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {selectedSubmission.photoUrls &&
                      selectedSubmission.photoUrls.length > 0
                        ? selectedSubmission.photoUrls.map(
                            (photoUrl, index) => (
                              <div
                                key={index}
                                className="group relative cursor-pointer"
                                onClick={() => openPhotoModal(photoUrl)}
                              >
                                <img
                                  src={photoUrl}
                                  alt={`Zdjęcie ${index + 1}`}
                                  className="h-48 w-full rounded-lg object-cover transition-opacity group-hover:opacity-75"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                  <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                                </div>
                              </div>
                            ),
                          )
                        : selectedSubmission.photoUrl && (
                            <div
                              className="group relative cursor-pointer"
                              onClick={() =>
                                openPhotoModal(selectedSubmission.photoUrl)
                              }
                            >
                              <img
                                src={selectedSubmission.photoUrl}
                                alt="Zdjęcie zgłoszenia"
                                className="h-48 w-full rounded-lg object-cover transition-opacity group-hover:opacity-75"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          )}
                    </div>
                  </div>
                )}

                {/* Informacje o dacie */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Data zgłoszenia:
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatDate(selectedSubmission.createdAt)}
                    </p>
                  </div>

                  {selectedSubmission.reviewedAt && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Data weryfikacji:
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatDate(selectedSubmission.reviewedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Powód odrzucenia (jeśli istnieje) */}
                {selectedSubmission.status === "rejected" &&
                  selectedSubmission.rejectionReason && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-700 dark:text-red-400">
                          Powód odrzucenia:
                        </span>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                        <p className="text-red-700 dark:text-red-300">
                          {selectedSubmission.rejectionReason}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                onClick={closeSubmissionModal}
                className="w-full rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal przybliżania zdjęć */}
      {isPhotoModalOpen && selectedPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="relative max-h-full max-w-full">
            <img
              src={selectedPhotoUrl}
              alt="Powiększone zdjęcie"
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
            />

            {/* Przycisk zamknięcia */}
            <button
              onClick={closePhotoModal}
              className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white transition hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Kliknięcie w tło zamyka modal */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closePhotoModal}
          ></div>
        </div>
      )}
    </>
  );
}
