import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";
import { Edit, Eye, GraduationCap, Plus, UsersRound } from "lucide-react";
import Input from "../../components/ui/Input";
import NavButton from "../../components/ui/NavButton";

export default function EkoskopSchoolsPage() {
  const isMounted = useRef(true);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showError } = useToast();

  useEffect(() => {
    loadSchools();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);

      // Pobierz wszystkie zasoby jednocześnie zamiast w pętli
      const [schoolsSnapshot, classesSnapshot, usersSnapshot] =
        await Promise.all([
          getDocs(collection(db, "schools")),
          getDocs(collection(db, "classes")),
          getDocs(collection(db, "users")),
        ]);

      // Zmapuj liczby klas na schoolId
      const classCountBySchool = new Map();
      for (const cls of classesSnapshot.docs) {
        const sid = cls.data().schoolId;
        if (!sid) continue;
        classCountBySchool.set(sid, (classCountBySchool.get(sid) || 0) + 1);
      }

      // Zmapuj liczbę uczniów (role === 'student') na schoolId
      const studentCountBySchool = new Map();
      for (const user of usersSnapshot.docs) {
        const data = user.data();
        if (data.role !== "student") continue;
        const sid = data.schoolId;
        if (!sid) continue;
        studentCountBySchool.set(sid, (studentCountBySchool.get(sid) || 0) + 1);
      }

      const schoolsData = schoolsSnapshot.docs.map((schoolDoc) => {
        const data = schoolDoc.data() || {};
        return {
          id: schoolDoc.id,
          ...data,
          classCount: classCountBySchool.get(schoolDoc.id) || 0,
          studentCount: studentCountBySchool.get(schoolDoc.id) || 0,
        };
      });

      setSchools(schoolsData);
    } catch (error) {
      console.error("Error loading schools:", error);
      showError("Nie udało się załadować szkół");
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return schools;
    return schools.filter(
      (school) =>
        school.name?.toLowerCase().includes(term) ||
        school.address?.toLowerCase().includes(term),
    );
  }, [schools, searchTerm]);

  if (loading) {
    return <Loading />;
  }

  return (
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

        <NavButton href="/ekoskop/schools/create" fullWidth={false}>
          <Plus />
          Dodaj szkołę
        </NavButton>
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSchools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}
    </div>
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
