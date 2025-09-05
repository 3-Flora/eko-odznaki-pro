import SubmissionCard from "./SubmissionCard";
import { Clock } from "lucide-react";

export default function SubmissionsGrid({
  submissions,
  selectedType,
  selectedTab,
  getEcoActionById,
  getChallengeById,
  onViewDetails,
}) {
  if (submissions.length === 0) {
    return (
      <div className="col-span-full rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
        <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          {selectedTab === "pending"
            ? `Brak nowych ${selectedType === "actions" ? "EkoDziałań" : "EkoWyzwań"} do weryfikacji`
            : `Brak ${selectedTab === "approved" ? "zatwierdzonych" : "odrzuconych"} ${selectedType === "actions" ? "EkoDziałań" : "EkoWyzwań"}`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          selectedType={selectedType}
          getEcoActionById={getEcoActionById}
          getChallengeById={getChallengeById}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
