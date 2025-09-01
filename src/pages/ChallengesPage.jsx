import { Calendar, Users, Gift } from "lucide-react";

export default function ChallengesPage() {
  return (
    <>
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 text-4xl">🎯</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Wyzwania
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Dołącz do wyzwań i zdobywaj bonusowe punkty!
        </p>
      </div>

      {/* Current Challenge */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white dark:from-blue-800 dark:to-purple-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 text-3xl">{currentChallenge.icon}</div>
            <div>
              <h2 className="text-xl font-bold">{currentChallenge.title}</h2>
              <p className="text-sm text-blue-100">Aktualne wyzwanie</p>
            </div>
          </div>
          <div className="text-center">
            <div className="rounded-xl bg-white/20 px-3 py-2 dark:bg-white/10">
              <p className="text-sm font-medium">Bonus</p>
              <p className="text-lg font-bold">
                +{currentChallenge.bonusPoints}
              </p>
            </div>
          </div>
        </div>

        <p className="mb-4 text-blue-100">{currentChallenge.description}</p>

        <div className="mb-4">
          <div className="mb-2 flex justify-between text-sm">
            <span>Postęp: {currentChallenge.progress}%</span>
            <span>Pozostało {currentChallenge.daysLeft} dni</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/20 dark:bg-white/10">
            <div
              className="h-3 rounded-full bg-white transition-all duration-500 dark:bg-blue-200"
              style={{ width: `${currentChallenge.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Users className="mr-1 h-4 w-4" />
            <span>{currentChallenge.participants} uczestników</span>
          </div>
          <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-600 transition hover:bg-blue-50 dark:bg-gray-900 dark:text-purple-300 dark:hover:bg-blue-900">
            Weź udział
          </button>
        </div>
      </div>

      {/* Upcoming Challenges */}
      <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
          Nadchodzące wyzwania
        </h3>
        <div className="space-y-4">
          {upcomingChallenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className="flex cursor-pointer items-center rounded-xl bg-gray-50 p-4 transition-colors hover:bg-green-50 dark:bg-gray-900 dark:hover:bg-green-900"
            >
              <div className="mr-4 text-2xl">{challenge.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  {challenge.title}
                </h4>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                  {challenge.description}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>
                    {challenge.startDate.toLocaleDateString("pl-PL")} -{" "}
                    {challenge.endDate.toLocaleDateString("pl-PL")}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="rounded-lg bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <Gift className="mx-auto mb-1 h-4 w-4" />
                  <p className="text-xs font-bold">+{challenge.bonusPoints}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Challenges */}
      <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
          Ukończone wyzwania
        </h3>
        <div className="space-y-4">
          {completedChallenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className="flex items-center rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900"
            >
              <div className="mr-4 text-2xl">{challenge.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  {challenge.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {challenge.description}
                </p>
              </div>
              <div className="text-center">
                <div className="rounded-lg bg-green-500 px-3 py-2 text-white dark:bg-green-700 dark:text-green-100">
                  <p className="text-xs">Zdobyto</p>
                  <p className="text-sm font-bold">+{challenge.earnedPoints}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge Tips */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 p-6 text-white dark:from-emerald-700 dark:to-green-900">
        <h3 className="mb-2 text-lg font-bold">💡 Wskazówka</h3>
        <p className="text-green-100 dark:text-green-200">
          Uczestnicząc w wyzwaniach możesz zdobyć znacznie więcej punktów!
          Pamiętaj, że każde wyzwanie ma określony czas trwania i bonusowe
          punkty.
        </p>
      </div>
    </>
  );
}
