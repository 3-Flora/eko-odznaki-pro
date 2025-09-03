export function DashboardHeader({ name = "", text }) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white dark:from-green-700 dark:to-emerald-900">
      <h2 className="mb-2 text-2xl font-bold">Cześć, {name}! 👋</h2>
      <p className="text-white/90">{text}</p>
    </div>
  );
}
