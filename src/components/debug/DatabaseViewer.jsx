import { useState, useEffect } from "react";
import {
  Eye,
  RefreshCw,
  Database,
  FileText,
  Trophy,
  Zap,
  Target,
  Send,
  Users,
  School,
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  getEcoChallenges,
  getAllEcoChallenges,
} from "../../services/ecoChallengeService";
import { getEcoActions } from "../../services/ecoActionService";
import clsx from "clsx";

export default function DatabaseViewer() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    ecoActions: [],
    ecoChallenges: [],
    allEcoChallenges: [],
    badgeTemplates: [],
    submissions: [],
    users: [],
    schools: [],
    classes: [],
  });
  const [activeTab, setActiveTab] = useState("ecoActions");

  const tabs = [
    {
      id: "ecoActions",
      name: "EkoDziałania",
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      collection: "ecoActions",
    },
    {
      id: "ecoChallenges",
      name: "EkoWyzwania (Aktualne)",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      useService: true,
    },
    {
      id: "allEcoChallenges",
      name: "Wszystkie EkoWyzwania",
      icon: Target,
      color: "text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      collection: "ecoChallenges",
    },
    {
      id: "badgeTemplates",
      name: "Odznaki",
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      collection: "badgeTemplates",
    },
    {
      id: "submissions",
      name: "Zgłoszenia",
      icon: Send,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      collection: "submissions",
      hasOrderBy: true,
    },
    {
      id: "users",
      name: "Użytkownicy",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      collection: "users",
    },
    {
      id: "schools",
      name: "Szkoły",
      icon: School,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      collection: "schools",
    },
    {
      id: "classes",
      name: "Klasy",
      icon: Users,
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      collection: "classes",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const newData = {};

      // Pobierz dane z każdej kolekcji
      for (const tab of tabs) {
        try {
          if (tab.id === "ecoChallenges") {
            // Użyj specjalnej funkcji dla aktualnych ecoChallenges
            newData[tab.id] = await getEcoChallenges();
          } else if (tab.id === "ecoActions") {
            // Użyj serwisu dla ecoActions
            newData[tab.id] = await getEcoActions();
          } else if (tab.collection) {
            // Standardowe kolekcje
            let collectionRef = collection(db, tab.collection);

            // Dla submissions sortuj według daty utworzenia
            if (tab.hasOrderBy) {
              collectionRef = query(
                collectionRef,
                orderBy("createdAt", "desc"),
                limit(50), // Ogranic do 50 najnowszych
              );
            }

            const snapshot = await getDocs(collectionRef);
            newData[tab.id] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          }
        } catch (error) {
          console.error(`Error fetching ${tab.id}:`, error);
          newData[tab.id] = [];
        }
      }

      setData(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeTabData = data[activeTab] || [];
  const activeTabInfo = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
            <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Przeglądarka bazy danych
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Podgląd zawartości kolekcji
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className={clsx(
            "flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600",
            { "disabled:opacity-50": loading },
          )}
        >
          <RefreshCw className={clsx("h-4 w-4", { "animate-spin": loading })} />
          Odśwież
        </button>
      </div>
      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max space-x-1 rounded-lg bg-gray-100 p-1 sm:grid sm:min-w-0 sm:grid-cols-4 lg:grid-cols-8 dark:bg-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex min-w-max items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all sm:min-w-0",
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
              )}
            >
              <tab.icon
                className={clsx("h-4 w-4 flex-shrink-0", {
                  [tab.color]: activeTab === tab.id,
                })}
              />
              <span className="hidden sm:inline">{tab.name}</span>
              <span className="sm:hidden">{tab.name.split(" ")[0]}</span>
              <span className="flex-shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-600">
                {data[tab.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div key={activeTab} className="space-y-4">
          {activeTabData.length === 0 ? (
            <div
              className={clsx(
                "rounded-lg p-8 text-center",
                activeTabInfo?.bgColor,
              )}
            >
              <Database
                className={clsx(
                  "mx-auto mb-4 h-12 w-12 opacity-50",
                  activeTabInfo?.color,
                )}
              />
              <h3 className={clsx("mb-2 font-medium", activeTabInfo?.color)}>
                Brak danych
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kolekcja {activeTabInfo?.name} jest pusta
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {activeTabData.map((item) => (
                <DataCard key={item.id} item={item} tabId={activeTab} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Komponent do wyświetlania pojedynczej karty z danymi
function DataCard({ item, tabId }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
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

  const formatStatus = (status) => {
    const statusColors = {
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    const statusLabels = {
      approved: "Zaakceptowane",
      pending: "Oczekuje",
      rejected: "Odrzucone",
    };

    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const getTitle = () => {
    switch (tabId) {
      case "submissions":
        return item.studentName || item.id;
      case "users":
        return item.displayName || item.email || item.id;
      case "schools":
        return item.name || item.id;
      case "classes":
        return item.name || item.id;
      default:
        return item.name || item.challengeName || item.id;
    }
  };

  const getDescription = () => {
    switch (tabId) {
      case "submissions":
        return item.comment || item.description;
      case "users":
        return item.email;
      case "schools":
        return item.address;
      case "classes":
        return `Szkoła: ${item.schoolId}`;
      default:
        return item.description || item.challengeDescription;
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-semibold break-words text-gray-800 dark:text-white">
          {getTitle()}
        </h3>
        <span className="ml-2 flex-shrink-0 rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
          {item.id.slice(-6)}
        </span>
      </div>

      {getDescription() && (
        <p className="mb-3 text-sm break-words text-gray-600 dark:text-gray-400">
          {getDescription()}
        </p>
      )}

      <div className="space-y-2">
        {/* Status dla submissions */}
        {item.status && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Status:
            </span>
            {formatStatus(item.status)}
          </div>
        )}

        {/* Typ dla submissions */}
        {item.type && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Typ:
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {item.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"}
            </span>
          </div>
        )}

        {/* Rola dla users */}
        {item.role && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Rola:
            </span>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {item.role === "student"
                ? "Uczeń"
                : item.role === "teacher"
                  ? "Nauczyciel"
                  : "Ekoskop"}
            </span>
          </div>
        )}

        {/* Kategoria */}
        {item.category && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Kategoria:
            </span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              {item.category}
            </span>
          </div>
        )}

        {/* Data utworzenia */}
        {item.createdAt && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Utworzono:
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {formatDate(item.createdAt)}
            </span>
          </div>
        )}

        {/* Daty dla challenges */}
        {item.startDate && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Data rozpoczęcia:
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {formatDate(item.startDate)}
            </span>
          </div>
        )}

        {item.endDate && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Data zakończenia:
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {formatDate(item.endDate)}
            </span>
          </div>
        )}

        {/* Limity */}
        {(item.maxDaily || item.maxWeekly) && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Limity:
            </span>
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {item.maxDaily && `${item.maxDaily}/dzień`}
              {item.maxDaily && item.maxWeekly && ", "}
              {item.maxWeekly && `${item.maxWeekly}/tydzień`}
            </span>
          </div>
        )}

        {/* Progress dla challenges */}
        {item.classProgress && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Postęp:
            </span>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              {item.classProgress.current}/{item.classProgress.total}
            </span>
          </div>
        )}

        {/* Liczniki dla users */}
        {item.counters && (
          <div className="mt-3">
            <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Liczniki:
            </span>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(item.counters).map(([key, value]) => (
                <span
                  key={key}
                  className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-600"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Zdjęcia dla submissions */}
        {item.photoUrls && item.photoUrls.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Zdjęcia:
            </span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {item.photoUrls.length} zdjęć
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
