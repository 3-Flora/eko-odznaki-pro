export const availableBadges = [
  {
    id: "eco-warrior",
    name: "Eco Warrior",
    description: "Zdobądź pierwsze 50 punktów",
    icon: "🌱",
    color: "bg-green-500",
    lvl: 1,
  },
  {
    id: "green-champion",
    name: "Green Champion",
    description: "Osiągnij 200 punktów",
    icon: "🏆",
    color: "bg-green-500",
    lvl: 2,
  },
  {
    id: "yellow-champion",
    name: "Yellow Champion",
    description: "Osiągnij 300 punktów",
    icon: "🏆",
    color: "bg-yellow-500",
    lvl: 2,
  },
  {
    id: "nature-guardian",
    name: "Nature Guardian",
    description: "Zdobądź 500 punktów",
    icon: "🌳",
    color: "bg-emerald-600",
    lvl: 3,
  },
  {
    id: "planet-protector",
    name: "Planet Protector",
    description: "Osiągnij 1000 punktów",
    icon: "🌍",
    color: "bg-blue-600",
    lvl: 6,
  },
  {
    id: "cycling-hero",
    name: "Cycling Hero",
    description: "Zgłoś 10 przejazdów rowerem",
    icon: "🚴",
    color: "bg-orange-500",
    lvl: 2,
  },
  {
    id: "cleanup-master",
    name: "Cleanup Master",
    description: "Weź udział w 5 sprzątaniach",
    icon: "🧹",
    color: "bg-purple-500",
    lvl: 1,
  },
];

export const activityCategories = [
  {
    id: "transport",
    name: "Transport",
    icon: "🚴",
    color: "bg-green-500",
  },
  {
    id: "recycling",
    name: "Segregacja",
    icon: "♻️",
    color: "bg-blue-500",
  },
  {
    id: "energy",
    name: "Energia",
    icon: "💡",
    color: "bg-yellow-500",
  },
  { id: "water", name: "Woda", icon: "💧", color: "bg-cyan-500" },
  {
    id: "cleanup",
    name: "Sprzątanie",
    icon: "🧹",
    color: "bg-purple-500",
  },
  {
    id: "nature",
    name: "Przyroda",
    icon: "🌱",
    color: "bg-emerald-500",
  },
  {
    id: "education",
    name: "Edukacja",
    icon: "📚",
    color: "bg-indigo-500",
  },
];

export const currentChallenge = {
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

export const upcomingChallenges = [
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

export const completedChallenges = [
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
