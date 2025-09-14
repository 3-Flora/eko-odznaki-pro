import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";
import {
  Edit,
  Eye,
  GraduationCap,
  Plus,
  UsersRound,
  RefreshCcw,
} from "lucide-react";
import Input from "../../components/ui/Input";
import NavButton from "../../components/ui/NavButton";
import Pagination from "../../components/ui/Pagination";
import {
  getCachedSchools,
  invalidateCachedSchools,
} from "../../services/contentCache";
import Button from "../../components/ui/Button";
import PullToRefreshWrapper from "../../components/refresh/PullToRefreshWrapper";

export default function EkoskopSchoolsPage() {
  const isMounted = useRef(true);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showError } = useToast();

  const loadSchools = useCallback(async () => {
    try {
      setLoading(true);
      // Pobierz szkoły wraz z policzonymi countami z cache
      const schoolsData = await getCachedSchools();
      if (isMounted.current) setSchools(schoolsData);
    } catch (error) {
      console.error("Error loading schools:", error);
      showError("Nie udało się załadować szkół");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [showError]);

  // keep mount flag stable across re-renders
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // call loadSchools once on mount
  useEffect(() => {
    loadSchools();
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      invalidateCachedSchools();
      await loadSchools();
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }, [loadSchools]);

  const filteredSchools = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return schools;
    return schools.filter(
      (school) =>
        school.name?.toLowerCase().includes(term) ||
        school.address?.toLowerCase().includes(term),
    );
  }, [schools, searchTerm]);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSchools.length / itemsPerPage),
  );
  // Clamp currentPage when totalPages changes
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchools = filteredSchools.slice(startIndex, endIndex);

  if (loading) {
    return <Loading />;
  }

  return (
    <PullToRefreshWrapper
      onRefresh={handleRefresh}
      threshold={80}
      enabled={true}
    >
      <div className="space-y-6">
        <PageHeader
          title="Zarządzanie szkołami"
          subtitle="Przeglądaj i zarządzaj wszystkimi szkołami w systemie"
          emoji="🏫"
        />

        {/* Search and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 lg:max-w-md">
            <Input
              type="text"
              placeholder="Szukaj szkół..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleRefresh}
              fullWidth={false}
              className="hidden sm:inline-flex"
            >
              <RefreshCcw />
              Odśwież
            </Button>

            <NavButton
              href="/ekoskop/schools/create"
              className="w-full sm:w-auto"
            >
              <Plus />
              Dodaj szkołę
            </NavButton>
          </div>
        </div>

        {/* Schools Grid */}
        {filteredSchools.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-800">
            <div className="mb-4 text-4xl">🏫</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {searchTerm ? "Brak wyników wyszukiwania" : "Brak szkół"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "Spróbuj zmienić kryteria wyszukiwania"
                : "Dodaj pierwszą szkołę do systemu"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                onPageChange={(p) => setCurrentPage(p)}
                totalItems={filteredSchools.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </div>
    </PullToRefreshWrapper>
  );
}

function SchoolCard({ school }) {
  return (
    <div
      key={school.id}
      className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
    >
      <div className="">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {school.name}
            </h3>
            {school.address && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                📍 {school.address}
              </p>
            )}

            <div className="mt-1 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1 text-center">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {school.classCount}
                </span>
                Klas <GraduationCap />
              </div>
              <div className="flex items-center gap-1 text-center">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {school.studentCount}
                </span>
                Uczniów <UsersRound />
              </div>
            </div>
          </div>
        </div>

        {school.email && (
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            📧 {school.email}
          </p>
        )}
      </div>

      <div className="mt-2 flex gap-2 border-t border-gray-200 pt-2 text-sm dark:border-gray-700">
        <Link
          to={`/ekoskop/school/${school.id}`}
          className="flex w-full items-center justify-center gap-1 rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
          title="Zobacz szczegóły"
        >
          <span className="hidden md:inline">Zobacz szczegóły</span>
          <Eye />
        </Link>

        <Link
          to={`/ekoskop/schools/edit/${school.id}`}
          className="flex w-full justify-center gap-1 rounded-lg bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/40"
          title="Edytuj szkołę"
        >
          <span className="hidden md:inline">Edytuj szkołę</span>
          <Edit />
        </Link>
      </div>
    </div>
  );
}
