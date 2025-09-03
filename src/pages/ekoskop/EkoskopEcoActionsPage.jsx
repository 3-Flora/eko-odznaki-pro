import { useState, useEffect } from "react";
import { Link } from "react-router";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";
import { ECO_CATEGORIES } from "../../constants/ecoCategories";

export default function EkoskopEcoActionsPage() {
  const [ecoActions, setEcoActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadEcoActions();
  }, []);

  const loadEcoActions = async () => {
    try {
      setLoading(true);

      const ecoActionsSnapshot = await getDocs(collection(db, "ecoActions"));

      const ecoActionsData = ecoActionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEcoActions(ecoActionsData);
    } catch (error) {
      console.error("Error loading eco actions:", error);
      showError("Nie udało się załadować EkoDziałań");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAction = async (actionId, actionName) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć EkoDziałanie "${actionName}"? Ta operacja nie może być cofnięta.`,
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "ecoActions", actionId));
      setEcoActions(ecoActions.filter((action) => action.id !== actionId));
      showSuccess("EkoDziałanie zostało usunięte");
    } catch (error) {
      console.error("Error deleting eco action:", error);
      showError("Nie udało się usunąć EkoDziałania");
    }
  };

  const filteredActions = ecoActions.filter((action) => {
    const matchesSearch =
      action.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || action.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (categoryName) => {
    return (
      ECO_CATEGORIES.find((cat) => cat.name === categoryName) || {
        icon: "🌱",
        color: "text-gray-600",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
      }
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zarządzanie EkoDziałaniami"
        subtitle="Twórz i edytuj szablony EkoDziałań dostępnych dla uczniów"
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <input
            type="text"
            placeholder="Szukaj EkoDziałań..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
          >
            <option value="all">Wszystkie kategorie</option>
            {ECO_CATEGORIES.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Link
          to="/ekoskop/eco-actions/create"
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
          Nowe EkoDziałanie
        </Link>
      </div>

      {/* Actions Grid */}
      {filteredActions.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-800">
          <div className="mb-4 text-4xl">🌱</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {searchTerm || filterCategory !== "all"
              ? "Brak wyników"
              : "Brak EkoDziałań"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterCategory !== "all"
              ? "Spróbuj zmienić kryteria wyszukiwania lub filtry"
              : "Utwórz pierwsze EkoDziałanie dla uczniów"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredActions.map((action) => {
            const categoryInfo = getCategoryInfo(action.category);

            return (
              <div
                key={action.id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${categoryInfo.bgColor}`}
                    >
                      <span className="text-2xl">
                        {action.style?.icon || categoryInfo.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {action.name}
                      </h3>
                      <span className={`text-sm ${categoryInfo.color}`}>
                        {action.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/ekoskop/eco-actions/edit/${action.id}`}
                      className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                      title="Edytuj EkoDziałanie"
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
                      onClick={() => handleDeleteAction(action.id, action.name)}
                      className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                      title="Usuń EkoDziałanie"
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

                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>

                {/* Limits */}
                <div className="flex gap-4 text-sm">
                  {action.maxDaily && (
                    <div className="text-center">
                      <div className="font-semibold text-orange-600 dark:text-orange-400">
                        {action.maxDaily}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        dziennie
                      </div>
                    </div>
                  )}
                  {action.maxWeekly && (
                    <div className="text-center">
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {action.maxWeekly}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        tygodniowo
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
