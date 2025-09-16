import { useState, useEffect } from "react";
import {
  Trash2,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import clsx from "clsx";

export default function SubmissionsManager() {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState(new Set());
  const [filter, setFilter] = useState({
    status: "all",
    type: "all",
    dateRange: "all",
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    ecoActions: 0,
    challenges: 0,
  });

  // Stany paginacji
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Wczytaj zgłoszenia
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const submissionsRef = collection(db, "submissions");
      const q = query(
        submissionsRef,
        orderBy("createdAt", "desc"),
        limit(500), // Ogranicenie do 500 najnowszych
      );

      const snapshot = await getDocs(q);
      const submissionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubmissions(submissionsData);
      setFilteredSubmissions(submissionsData);

      // Oblicz statystyki
      const newStats = submissionsData.reduce(
        (acc, sub) => {
          acc.total++;
          acc[sub.status] = (acc[sub.status] || 0) + 1;
          if (sub.type === "eco_action") acc.ecoActions++;
          if (sub.type === "challenge") acc.challenges++;
          return acc;
        },
        {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          ecoActions: 0,
          challenges: 0,
        },
      );

      setStats(newStats);
    } catch (error) {
      console.error("Błąd podczas wczytywania zgłoszeń:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrowanie zgłoszeń i paginacja
  useEffect(() => {
    let filtered = [...submissions];

    if (filter.status !== "all") {
      filtered = filtered.filter((sub) => sub.status === filter.status);
    }

    if (filter.type !== "all") {
      filtered = filtered.filter((sub) => sub.type === filter.type);
    }

    if (filter.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filter.dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter((sub) => {
        const submissionDate = sub.createdAt?.seconds
          ? new Date(sub.createdAt.seconds * 1000)
          : new Date(sub.createdAt);
        return submissionDate >= cutoffDate;
      });
    }

    setFilteredSubmissions(filtered);
    setSelectedSubmissions(new Set()); // Wyczyść selekcję przy filtrowaniu

    // Oblicz paginację
    const pages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(pages);

    // Reset do pierwszej strony przy zmianie filtrów
    setCurrentPage(1);
  }, [filter, submissions, itemsPerPage]);

  // Sprawdź czy aktualna strona nie wychodzi poza zakres
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Masowe usuwanie zgłoszeń
  const deleteSelectedSubmissions = async () => {
    if (selectedSubmissions.size === 0) return;

    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć ${selectedSubmissions.size} zgłoszeń?\n\nTa operacja jest nieodwracalna!`,
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);

      // Dodaj operacje usuwania do batch
      selectedSubmissions.forEach((submissionId) => {
        const docRef = doc(db, "submissions", submissionId);
        batch.delete(docRef);
      });

      await batch.commit();

      // Odśwież dane
      await fetchSubmissions();
      setSelectedSubmissions(new Set());

      // Sprawdź czy aktualna strona nie jest pusta po usunięciu
      const newFilteredCount =
        filteredSubmissions.length - selectedSubmissions.size;
      const newTotalPages = Math.ceil(newFilteredCount / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      alert(`Pomyślnie usunięto ${selectedSubmissions.size} zgłoszeń.`);
    } catch (error) {
      console.error("Błąd podczas usuwania zgłoszeń:", error);
      alert("Wystąpił błąd podczas usuwania zgłoszeń.");
    } finally {
      setLoading(false);
    }
  };

  // Usuwanie wszystkich zgłoszeń
  const deleteAllSubmissions = async () => {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć WSZYSTKIE zgłoszenia (${submissions.length})?\n\nTa operacja jest nieodwracalna!`,
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      "To jest druga weryfikacja. Czy NAPRAWDĘ chcesz usunąć wszystkie zgłoszenia?\n\nBędą stracone na zawsze!",
    );

    if (!doubleConfirmed) return;

    setLoading(true);
    try {
      // Pobierz wszystkie dokumenty w batches (Firestore limit to 500)
      const submissionsRef = collection(db, "submissions");
      let hasMore = true;
      let deletedCount = 0;

      while (hasMore) {
        const q = query(submissionsRef, limit(500));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          hasMore = false;
          break;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        deletedCount += snapshot.docs.length;

        // Jeśli mniej niż 500 dokumentów, oznacza to koniec
        if (snapshot.docs.length < 500) {
          hasMore = false;
        }
      }

      // Odśwież dane
      await fetchSubmissions();

      alert(`Pomyślnie usunięto ${deletedCount} zgłoszeń.`);
    } catch (error) {
      console.error("Błąd podczas usuwania wszystkich zgłoszeń:", error);
      alert("Wystąpił błąd podczas usuwania zgłoszeń.");
    } finally {
      setLoading(false);
    }
  };

  // Obsługa zaznaczania/odznaczania
  const toggleSelection = (submissionId) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(submissionId)) {
      newSelected.delete(submissionId);
    } else {
      newSelected.add(submissionId);
    }
    setSelectedSubmissions(newSelected);
  };

  const selectAll = () => {
    const currentPageSubmissions = getCurrentPageSubmissions();
    const currentPageIds = new Set(currentPageSubmissions.map((s) => s.id));

    // Sprawdź czy wszystkie na aktualnej stronie są zaznaczone
    const allCurrentSelected = currentPageSubmissions.every((s) =>
      selectedSubmissions.has(s.id),
    );

    const newSelected = new Set(selectedSubmissions);

    if (allCurrentSelected) {
      // Odznacz wszystkie z aktualnej strony
      currentPageIds.forEach((id) => newSelected.delete(id));
    } else {
      // Zaznacz wszystkie z aktualnej strony
      currentPageIds.forEach((id) => newSelected.add(id));
    }

    setSelectedSubmissions(newSelected);
  };

  // Funkcje paginacji
  const getCurrentPageSubmissions = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSubmissions.slice(startIndex, endIndex);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Brak daty";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
            <Send className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Zarządzanie zgłoszeniami
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Przeglądaj i usuwaj zgłoszenia użytkowników
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className={clsx(
              "flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600",
              { "disabled:opacity-50": loading },
            )}
          >
            <RefreshCw
              className={clsx("h-4 w-4", { "animate-spin": loading })}
            />
            Odśwież
          </button>
        </div>
      </div>

      {/* Statystyki */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Wszystkie
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
        </div>
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <div className="text-sm text-green-600 dark:text-green-400">
            Zaakceptowane
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {stats.approved}
          </div>
        </div>
        <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">
            Oczekujące
          </div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {stats.pending}
          </div>
        </div>
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <div className="text-sm text-red-600 dark:text-red-400">
            Odrzucone
          </div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            {stats.rejected}
          </div>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <div className="text-sm text-blue-600 dark:text-blue-400">
            EkoDziałania
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {stats.ecoActions}
          </div>
        </div>
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
          <div className="text-sm text-purple-600 dark:text-purple-400">
            EkoWyzwania
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {stats.challenges}
          </div>
        </div>
      </div>

      {/* Filtry */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtry:
          </span>
        </div>

        <select
          value={filter.status}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, status: e.target.value }))
          }
          className="rounded border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="approved">Zaakceptowane</option>
          <option value="pending">Oczekujące</option>
          <option value="rejected">Odrzucone</option>
        </select>

        <select
          value={filter.type}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, type: e.target.value }))
          }
          className="rounded border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Wszystkie typy</option>
          <option value="eco_action">EkoDziałania</option>
          <option value="challenge">EkoWyzwania</option>
        </select>

        <select
          value={filter.dateRange}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, dateRange: e.target.value }))
          }
          className="rounded border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Wszystkie daty</option>
          <option value="today">Dzisiaj</option>
          <option value="week">Ostatni tydzień</option>
          <option value="month">Ostatni miesiąc</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Na stronę:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="rounded border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Akcje masowe */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={selectAll}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {getCurrentPageSubmissions().every((s) =>
            selectedSubmissions.has(s.id),
          ) && getCurrentPageSubmissions().length > 0
            ? "Odznacz stronę"
            : "Zaznacz stronę"}
        </button>

        {selectedSubmissions.size > 0 && (
          <button
            onClick={deleteSelectedSubmissions}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Usuń zaznaczone ({selectedSubmissions.size})
          </button>
        )}

        <button
          onClick={deleteAllSubmissions}
          disabled={loading || submissions.length === 0}
          className="ml-auto flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          <AlertTriangle className="h-4 w-4" />
          Usuń wszystkie ({submissions.length})
        </button>
      </div>

      {/* Kontrolki paginacji */}
      {filteredSubmissions.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Wyniki {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} z{" "}
            {filteredSubmissions.length}
            {filteredSubmissions.length !== submissions.length && (
              <span className="text-gray-500">
                {" "}
                (odfiltrowane z {submissions.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {/* Generuj numery stron */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Lista zgłoszeń */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-700">
          <Send className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
            Brak zgłoszeń
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nie znaleziono zgłoszeń spełniających kryteria filtrowania.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {getCurrentPageSubmissions().map((submission) => (
            <div
              key={submission.id}
              className={clsx(
                "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                selectedSubmissions.has(submission.id)
                  ? "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                  : "border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700",
              )}
            >
              <input
                type="checkbox"
                checked={selectedSubmissions.has(submission.id)}
                onChange={() => toggleSelection(submission.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="truncate font-medium text-gray-900 dark:text-white">
                    {submission.studentName || "Nieznany uczeń"}
                  </h4>

                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                      submission.type === "eco_action"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                    )}
                  >
                    {submission.type === "eco_action"
                      ? "EkoDziałanie"
                      : "EkoWyzwanie"}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    {getStatusIcon(submission.status)}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {submission.comment && (
                    <p className="truncate">{submission.comment}</p>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <span>Data: {formatDate(submission.createdAt)}</span>
                    {submission.photoUrls &&
                      submission.photoUrls.length > 0 && (
                        <span>Zdjęć: {submission.photoUrls.length}</span>
                      )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                ID: {submission.id.slice(-6)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kontrolki paginacji na dole */}
      {filteredSubmissions.length > itemsPerPage && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Strona {currentPage} z {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
