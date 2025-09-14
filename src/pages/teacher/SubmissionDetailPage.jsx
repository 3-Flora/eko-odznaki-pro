import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate, useParams } from "react-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getEcoActions } from "../../services/ecoActionService";
import { getEcoChallenges } from "../../services/ecoChallengeService";
import {
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Calendar,
  User,
  X,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import clsx from "clsx";

export default function SubmissionDetailPage() {
  const { submissionId } = useParams();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [ecoAction, setEcoAction] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Stan dla popupu odrzucenia
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Stan dla podglądu zdjęć
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  // Załaduj szczegóły zgłoszenia
  useEffect(() => {
    const loadSubmissionDetails = async () => {
      try {
        setLoading(true);

        // Pobierz dane EkoDziałań i EkoWyzwań
        const [ecoActionsData, challengesData] = await Promise.all([
          getEcoActions(),
          getEcoChallenges(),
        ]);

        // Pobierz szczegóły zgłoszenia
        const submissionDoc = await getDoc(
          doc(db, "submissions", submissionId),
        );
        if (!submissionDoc.exists()) {
          showError("Nie znaleziono zgłoszenia");
          navigate(-1);
          return;
        }

        const submissionData = {
          id: submissionDoc.id,
          ...submissionDoc.data(),
          createdAt: submissionDoc.data().createdAt?.toDate() || new Date(),
          reviewedAt: submissionDoc.data().reviewedAt?.toDate(),
        };

        setSubmission(submissionData);

        // Sprawdź czy to zgłoszenie EkoDziałania czy EkoWyzwania
        if (submissionData.type === "eco_action") {
          // Znajdź odpowiednie EkoDziałanie
          const foundEcoAction = ecoActionsData.find(
            (action) => action.id === submissionData.ecoActivityId,
          );
          setEcoAction(foundEcoAction);
        } else if (submissionData.type === "challenge") {
          // Znajdź odpowiednie EkoWyzwanie
          const foundChallenge = challengesData.find(
            (challenge) => challenge.id === submissionData.ecoActivityId,
          );
          setChallenge(foundChallenge);
        }
      } catch (error) {
        console.error("Error loading submission details:", error);
        showError("Błąd podczas ładowania szczegółów zgłoszenia");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      loadSubmissionDetails();
    }
  }, [submissionId, navigate, showError]);

  // Funkcja do obsługi odrzucenia z powodem
  const handleRejectSubmission = () => {
    setShowRejectModal(true);
  };

  // Funkcja do potwierdzenia odrzucenia
  const confirmRejectSubmission = async () => {
    if (!currentUser?.id) {
      showError("Brak uprawnień do wykonania tej akcji");
      return;
    }

    setUpdating(true);

    try {
      const submissionRef = doc(db, "submissions", submissionId);
      await updateDoc(submissionRef, {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: currentUser.id,
        rejectionReason: rejectionReason,
      });

      // Aktualizuj lokalny stan
      setSubmission((prev) => ({
        ...prev,
        status: "rejected",
        reviewedAt: new Date(),
        rejectionReason: rejectionReason,
      }));

      showSuccess(
        `${submission?.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"} zostało odrzucone`,
      );

      // Resetuj modal
      setShowRejectModal(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting submission:", error);
      showError("Błąd podczas odrzucania zgłoszenia");
    } finally {
      setUpdating(false);
    }
  };

  // Funkcja do aktualizacji statusu zgłoszenia
  const handleUpdateSubmission = async (status) => {
    if (!currentUser?.id) {
      showError("Brak uprawnień do wykonania tej akcji");
      return;
    }

    setUpdating(true);

    try {
      const submissionRef = doc(db, "submissions", submissionId);
      await updateDoc(submissionRef, {
        status: status,
        reviewedAt: new Date(),
        reviewedBy: currentUser.id,
      });

      // Aktualizuj lokalny stan
      setSubmission((prev) => ({
        ...prev,
        status: status,
        reviewedAt: new Date(),
      }));

      showSuccess(
        status === "approved"
          ? `${submission.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"} zostało zatwierdzone`
          : `${submission.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"} zostało odrzucone`,
      );
    } catch (error) {
      console.error("Error updating submission:", error);
      showError("Błąd podczas aktualizacji zgłoszenia");
    } finally {
      setUpdating(false);
    }
  };

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
          text: "Oczekuje na weryfikację",
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
        };
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("pl", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const openPhotoPreview = (index) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoPreview = () => {
    setSelectedPhotoIndex(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Nie znaleziono zgłoszenia
          </p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Powróć
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(submission.status);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <PageHeader
        emoji={submission?.type === "eco_action" ? "📄" : "🏆"}
        title="Szczegóły zgłoszenia"
        subtitle={`Weryfikacja ${submission?.type === "eco_action" ? "EkoDziałania" : "EkoWyzwania"}`}
        showBackButton
      />

      <div className="space-y-6">
        {/* Status zgłoszenia */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Status weryfikacji
            </h2>
            <div
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-4 py-2",
                statusInfo.bgColor,
                statusInfo.color,
              )}
            >
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">{statusInfo.text}</span>
            </div>
          </div>
        </div>
        {/* Informacje o uczniu */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`Pokaż profil ucznia ${submission.studentName || "Nieznany"}`}
          onClick={() => {
            if (submission?.studentId) {
              navigate(`/teacher/student/${submission.studentId}`);
            } else {
              showError("Brak ID ucznia");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (submission?.studentId) {
                navigate(`/teacher/student/${submission.studentId}`);
              } else {
                showError("Brak ID ucznia");
              }
            }
          }}
          className="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Informacje o uczniu
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <User className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                {submission.studentName || "Nieznany uczeń"}
              </h4>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Zgłoszono: {formatDate(submission.createdAt)}</span>
              </div>
              {submission.reviewedAt && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Sprawdzono: {formatDate(submission.reviewedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Szczegóły EkoDziałania lub EkoWyzwania */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            {submission.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"}
          </h3>

          {/* Wyświetl EkoDziałanie */}
          {submission.type === "eco_action" && ecoAction ? (
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: ecoAction.style.color }}
              >
                <span className="text-2xl">{ecoAction.style.icon}</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {ecoAction.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Kategoria: {ecoAction.category}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {ecoAction.description}
                </p>
              </div>
            </div>
          ) : submission.type === "eco_action" ? (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                ID EkoDziałania: {submission.ecoActivityId}
              </p>
            </div>
          ) : null}

          {/* Wyświetl EkoWyzwanie */}
          {submission.type === "challenge" && challenge ? (
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {challenge.challengeName || challenge.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Kategoria: {challenge.category || "EkoWyzwanie"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {challenge.challengeDescription || challenge.description}
                </p>
                {challenge.startDate && challenge.endDate && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      Okres:{" "}
                      {formatDate(
                        challenge.startDate.toDate
                          ? challenge.startDate.toDate()
                          : new Date(challenge.startDate),
                      )}{" "}
                      -{" "}
                      {formatDate(
                        challenge.endDate.toDate
                          ? challenge.endDate.toDate()
                          : new Date(challenge.endDate),
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : submission.type === "challenge" ? (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                ID EkoWyzwania: {submission.ecoActivityId}
              </p>
            </div>
          ) : null}
        </div>
        {/* Komentarz ucznia */}
        {submission.comment && (
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Komentarz ucznia
              </h3>
            </div>
            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              {submission.comment}
            </p>
          </div>
        )}
        {/* Zdjęcia */}
        {submission.photoUrls && submission.photoUrls.length > 0 && (
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Zdjęcia
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {submission.photoUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Zdjęcie ${index + 1}`}
                  className="aspect-square cursor-pointer rounded-lg object-cover shadow-sm transition-opacity hover:opacity-75"
                  loading="lazy"
                  onClick={() => openPhotoPreview(index)}
                />
              ))}
            </div>
          </div>
        )}
        {/* Powód odrzucenia */}
        {submission.status === "rejected" && submission.rejectionReason && (
          <div className="rounded-xl bg-red-50 p-6 shadow-sm dark:bg-red-900/20">
            <h3 className="mb-3 text-lg font-semibold text-red-800 dark:text-red-300">
              Powód odrzucenia
            </h3>
            <p className="text-red-700 dark:text-red-400">
              {submission.rejectionReason}
            </p>
          </div>
        )}
        {/* Akcje weryfikacji */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Weryfikacja zgłoszenia
          </h3>
          <div className="flex gap-4">
            {/* Przycisk zatwierdzenia - ukryj jeśli już zatwierdzone */}
            {submission.status !== "approved" && (
              <Button
                onClick={() => handleUpdateSubmission("approved")}
                disabled={updating}
              >
                {updating
                  ? "Przetwarzanie..."
                  : `Zatwierdź ${submission.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"}`}
              </Button>
            )}

            {/* Przycisk odrzucenia - ukryj jeśli już odrzucone */}
            {submission.status !== "rejected" && (
              <Button
                onClick={handleRejectSubmission}
                disabled={updating}
                style="danger"
              >
                {updating
                  ? "Przetwarzanie..."
                  : `Odrzuć ${submission.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"}`}
              </Button>
            )}

            {/* Komunikat gdy zgłoszenie jest już przetworzone */}
            {(submission.status === "approved" ||
              submission.status === "rejected") && (
              <div className="flex w-full items-center justify-center rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                <span className="text-center text-gray-600 dark:text-gray-300">
                  {submission.status === "approved"
                    ? `✓ ${submission.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"} zostało zatwierdzone`
                    : `✗ ${submission.type === "eco_action" ? "EkoDziałanie" : "EkoWyzwanie"} zostało odrzucone`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal odrzucenia zgłoszenia */}
      {showRejectModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Odrzuć{" "}
              {submission.type === "eco_action"
                ? "EkoDziałanie"
                : "EkoWyzwanie"}
            </h3>

            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Podaj powód odrzucenia tego zgłoszenia:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Wpisz powód odrzucenia..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              rows={4}
            />

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="flex-1 rounded-lg bg-gray-200 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Anuluj
              </Button>
              <Button
                onClick={confirmRejectSubmission}
                disabled={!rejectionReason.trim() || updating}
                className="flex-1 rounded-lg bg-red-500 py-2 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {updating ? "..." : "Odrzuć"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Photo Preview Modal */}
      {selectedPhotoIndex !== null && submission.photoUrls && (
        <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative max-h-full max-w-full">
            <img
              src={submission.photoUrls[selectedPhotoIndex]}
              alt={`Podgląd zdjęcia ${selectedPhotoIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />

            {/* Close button */}
            <button
              onClick={closePhotoPreview}
              className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white transition hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Photo counter */}
            <div className="bg-opacity-60 absolute bottom-2 left-2 rounded-lg bg-black px-2 py-1 text-sm text-white">
              {selectedPhotoIndex + 1} / {submission.photoUrls.length}
            </div>
          </div>

          {/* Background click to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closePhotoPreview}
          ></div>
        </div>
      )}
    </>
  );
}
