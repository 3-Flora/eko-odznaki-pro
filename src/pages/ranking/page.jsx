import React, { useState, useEffect } from "react";
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
            limit(50)
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
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">
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
    <div className="flex flex-col gap-6 p-4 justify-normal">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-4xl mb-4">🏆</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ranking</h1>
        <p className="text-gray-600">Zobacz najlepszych eko-wojowników!</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-2 shadow-lg"
      >
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === id
                  ? "bg-green-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Ładowanie rankingu...</p>
          </div>
        ) : activeTab === "individual" ? (
          individualRanking.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-gray-600">Brak danych w rankingu</p>
            </div>
          ) : (
            individualRanking.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={`${getRankBg(user.rank)} rounded-2xl p-4 shadow-lg ${
                  user.rank <= 3 ? "text-white" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4">{getRankIcon(user.rank)}</div>
                    <div className="flex items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-3 ${
                          user.rank <= 3 ? "bg-white/20" : "bg-green-100"
                        }`}
                      >
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span
                            className={`text-lg font-bold ${
                              user.rank <= 3 ? "text-white" : "text-green-600"
                            }`}
                          >
                            {user.displayName?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-bold ${
                            user.rank <= 3 ? "text-white" : "text-gray-800"
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
                        user.rank <= 3 ? "text-white" : "text-green-600"
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
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚧</div>
            <p className="text-gray-600">Ta funkcja będzie dostępna wkrótce</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
