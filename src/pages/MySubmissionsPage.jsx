import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getEcoActions } from "../services/ecoActionService";
import ErrorMessage from "../components/ui/ErrorMessage";
import Select from "../components/ui/Select";

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
  const { getUserEcoActionSubmissions, currentUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [ecoActions, setEcoActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [submissionsData, ecoActionsData] = await Promise.all([
          getUserEcoActionSubmissions(),
          getEcoActions(),
        ]);

        setSubmissions(submissionsData);
        setEcoActions(ecoActionsData);
      } catch (err) {
        console.error("Error loading submissions:", err);
        setError("Nie udało się załadować danych");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser, getUserEcoActionSubmissions]);

  // Tworzenie mapy EcoActions dla szybkiego dostępu
  const ecoActionsMap = ecoActions.reduce((acc, action) => {
    acc[action.id] = action;
    return acc;
  }, {});

  // Filtrowanie submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const ecoAction = ecoActionsMap[submission.ecoActionId];
    const matchesSearch =
      !searchTerm ||
      ecoAction?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.comment?.toLowerCase().includes(searchTerm.toLowerCase());

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
  }, [searchTerm, statusFilter]);

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

  const getCategoryIcon = (category) => {
    const icons = {
      recycling: "♻️",
      education: "📚",
      saving: "💧",
      transport: "🚲",
      energy: "⚡",
      food: "🥗",
    };
    return icons[category] || "🌍";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Ładowanie zgłoszeń...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl"
        >
          📋
        </motion.div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
          Moje EkoDziałania
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Przeglądaj wszystkie swoje zgłoszenia
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Filtry i wyszukiwanie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0"
      >
        {/* Wyszukiwanie */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj po nazwie działania..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Filtr statusu */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Wybierz filter</option>
            <option value="all">Wszystkie</option>
            <option value="approved">Zatwierdzone</option>
            <option value="pending">Oczekujące</option>
            <option value="rejected">Odrzucone</option>
          </Select>
        </div>
      </motion.div>

      {/* Statystyki */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex gap-4 sm:grid-cols-3"
      >
        <div className="flex-1 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {submissions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Łącznie
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {submissions.filter((s) => s.status === "approved").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Zatwierdzone
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {submissions.filter((s) => s.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Oczekujące
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista zgłoszeń */}
      {currentSubmissions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="py-12 text-center"
        >
          <div className="mb-4 text-6xl">🌱</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
            {filteredSubmissions.length === 0 && submissions.length > 0
              ? "Brak pasujących zgłoszeń"
              : "Brak zgłoszeń"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredSubmissions.length === 0 && submissions.length > 0
              ? "Spróbuj zmienić filtry wyszukiwania"
              : "Zacznij zgłaszać swoje EkoDziałania!"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {currentSubmissions.map((submission, index) => {
            const ecoAction = ecoActionsMap[submission.ecoActionId];
            const StatusIcon =
              statusConfig[submission.status]?.icon || CheckCircle;

            return (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
              >
                <div className="p-6">
                  {/* Header z statusem */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getCategoryIcon(submission.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {ecoAction?.title || "Nieznane działanie"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {ecoAction?.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusConfig[submission.status]?.bg}`}
                    >
                      <StatusIcon
                        className={`h-3 w-3 ${statusConfig[submission.status]?.color}`}
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
                        {submission.comment}
                      </p>
                    </div>
                  )}

                  {/* Zdjęcie */}
                  {submission.photoUrl && (
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
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Paginacja */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Poprzednia
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  page === currentPage
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
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
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Następna
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Info o paginacji */}
      {filteredSubmissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300"
        >
          Wyświetlane {startIndex + 1}-
          {Math.min(endIndex, filteredSubmissions.length)} z{" "}
          {filteredSubmissions.length} zgłoszeń
        </motion.div>
      )}
    </motion.div>
  );
}
