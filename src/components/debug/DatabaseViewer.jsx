import { useState, useEffect } from "react";
import {
  Eye,
  RefreshCw,
  Database,
  FileText,
  Trophy,
  Zap,
  Target,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  getEcoChallenges,
  getAllEcoChallenges,
} from "../../services/ecoChallengeService";
import clsx from "clsx";

export default function DatabaseViewer() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    ecoActions: [],
    ecoChallenges: [],
    badgeTemplates: [],
  });
  const [activeTab, setActiveTab] = useState("ecoActions");

  const tabs = [
    {
      id: "ecoActions",
      name: "EkoDziałania",
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "ecoChallenges",
      name: "EkoWyzwania",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: "allEcoChallenges",
      name: "Wszystkie EkoWyzwania",
      icon: Target,
      color: "text-orange-200",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: "badgeTemplates",
      name: "Odznaki",
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const newData = {};

      // Pobierz dane z każdej kolekcji
      for (const tab of tabs) {
        if (tab.id === "ecoChallenges") {
          // Użyj specjalnej funkcji dla ecoChallenges
          newData[tab.id] = await getEcoChallenges();
        }
        if (tab.id === "allEcoChallenges") {
          newData[tab.id] = await getAllEcoChallenges();
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
      <div className="mb-6 flex flex-wrap space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
            )}
          >
            <tab.icon
              className={clsx("h-4 w-4", {
                [tab.color]: activeTab === tab.id,
              })}
            />
            <span>{tab.name}</span>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-600">
              {data[tab.id]?.length || 0}
            </span>
          </button>
        ))}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeTabData.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {item.name || item.id}
                    </h3>
                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                      {item.id}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {item.challengeName && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Nazwa wyzwania:
                        </span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {item.challengeName}
                        </span>
                      </div>
                    )}

                    {item.challengeDescription && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Opis:
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.challengeDescription}
                        </span>
                      </div>
                    )}

                    {item.startDate && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Data rozpoczęcia:
                        </span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {new Date(
                            item.startDate.seconds * 1000,
                          ).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                    )}

                    {item.endDate && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Data zakończenia:
                        </span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {new Date(
                            item.endDate.seconds * 1000,
                          ).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                    )}

                    {item.classProgress && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Globalny postęp:
                        </span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          {item.classProgress.current}/
                          {item.classProgress.total}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
