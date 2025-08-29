import { useState } from "react";
import { Upload, X, Plus, Eye, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router";
import clsx from "clsx";
import {
  uploadSubmissionPhotos,
  generateSubmissionId,
} from "../services/storageService";
import {
  validateImageFile,
  validateMultipleImageFiles,
  createImagePreview,
} from "../utils/imageUtils";
import TextareaAutosize from "react-textarea-autosize";
import { useToast } from "../contexts/ToastContext";

export default function SubmitChallengePage() {
  const { showError, showSuccess } = useToast();
  const { submitChallengeSubmission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedChallenge = location.state?.challenge;

  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]); // Array zamiast pojedynczego photo
  const [photoPreviews, setPhotoPreviews] = useState([]); // Array preview'ów
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null); // Dodany stan dla szczegółowego postępu
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null); // Stan dla otwartego podglądu zdjęcia

  const MAX_PHOTOS = 4;

  // Redirect if no challenge selected
  if (!selectedChallenge) {
    navigate("/submit");
    return null;
  }

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    console.log("photochange");
    // Sprawdź czy nie przekraczamy limitu zdjęć
    if (photos.length + files.length > MAX_PHOTOS) {
      showError(
        `Możesz dodać maksymalnie ${MAX_PHOTOS} zdjęcia. Obecnie masz ${photos.length} zdjęć.`,
      );
      return;
    }

    // Walidacja plików
    const validation = validateMultipleImageFiles(files);
    if (!validation.isValid) {
      showError(validation.error);
      return;
    }

    // Dodaj nowe pliki do istniejących
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Generuj preview dla nowych plików
    const newPreviews = [];
    for (const file of files) {
      try {
        const preview = await createImagePreview(file);
        newPreviews.push(preview);
      } catch (error) {
        console.error("Error creating preview:", error);
        showError("Błąd podczas tworzenia podglądu zdjęcia");
      }
    }

    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const openPhotoPreview = (index) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoPreview = () => {
    setSelectedPhotoIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim() && photos.length === 0) {
      showError("Dodaj komentarz lub zdjęcie");
      return;
    }

    setLoading(true);
    setUploadProgress("Przygotowywanie zgłoszenia...");
    setUploadStatus("Przygotowywanie zgłoszenia...");

    try {
      // Upload zdjęć jeśli są
      let photoUrls = [];
      if (photos.length > 0) {
        setUploadProgress("Przesyłanie zdjęć...");
        setUploadStatus("Przesyłanie zdjęć...");

        const submissionId = generateSubmissionId();
        photoUrls = await uploadSubmissionPhotos(photos, submissionId);
      }

      setUploadProgress("Zapisywanie zgłoszenia...");
      setUploadStatus("Zapisywanie zgłoszenia...");

      // Przygotuj dane zgłoszenia
      const submissionData = {
        comment: comment.trim(),
        photoUrls,
      };

      // Wyślij zgłoszenie wyzwania
      await submitChallengeSubmission(selectedChallenge, submissionData);

      showSuccess("Wyzwanie zostało zgłoszone!");
      navigate("/submit");
    } catch (error) {
      console.error("Error submitting challenge:", error);
      showError("Wystąpił błąd podczas zgłaszania wyzwania");
    } finally {
      setLoading(false);
      setUploadProgress("");
      setUploadStatus(null);
    }
  };

  return (
    <div className="min-h-svh bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm dark:bg-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate("/submit")}
            className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Powrót
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            Zgłoś Wyzwanie
          </h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="p-4">
        {/* Challenge Info */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="mb-4 flex items-center">
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-2xl">
              🏆
            </div>
            <div>
              <div className="mb-1 flex items-center">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  {selectedChallenge.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {selectedChallenge.name}
              </h2>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedChallenge.description}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Comment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Komentarz (opcjonalne)
            </label>
            <TextareaAutosize
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Opisz jak wykonałeś wyzwanie..."
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              minRows={3}
              maxRows={6}
            />
          </div>

          {/* Photos */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zdjęcia (opcjonalne) - max {MAX_PHOTOS}
            </label>

            {/* Photo Grid */}
            {photoPreviews.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-3">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Zdjęcie ${index + 1}`}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    <div className="bg-opacity-0 hover:bg-opacity-30 absolute inset-0 flex items-center justify-center rounded-xl bg-black transition-all duration-200">
                      <div className="flex space-x-2 opacity-0 transition-opacity duration-200 hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => openPhotoPreview(index)}
                          className="rounded-full bg-white p-2 text-gray-800 shadow-lg hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Photo Button */}
            {photos.length < MAX_PHOTOS && (
              <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-green-400 hover:bg-green-50 hover:text-green-500 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-400 dark:hover:bg-green-900/20">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Plus className="mb-2 h-8 w-8" />
                <span className="text-sm font-medium">Dodaj zdjęcie</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF do 10MB
                </span>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full rounded-xl px-6 py-4 font-semibold text-white transition-all duration-200",
              loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-500 hover:bg-green-600 active:scale-95",
            )}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {uploadStatus || "Wysyłanie..."}
              </div>
            ) : (
              "Zgłoś Wyzwanie"
            )}
          </button>
        </form>

        {/* Photo Preview Modal */}
        {selectedPhotoIndex !== null && (
          <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="relative max-h-full max-w-full">
              <img
                src={photoPreviews[selectedPhotoIndex]}
                alt={`Zdjęcie ${selectedPhotoIndex + 1}`}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
              <button
                onClick={closePhotoPreview}
                className="absolute -top-12 right-0 rounded-full bg-white p-2 text-gray-800 shadow-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
