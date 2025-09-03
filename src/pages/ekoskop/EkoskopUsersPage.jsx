import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";

export default function EkoskopUsersPage() {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterSchool, setFilterSchool] = useState("all");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [usersSnapshot, schoolsSnapshot, classesSnapshot] =
        await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "schools")),
          getDocs(collection(db, "classes")),
        ]);

      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const schoolsData = schoolsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const classesData = classesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);
      setSchools(schoolsData);
      setClasses(classesData);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Nie udało się załadować danych");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isVerified: !currentStatus,
      });

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isVerified: !currentStatus } : user,
        ),
      );

      showSuccess(
        !currentStatus
          ? "Użytkownik został zweryfikowany"
          : "Weryfikacja użytkownika została cofnięta",
      );
    } catch (error) {
      console.error("Error updating user verification:", error);
      showError("Nie udało się zmienić statusu weryfikacji");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć użytkownika "${userName}"? Ta operacja nie może być cofnięta.`,
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((user) => user.id !== userId));
      showSuccess("Użytkownik został usunięty");
    } catch (error) {
      console.error("Error deleting user:", error);
      showError("Nie udało się usunąć użytkownika");
    }
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    return school?.name || "Nieznana szkoła";
  };

  const getClassName = (classId) => {
    const classData = classes.find((c) => c.id === classId);
    return classData?.name || "Nieznana klasa";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSchool =
      filterSchool === "all" || user.schoolId === filterSchool;

    return matchesSearch && matchesRole && matchesSchool;
  });

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "student":
        return "Uczeń";
      case "teacher":
        return "Nauczyciel";
      case "ekoskop":
        return "Ekoskop";
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "teacher":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "ekoskop":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zarządzanie użytkownikami"
        subtitle="Przeglądaj i zarządzaj wszystkimi użytkownikami w systemie"
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Szukaj użytkowników..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
        >
          <option value="all">Wszystkie role</option>
          <option value="student">Uczniowie</option>
          <option value="teacher">Nauczyciele</option>
          <option value="ekoskop">Ekoskop</option>
        </select>

        <select
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
        >
          <option value="all">Wszystkie szkoły</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter((u) => u.role === "student").length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Uczniów
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter((u) => u.role === "teacher").length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Nauczycieli
          </div>
        </div>

        <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter((u) => u.role === "ekoskop").length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">
            Ekoskop
          </div>
        </div>

        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {users.filter((u) => !u.isVerified).length}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">
            Niezweryfikowanych
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-800">
          <div className="mb-4 text-4xl">👥</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Brak użytkowników
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Spróbuj zmienić kryteria wyszukiwania lub filtry
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Użytkownik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Rola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Szkoła/Klasa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Aktywność
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.displayName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getRoleBadgeClass(user.role)}`}
                    >
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    {user.schoolId && (
                      <div>
                        <div>{getSchoolName(user.schoolId)}</div>
                        {user.classId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {getClassName(user.classId)}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                        user.isVerified
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {user.isVerified ? "Zweryfikowany" : "Niezweryfikowany"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                    {user.role === "student" && (
                      <div>
                        <div>{user.counters?.totalActions || 0} EkoDziałań</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.counters?.totalChallenges || 0} EkoWyzwań
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleToggleVerification(user.id, user.isVerified)
                        }
                        className={`rounded-lg px-3 py-1 text-xs font-medium ${
                          user.isVerified
                            ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                            : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                        }`}
                      >
                        {user.isVerified ? "Cofnij weryfikację" : "Zweryfikuj"}
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteUser(user.id, user.displayName)
                        }
                        className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
