import {
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";
import Button from "../ui/Button";
import clsx from "clsx";

export default function SubmissionCard({
  submission,
  selectedType,
  getEcoActionById,
  getChallengeById,
  onViewDetails,
}) {
  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          text: "Zatwierdzone",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
        };
      case "rejected":
        return {
          icon: XCircle,
          text: "Odrzucone",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
        };
      default:
        return {
          icon: Clock,
          text: "Oczekuje",
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
        };
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("pl", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const statusInfo = getStatusInfo(submission.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800">
      {/* Header z użytkownikiem i statusem */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <User className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {submission.studentName || "Nieznany uczeń"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              {formatDate(submission.createdAt)}
            </div>
          </div>
        </div>

        <div
          className={clsx(
            "inline-flex items-center gap-1 rounded-full p-2 text-sm",
            statusInfo.bgColor,
            statusInfo.color,
          )}
        >
          <StatusIcon className="h-4 w-4" />
        </div>
      </div>

      {/* Szczegóły EkoDziałania lub EkoWyzwania */}
      <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
        <h4 className="mb-2 font-medium text-gray-800 dark:text-white">
          {selectedType === "actions" ? "EkoDziałanie" : "EkoWyzwanie"}
        </h4>
        {selectedType === "actions"
          ? (() => {
              const ecoAction = getEcoActionById(submission.ecoActivityId);
              if (ecoAction) {
                return (
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                      style={{
                        backgroundColor: ecoAction.style.color,
                      }}
                    >
                      <span className="text-lg">{ecoAction.style.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {ecoAction.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {ecoAction.category}
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ID: {submission.ecoActivityId}
                  </p>
                );
              }
            })()
          : (() => {
              const challenge = getChallengeById(submission.ecoActivityId);
              if (challenge) {
                return (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white">
                      <span className="text-lg">🏆</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {challenge.challengeName || challenge.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {challenge.category || "EkoWyzwanie"}
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ID: {submission.ecoActivityId}
                  </p>
                );
              }
            })()}
      </div>

      {/* Komentarz ucznia */}
      {submission.comment && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Komentarz ucznia
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {submission.comment.length > 128
              ? submission.comment.slice(0, 128) + "..."
              : submission.comment}
          </p>
        </div>
      )}

      {/* Zdjęcia */}
      {submission.photoUrls && submission.photoUrls.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Zdjęcia
            </span>
          </div>
          <div className="flex gap-2">
            {submission.photoUrls.slice(0, 3).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Zdjęcie ${index + 1}`}
                className="h-16 w-16 rounded-lg object-cover"
                loading="lazy"
              />
            ))}
            {submission.photoUrls.length > 3 && (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                +{submission.photoUrls.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Przycisk do szczegółów */}
      <div className="mt-auto pt-2">
        <Button
          onClick={() => onViewDetails(submission.id)}
          className="w-full rounded-lg bg-blue-500 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Zobacz szczegóły
        </Button>
      </div>

      {/* Info o recenzji */}
      {submission.reviewedAt && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Sprawdzone: {formatDate(submission.reviewedAt)}
        </div>
      )}
    </div>
  );
}
