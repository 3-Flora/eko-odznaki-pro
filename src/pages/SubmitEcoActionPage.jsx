import { useState } from "react";
import { Camera, Upload, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router";
import ErrorMessage from "../components/ui/ErrorMessage";
import BackButton from "../components/ui/BackButton";
import clsx from "clsx";
import { backgroundEcoAction as backgroundStyles } from "../utils/styleUtils";

export default function SubmitEcoActionPage() {
  const { submitEcoAction } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAction = location.state?.action;

  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Redirect if no action selected
  if (!selectedAction) {
    navigate("/submit");
    return null;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // TODO: Upload photo to Firebase Storage if photo exists
      let photoUrl;
      if (photo) {
        // For now, we'll use the preview URL - in production you'd upload to Firebase Storage
        photoUrl = photoPreview || undefined;
      }

      await submitEcoAction(selectedAction, {
        photoUrl,
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
        "Wystąpił błąd podczas wysyłania EkoDziałania. Spróbuj ponownie.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
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
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 mb-4 border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <BackButton className="mr-4" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
              Zgłoś EkoDziałanie
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedAction.name}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ErrorMessage error={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
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
          </motion.div>

          {/* Comment Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
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
          </motion.div>

          {/* Photo Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <label className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
              Dodaj zdjęcie (opcjonalne)
            </label>

            {!photoPreview ? (
              <label className="block cursor-pointer">
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-green-400 dark:border-gray-600 dark:hover:border-green-500">
                  <Camera className="mx-auto mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Dotknij, aby dodać zdjęcie
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-40 w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white transition hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            type="submit"
            disabled={loading}
            className="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 font-semibold text-white shadow-lg transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Wyślij działanie
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
