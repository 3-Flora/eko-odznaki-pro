import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Users, School, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState("individual");
  const [individualRanking, setIndividualRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      try {
        if (activeTab === "individual") {
          const usersQuery = query(
            collection(db, "users"),
            orderBy("points", "desc"),
            limit(50),
          );

          const snapshot = await getDocs(usersQuery);
          const users = [];

          snapshot.docs.forEach((doc, index) => {
            const userData = doc.data();
            users.push({
              ...userData,
              rank: index + 1,
            });
          });

          setIndividualRanking(users);
        }
        // TODO: Implement class and school rankings
      } catch (error) {
        console.error("Error loading ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [activeTab]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="flex h-6 w-6 items-center justify-center font-bold text-gray-600">
            #{rank}
          </span>
        );
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-orange-500";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-yellow-600";
      default:
        return "bg-white";
    }
  };

  const tabs = [
    { id: "individual", label: "Indywidualny", icon: Users },
    { id: "class", label: "Klasowy", icon: School },
    { id: "school", label: "Szkół", icon: Globe },
  ];

  return (
    <div className="flex flex-col justify-normal gap-6 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-4 text-4xl">🏆</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Ranking
        </h1>
        <p className="text-gray-600">Zobacz najlepszych eko-wojowników!</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-2 shadow-lg dark:bg-gray-900"
      >
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-1 items-center justify-center rounded-xl px-4 py-3 transition-all duration-200 ${
                activeTab === id
                  ? "bg-green-500 text-white shadow-lg dark:bg-green-700"
                  : "text-gray-600 hover:text-green-600 dark:text-green-400 dark:hover:text-green-400"
              }`}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Ranking List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {loading ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-500 dark:border-green-700"></div>
            <p className="mt-4 text-gray-600">Ładowanie rankingu...</p>
          </div>
        ) : activeTab === "individual" ? (
          individualRanking.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl">🏆</div>
              <p className="text-gray-600">Brak danych w rankingu</p>
            </div>
          ) : (
            individualRanking.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`${getRankBg(user.rank).replace("bg-white", "bg-white dark:bg-gray-900")} rounded-2xl p-4 shadow-lg ${
                  user.rank <= 3 ? "text-white" : "bg-white dark:bg-gray-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4">{getRankIcon(user.rank)}</div>
                    <div className="flex items-center">
                      <div
                        className={`mr-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                          user.rank <= 3
                            ? "bg-white/20"
                            : "bg-green-100 dark:bg-green-900"
                        }`}
                      >
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span
                            className={`text-lg font-bold ${
                              user.rank <= 3
                                ? "text-white"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {user.displayName?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-bold ${
                            user.rank <= 3
                              ? "text-white"
                              : "text-gray-800 dark:text-white"
                          }`}
                        >
                          {user.displayName}
                        </h3>
                        <p
                          className={`text-sm ${
                            user.rank <= 3 ? "text-white/70" : "text-gray-600"
                          }`}
                        >
                          {user.school} • {user.className}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        user.rank <= 3
                          ? "text-white"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {user.points} pkt
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )
        ) : (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">🚧</div>
            <p className="text-gray-600">Ta funkcja będzie dostępna wkrótce</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
