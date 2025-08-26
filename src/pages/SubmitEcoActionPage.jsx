import { useState } from "react";
import { Camera, Upload, CheckCircle, X, Plus } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router";
import ErrorMessage from "../components/ui/ErrorMessage";
import SuccessMessage from "../components/ui/SuccessMessage";
import BackButton from "../components/ui/BackButton";
import clsx from "clsx";
import { backgroundEcoAction as backgroundStyles } from "../utils/styleUtils";
import {
  uploadSubmissionPhotos,
  generateSubmissionId,
} from "../services/storageService";
import {
  validateImageFile,
  validateMultipleImageFiles,
  createImagePreview,
  calculateTotalSizeMB,
  formatFileSize,
} from "../utils/imageUtils";

export default function SubmitEcoActionPage() {
  const { submitEcoAction } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAction = location.state?.action;

  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]); // Array zamiast pojedynczego photo
  const [photoPreviews, setPhotoPreviews] = useState([]); // Array preview'ów
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null); // Dodany stan dla szczegółowego postępu

  const MAX_PHOTOS = 4;

  // Redirect if no action selected
  if (!selectedAction) {
    navigate("/submit");
    return null;
  }

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Sprawdź czy nie przekraczamy limitu zdjęć
    if (photos.length + files.length > MAX_PHOTOS) {
      setError(
        `Można dodać maksymalnie ${MAX_PHOTOS} zdjęcia. Obecnie masz ${photos.length} zdjęć. Spróbuj wybrać ${MAX_PHOTOS - photos.length} lub mniej zdjęć.`,
      );
      return;
    }

    // Walidacja wielu plików naraz
    const multiValidation = validateMultipleImageFiles(
      files,
      MAX_PHOTOS - photos.length,
    );
    if (!multiValidation.isValid) {
      setError(multiValidation.error);
      return;
    }

    try {
      setError(""); // Wyczyść poprzednie błędy
      const validFiles = [];
      const newPreviews = [];

      for (const file of files) {
        // Dodatkowa walidacja pojedynczego pliku
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          setError(validation.error);
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
          setSuccessMessage("✅ Dodano 1 zdjęcie");
        } else {
          setSuccessMessage(`✅ Dodano ${validFiles.length} zdjęć`);
        }

        // Wyczyść komunikaty po 3 sekundach
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Błąd podczas przetwarzania zdjęć:", err);
      setError("Błąd podczas przetwarzania zdjęć: " + err.message);
    }

    // Wyczyść input
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setError(""); // Wyczyść błędy
    setSuccessMessage(""); // Wyczyść komunikaty sukcesu
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccessMessage("");
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

      // Wyślij EkoDziałanie z URL'ami zdjęć
      await submitEcoAction(selectedAction, {
        photoUrls,
        comment,
      });

      setSubmitted(true);

      // Navigate back after 3 seconds
      setTimeout(() => {
        navigate("/submit");
      }, 3000);
    } catch (err) {
      console.error("Error submitting eco action:", err);
      setError(
        err.message ||
          "Wystąpił błąd podczas wysyłania EkoDziałania. Spróbuj ponownie.",
      );
    } finally {
      setLoading(false);
      setUploadProgress("");
      setUploadStatus(null);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
            Wysłano!
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Twoje EkoDziałanie zostało przesłane do weryfikacji przez
            nauczyciela
          </p>
          <div className="inline-block rounded-full bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="mr-1 inline h-4 w-4" />
            Oczekuje na zatwierdzenie
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        <ErrorMessage error={error} />
        <SuccessMessage success={successMessage} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Action Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-center">
              <div
                className={clsx(
                  "flex h-20 w-20 items-center justify-center rounded-2xl text-4xl",
                  backgroundStyles[selectedAction.style?.color || "default"],
                )}
              >
                {selectedAction.style?.icon || "!!!"}
              </div>
            </div>

            <div className="mb-4 text-center">
              <h3 className="mb-1 text-xl font-bold text-gray-800 dark:text-white">
                {selectedAction.name}
              </h3>
              <span
                className={clsx(
                  "inline-block rounded-full px-3 py-1 font-medium",
                  backgroundStyles[selectedAction.style?.color || "default"],
                )}
              >
                {selectedAction.category}
              </span>
            </div>

            <div className="rounded-xl">
              <p className="text-center text-gray-600 dark:text-gray-400">
                {selectedAction.description}
              </p>
            </div>
          </div>

          {/* Comment Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
              Opisz jak wykonałeś to działanie
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Opisz szczegóły wykonania tego EkoDziałania..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Photo Upload */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
              Dodaj zdjęcia (opcjonalne, max {MAX_PHOTOS})
            </label>

            {/* Photo Previews Grid */}
            {photoPreviews.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Informacja o rozmiarze */}
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {photos.length} {photos.length === 1 ? "zdjęcie" : "zdjęć"}{" "}
                    • Całkowity rozmiar:{" "}
                    {formatFileSize(calculateTotalSizeMB(photos) * 1024 * 1024)}
                  </span>
                </div>
              </div>
            )}

            {/* Add Photo Button */}
            {photos.length < MAX_PHOTOS && (
              <label className="block cursor-pointer">
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-green-400 dark:border-gray-600 dark:hover:border-green-500">
                  <Plus className="mx-auto mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {photos.length === 0
                      ? "Dotknij, aby dodać zdjęcia"
                      : `Dodaj kolejne zdjęcie (${photos.length}/${MAX_PHOTOS})`}
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

            {photos.length >= MAX_PHOTOS && (
              <div className="rounded-lg bg-gray-100 p-3 text-center dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dodano maksymalną liczbę zdjęć ({MAX_PHOTOS})
                </p>
              </div>
            )}

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
            disabled={loading}
            className="bottom-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 font-semibold text-white shadow-lg transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
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
                Wyślij działanie
                {photos.length > 0 && (
                  <span className="ml-1 text-sm opacity-80">
                    ({photos.length} {photos.length === 1 ? "zdjęcie" : "zdjęć"}
                    )
                  </span>
                )}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
