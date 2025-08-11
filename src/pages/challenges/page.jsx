import React from "react";
import { Calendar, Users, Gift } from "lucide-react";
import { motion } from "framer-motion";

export default function ChallengesPage() {
  const currentChallenge = {
    id: 1,
    title: "Tydzień bez plastiku",
    description:
      "Unikaj jednorazowych przedmiotów plastikowych przez cały tydzień",
    icon: "🚫🥤",
    bonusPoints: 50,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-01-21"),
    participants: 234,
    daysLeft: 3,
    progress: 60,
  };

  const upcomingChallenges = [
    {
      id: 2,
      title: "Eko-transport",
      description: "Przez tydzień używaj tylko transportu ekologicznego",
      icon: "🚴‍♀️",
      bonusPoints: 40,
      startDate: new Date("2024-01-22"),
      endDate: new Date("2024-01-28"),
    },
    {
      id: 3,
      title: "Oszczędzanie energii",
      description: "Zmniejsz zużycie energii w domu o 20%",
      icon: "💡",
      bonusPoints: 35,
      startDate: new Date("2024-01-29"),
      endDate: new Date("2024-02-04"),
    },
    {
      id: 4,
      title: "Zero waste lunch",
      description: "Przynoś do szkoły lunch bez opakowań jednorazowych",
      icon: "🥪",
      bonusPoints: 30,
      startDate: new Date("2024-02-05"),
      endDate: new Date("2024-02-11"),
    },
  ];

  const completedChallenges = [
    {
      id: 5,
      title: "Segregacja mistrzów",
      description: "Prawidłowo segreguj śmieci przez 2 tygodnie",
      icon: "♻️",
      bonusPoints: 45,
      completed: true,
      earnedPoints: 45,
    },
    {
      id: 6,
      title: "Wodne oszczędności",
      description: "Zmniejsz zużycie wody w domu",
      icon: "💧",
      bonusPoints: 25,
      completed: true,
      earnedPoints: 25,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 justify-normal">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-4 text-4xl">🎯</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Wyzwania</h1>
        <p className="text-gray-600">
          Dołącz do wyzwań i zdobywaj bonusowe punkty!
        </p>
      </motion.div>

      {/* Current Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="mr-3 text-3xl">{currentChallenge.icon}</div>
            <div>
              <h2 className="text-xl font-bold">{currentChallenge.title}</h2>
              <p className="text-sm text-blue-100">Aktualne wyzwanie</p>
            </div>
          </div>
          <div className="text-center">
            <div className="px-3 py-2 bg-white/20 rounded-xl">
              <p className="text-sm font-medium">Bonus</p>
              <p className="text-lg font-bold">
                +{currentChallenge.bonusPoints}
              </p>
            </div>
          </div>
        </div>

        <p className="mb-4 text-blue-100">{currentChallenge.description}</p>

        <div className="mb-4">
          <div className="flex justify-between mb-2 text-sm">
            <span>Postęp: {currentChallenge.progress}%</span>
            <span>Pozostało {currentChallenge.daysLeft} dni</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/20">
            <div
              className="h-3 transition-all duration-500 bg-white rounded-full"
              style={{ width: `${currentChallenge.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1" />
            <span>{currentChallenge.participants} uczestników</span>
          </div>
          <button className="px-4 py-2 text-sm font-semibold text-purple-600 transition bg-white rounded-xl hover:bg-blue-50">
            Weź udział
          </button>
        </div>
      </motion.div>

      {/* Upcoming Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-white shadow-lg rounded-2xl"
      >
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          Nadchodzące wyzwania
        </h3>
        <div className="space-y-4">
          {upcomingChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center p-4 transition-colors cursor-pointer bg-gray-50 rounded-xl hover:bg-green-50"
            >
              <div className="mr-4 text-2xl">{challenge.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">
                  {challenge.title}
                </h4>
                <p className="mb-2 text-sm text-gray-600">
                  {challenge.description}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    {challenge.startDate.toLocaleDateString("pl-PL")} -{" "}
                    {challenge.endDate.toLocaleDateString("pl-PL")}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="px-2 py-1 text-green-800 bg-green-100 rounded-lg">
                  <Gift className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-xs font-bold">+{challenge.bonusPoints}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Completed Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-white shadow-lg rounded-2xl"
      >
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          Ukończone wyzwania
        </h3>
        <div className="space-y-4">
          {completedChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center p-4 border border-green-200 bg-green-50 rounded-xl"
            >
              <div className="mr-4 text-2xl">{challenge.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">
                  {challenge.title}
                </h4>
                <p className="text-sm text-gray-600">{challenge.description}</p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 text-white bg-green-500 rounded-lg">
                  <p className="text-xs">Zdobyto</p>
                  <p className="text-sm font-bold">+{challenge.earnedPoints}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Challenge Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 text-white bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl"
      >
        <h3 className="mb-2 text-lg font-bold">💡 Wskazówka</h3>
        <p className="text-green-100">
          Uczestnicząc w wyzwaniach możesz zdobyć znacznie więcej punktów!
          Pamiętaj, że każde wyzwanie ma określony czas trwania i bonusowe
          punkty.
        </p>
      </motion.div>
    </div>
  );
}
