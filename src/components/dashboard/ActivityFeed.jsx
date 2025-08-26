import { Users } from "lucide-react";

function ActivityFeed({ data }) {
  const feedItems = data?.feedItems || [];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Co słychać w klasie?
        </h3>
        <Users className="h-5 w-5 text-gray-400 dark:text-gray-300" />
      </div>

      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Tutaj znajdziesz ostatnie aktywności i działania w klasie.
      </p>

      {feedItems.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h4 className="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">
            Brak aktywności
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            W klasie nie ma jeszcze żadnych aktywności.
            <br />
            Wykonuj EkoDziałania i EkoWyzwania, aby zobaczyć je tutaj!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedItems.map((item, i) => (
            <div key={item.id} className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 font-semibold text-white dark:bg-green-600">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-800 dark:text-white">
                  {item.text}
                </div>
                <div className="mt-1 text-xs text-gray-400 dark:text-gray-400">
                  {item.timestamp
                    ? new Date(
                        item.timestamp?.toDate
                          ? item.timestamp.toDate()
                          : item.timestamp,
                      ).toLocaleString("pl-PL")
                    : "Brak daty"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="mb-4 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

ActivityFeed.Skeleton = Skeleton;
export default ActivityFeed;
