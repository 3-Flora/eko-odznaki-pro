import { useState, useEffect } from "react";
import { Link } from "react-router";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";

export default function EkoskopSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);

      // Pobierz wszystkie szkoły
      const schoolsSnapshot = await getDocs(collection(db, "schools"));
      const schoolsData = [];

      for (const schoolDoc of schoolsSnapshot.docs) {
        const schoolData = {
          id: schoolDoc.id,
          ...schoolDoc.data(),
        };

        // Pobierz liczbę klas dla każdej szkoły
        const classesSnapshot = await getDocs(collection(db, "classes"));
        const schoolClasses = classesSnapshot.docs.filter(
          (classDoc) => classDoc.data().schoolId === schoolDoc.id,
        );

        schoolData.classCount = schoolClasses.length;

        // Pobierz liczbę uczniów dla każdej szkoły
        const usersSnapshot = await getDocs(collection(db, "users"));
        const schoolStudents = usersSnapshot.docs.filter(
          (userDoc) =>
            userDoc.data().schoolId === schoolDoc.id &&
            userDoc.data().role === "student",
        );

        schoolData.studentCount = schoolStudents.length;

        schoolsData.push(schoolData);
      }

      setSchools(schoolsData);
    } catch (error) {
      console.error("Error loading schools:", error);
      showError("Nie udało się załadować szkół");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async (schoolId, schoolName) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć szkołę "${schoolName}"? Ta operacja nie może być cofnięta.`,
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "schools", schoolId));
      setSchools(schools.filter((school) => school.id !== schoolId));
      showSuccess("Szkoła została usunięta");
    } catch (error) {
      console.error("Error deleting school:", error);
      showError("Nie udało się usunąć szkoły");
    }
  };

  const filteredSchools = schools.filter(
    (school) =>
      school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zarządzanie szkołami"
        subtitle="Przeglądaj i zarządzaj wszystkimi szkołami w systemie"
      />

      {/* Search and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md flex-1">
          <input
            type="text"
            placeholder="Szukaj szkół..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
          />
        </div>

        <Link
          to="/ekoskop/schools/create"
          className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Dodaj szkołę
        </Link>
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => (
            <div
              key={school.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
            >
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

                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {school.classCount}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Klas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {school.studentCount}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Uczniów
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/ekoskop/school/${school.id}`}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                    title="Zobacz szczegóły"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Link>

                  <Link
                    to={`/ekoskop/schools/edit/${school.id}`}
                    className="rounded-lg bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/40"
                    title="Edytuj szkołę"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>

                  <button
                    onClick={() => handleDeleteSchool(school.id, school.name)}
                    className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                    title="Usuń szkołę"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {school.email && (
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    📧 {school.email}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
