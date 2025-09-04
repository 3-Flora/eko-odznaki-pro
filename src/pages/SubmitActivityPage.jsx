import { useState, useEffect } from "react";
import { Upload, X, Plus, Eye, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router";
import clsx from "clsx";
import { backgroundEcoAction as backgroundStyles } from "../utils/styleUtils";
import {
  uploadSubmissionPhotos,
  generateSubmissionId,
} from "../services/storageService";
import { invalidateCachedUserSubmissions } from "../services/contentCache";
import {
  validateImageFile,
  validateMultipleImageFiles,
  createImagePreview,
} from "../utils/imageUtils";
import TextareaAutosize from "react-textarea-autosize";
import { useToast } from "../contexts/ToastContext";
import useSubmissionLimits from "../hooks/useSubmissionLimits";
import SubmissionLimitsInfo from "../components/ui/SubmissionLimitsInfo";

export default function SubmitActivityPage() {
  const { showError, showSuccess } = useToast();
  const { submitEcoAction, submitChallengeSubmission, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedAction = location.state?.action;
  const selectedChallenge = location.state?.challenge;

  const isChallenge = !!selectedChallenge;
  const selectedItem = selectedChallenge || selectedAction;

  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]); // Array zamiast pojedynczego photo
  const [photoPreviews, setPhotoPreviews] = useState([]); // Array preview'ów
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null); // Dodany stan dla szczegółowego postępu
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null); // Stan dla otwartego podglądu zdjęcia

  const MAX_PHOTOS = 4;

  // Hook do sprawdzania limitów
  const { limitData, stats, canSubmit, refresh } = useSubmissionLimits(
    selectedItem,
    isChallenge ? "challenge" : "eco_action",
    !!currentUser && !!selectedItem,
  );

  // Redirect if no action or challenge selected
  if (!selectedItem) {
    navigate("/submit");
    return null;
  }

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Sprawdź czy nie przekraczamy limitu zdjęć
    if (photos.length + files.length > MAX_PHOTOS) {
      showError(
        `Można dodać maksymalnie ${MAX_PHOTOS} zdjęcia. Obecnie masz ${photos.length} zdjęć. Spróbuj wybrać ${MAX_PHOTOS - photos.length} lub mniej zdjęć.`,
      );
      // clear input
      e.target.value = "";
      return;
    }

    // Walidacja wielu plików naraz
    const multiValidation = validateMultipleImageFiles(
      files,
      MAX_PHOTOS - photos.length,
    );
    if (!multiValidation.isValid) {
      showError(multiValidation.error);
      return;
    }

    try {
      const validFiles = [];
      const newPreviews = [];

      for (const file of files) {
        // Dodatkowa walidacja pojedynczego pliku
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          showError(validation.error);
          return; // Przerwij jeśli którykolwiek plik jest nieprawidłowy
        }

        // Utwórz preview
        const preview = await createImagePreview(file);

        validFiles.push(file);
        newPreviews.push(preview);
      }

      if (validFiles.length > 0) {
        setPhotos((prev) => [...prev, ...validFiles]);
        setPhotoPreviews((prev) => [...prev, ...newPreviews]);

        // Komunikat o pomyślnym dodaniu
        if (validFiles.length === 1) {
          showSuccess("✅ Dodano 1 zdjęcie");
        } else {
          showSuccess(`✅ Dodano ${validFiles.length} zdjęć`);
        }
      }
    } catch (err) {
      console.error("Błąd podczas przetwarzania zdjęć:", err);
      showError("Błąd podczas przetwarzania zdjęć: " + err.message);
    }

    // Wyczyść input
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    showSuccess("🗑️ Zdjęcie zostało usunięte");
    setSelectedPhotoIndex(null); // Zamknij popup po usunięciu
  };

  const openPhotoPreview = (index) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoPreview = () => {
    setSelectedPhotoIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sprawdź limity przed wysłaniem
    if (!canSubmit) {
      showError(
        "Nie możesz zgłosić tej aktywności z powodu osiągniętego limitu",
      );
      return;
    }

    setLoading(true);
    setUploadProgress("");
    setUploadStatus(null);

    try {
      let photoUrls = [];

      // Upload zdjęć jeśli są dodane
      if (photos.length > 0) {
        setUploadProgress("Rozpoczynam przesyłanie zdjęć...");

        // Generuj unikalny ID dla submission'u
        const submissionId = generateSubmissionId();

        // Upload wszystkich zdjęć z callback'iem postępu
        photoUrls = await uploadSubmissionPhotos(
          photos,
          submissionId,
          (progressInfo) => {
            setUploadStatus(progressInfo);
            setUploadProgress(progressInfo.message);
          },
        );

        setUploadProgress("Zapisywanie danych...");
        setUploadStatus(null);
      }

      // Wyślij odpowiednie zgłoszenie w zależności od typu
      if (isChallenge) {
        await submitChallengeSubmission(selectedChallenge, {
          photoUrls,
          comment,
        });
        showSuccess(
          "🎉 EkoWyzwanie zostało wysłane! Oczekuje na zatwierdzenie przez nauczyciela.",
        );
      } else {
        await submitEcoAction(selectedAction, {
          photoUrls,
          comment,
        });
        showSuccess(
          "🎉 EkoDziałanie zostało wysłane! Oczekuje na zatwierdzenie przez nauczyciela.",
        );
      }

      // Invalidate cached submissions for current user so other pages will refresh
      try {
        if (currentUser && currentUser.id) {
          invalidateCachedUserSubmissions(currentUser.id);
          // Set a lightweight flag so previous page can detect and refresh immediately
          try {
            localStorage.setItem(
              "submissions_needs_refresh",
              JSON.stringify({ ts: Date.now(), userId: currentUser.id }),
            );
          } catch (e) {
            // ignore storage errors
          }
        }
      } catch (e) {
        console.error("Failed to invalidate submissions cache:", e);
      }

      // Natychmiastowe przekierowanie
      navigate("/submit");
    } catch (err) {
      console.error("Error submitting eco action:", err);
      showError(
        err.message ||
          `Wystąpił błąd podczas wysyłania ${isChallenge ? "EkoWyzwania" : "EkoDziałania"}. Spróbuj ponownie.`,
      );
    } finally {
      setLoading(false);
      setUploadProgress("");
      setUploadStatus(null);
    }
  };

  return (
    <div className="lg:mx-auto lg:w-full lg:max-w-2xl">
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Action/Challenge Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-center">
              <div
                className={clsx(
                  "flex h-20 w-20 items-center justify-center rounded-2xl text-4xl",
                  isChallenge
                    ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                    : backgroundStyles[selectedItem.style?.color || "default"],
                )}
              >
                {isChallenge ? "🏆" : selectedItem.style?.icon || "!!!"}
              </div>
            </div>

            <div className="mb-4 text-center">
              <h3 className="mb-1 text-xl font-bold text-gray-800 dark:text-white">
                {selectedItem.name || selectedItem.title}
              </h3>
              <span
                className={clsx(
                  "inline-block rounded-full px-3 py-1 font-medium",
                  isChallenge
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : backgroundStyles[selectedItem.style?.color || "default"],
                )}
              >
                {isChallenge ? "EkoWyzwanie" : selectedItem.category}
              </span>
            </div>

            <div className="rounded-xl">
              <p className="text-center text-gray-600 dark:text-gray-400">
                {selectedItem.description}
              </p>
            </div>

            {/* Informacje o limitach */}
            {limitData && (
              <SubmissionLimitsInfo
                limitData={limitData}
                stats={stats}
                type={isChallenge ? "challenge" : "eco_action"}
              />
            )}
          </div>

          {/* Comment Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
              {isChallenge
                ? "Opisz jak wykonałeś to wyzwanie"
                : "Opisz jak wykonałeś to działanie"}
            </label>
            <TextareaAutosize
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isChallenge
                  ? "Opisz szczegóły wykonania tego EkoWyzwania..."
                  : "Opisz szczegóły wykonania tego EkoDziałania..."
              }
              minRows={4}
              className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Photo Upload */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
              Dodaj zdjęcia (opcjonalne, max {MAX_PHOTOS})
            </label>

            {/* Photo Previews Grid */}
            <div className="mb-4">
              <div className="grid grid-flow-dense grid-cols-2 gap-2">
                {photoPreviews.length > 0 &&
                  photoPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative"
                      onClick={() => openPhotoPreview(index)}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full cursor-pointer rounded-lg object-cover transition-opacity group-hover:opacity-75"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Eye className="h-6 w-6 text-white drop-shadow-lg" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                {photos.length < MAX_PHOTOS && (
                  <label
                    className={clsx(
                      "h-24 cursor-pointer items-center justify-center",
                      photos.length === 0 && "col-span-2",
                      photos.length === 2 && "col-span-2",
                    )}
                  >
                    <div className="flex h-full flex-col justify-center rounded-xl border-2 border-dashed border-gray-300 p-1 text-center transition hover:border-green-400 dark:border-gray-600 dark:hover:border-green-500">
                      <Plus className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Dotknij, aby dodać zdjęcia
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Status i komunikaty */}
            {uploadProgress && !loading && (
              <div className="mt-3 rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
                <p className="text-sm text-green-700 dark:text-green-300">
                  {uploadProgress}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className={clsx(
              "bottom-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white shadow-lg transition duration-200",
              canSubmit && !loading
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : "cursor-not-allowed bg-gray-400",
            )}
          >
            {loading ? (
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  {uploadStatus && (
                    <span className="text-sm opacity-90">
                      {uploadStatus.percentage}%
                    </span>
                  )}
                </div>
                {uploadProgress && (
                  <span className="max-w-64 text-center text-xs opacity-80">
                    {uploadProgress}
                  </span>
                )}
                {uploadStatus && (
                  <div className="h-1.5 w-32 rounded-full bg-white/20">
                    <div
                      className="h-1.5 rounded-full bg-white transition-all duration-300"
                      style={{ width: `${uploadStatus.percentage}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                {!canSubmit
                  ? "Limit osiągnięty"
                  : isChallenge
                    ? "Wyślij wyzwanie"
                    : "Wyślij działanie"}
              </>
            )}
          </button>
        </form>

        {/* Photo Preview Modal */}
        {selectedPhotoIndex !== null && (
          <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="relative max-h-full max-w-full">
              <img
                src={photoPreviews[selectedPhotoIndex]}
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

              {/* Delete button */}
              <button
                onClick={() => removePhoto(selectedPhotoIndex)}
                className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {/* Photo counter */}
              <div className="bg-opacity-60 absolute bottom-2 left-2 rounded-lg bg-black px-2 py-1 text-sm text-white">
                {selectedPhotoIndex + 1} / {photoPreviews.length}
              </div>
            </div>

            {/* Background click to close */}
            <div
              className="absolute inset-0 -z-10"
              onClick={closePhotoPreview}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
