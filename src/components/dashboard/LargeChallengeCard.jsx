import { CalendarClockIcon } from "lucide-react";

function LargeChallengeCard({ data }) {
  if (!data) return null;
  /* 
  Jeśli nie ma żadnego EkoWyzwania,
  nie wyświetlaj karty
  */

  const end = new Date(data.endDate.seconds * 1000);
  const now = new Date();
  const msLeft = Math.max(0, end - now);
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  const progressPct = Math.round(
    (data.classProgress.current / data.classProgress.total) * 100,
  );

  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-400 to-cyan-500 p-6 text-white dark:from-blue-800 dark:to-cyan-900 dark:text-white">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-2xl font-bold">{data.challengeName}</h4>
          <p className="mt-2 text-sm text-blue-100 dark:text-blue-200">
            {data.challengeDescription}
          </p>
        </div>
        <div className="flex items-center justify-items-center gap-2 text-right">
          {/* <div className="text-sm"></div> */}
          <CalendarClockIcon className="h-5 w-5 text-white" />
          <div className="font-semibold">{end.toLocaleDateString("pl-PL")}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="w-2/3">
          <div className="mb-1 flex items-center justify-between text-sm text-blue-100 dark:text-blue-200">
            <span>
              {data.classProgress.current} / {data.classProgress.total} uczniów
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/30 dark:bg-white/10">
            <div
              className="h-3 rounded-full bg-white transition-all duration-500 dark:bg-emerald-400"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>
        <div className="ml-4 text-sm dark:text-blue-100">
          <div className="mb-1">Pozostało</div>
          <div className="rounded-full bg-white/20 px-3 py-1 font-semibold dark:bg-white/10">
            {daysLeft} dni
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => console.log("DO IT")}
          className="rounded-full bg-white/20 px-4 py-2 font-semibold hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
        >
          Wykonaj działanie
        </button>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="h-56 animate-pulse rounded-3xl bg-gradient-to-r from-blue-400 to-cyan-500 p-6 text-white dark:from-blue-800 dark:to-cyan-900 dark:text-white">
      <div className="flex items-start justify-between">
        <div className="w-2/3">
          <div className="mb-2 h-8 w-40 rounded bg-white/30 dark:bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-white/20 dark:bg-white/10" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-white/30 dark:bg-white/10" />
          <div className="h-5 w-20 rounded bg-white/30 dark:bg-white/10" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="w-2/3">
          <div className="mb-2 h-3 w-full rounded bg-white/20 dark:bg-white/10" />
          <div className="h-3 w-full rounded bg-white/30 dark:bg-white/10" />
        </div>

        <div className="ml-4">
          <div className="mb-1 h-4 w-16 rounded bg-white/20 dark:bg-white/10" />
          <div className="h-8 w-20 rounded-full bg-white/30 dark:bg-white/10" />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="h-9 w-36 rounded-full bg-white/30 dark:bg-white/10" />
      </div>
    </div>
  );
}

LargeChallengeCard.Skeleton = Skeleton;

export default LargeChallengeCard;
