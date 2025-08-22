import { useState, useEffect } from "react";
import { Camera, Upload, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  getEcoActions,
  groupEcoActionsByCategory,
} from "../services/ecoActionService";
import ErrorMessage from "../components/ui/ErrorMessage";

export default function ActivityPage() {
  const { submitEcoAction, currentUser } = useAuth();
  const [ecoActions, setEcoActions] = useState([]);
  const [groupedActions, setGroupedActions] = useState({});
  const [loadingActions, setLoadingActions] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Ładowanie EkoDziałań z bazy danych
  useEffect(() => {
    const loadEcoActions = async () => {
      try {
        setLoadingActions(true);
        const actions = await getEcoActions();
        setEcoActions(actions);
        const grouped = groupEcoActionsByCategory(actions);
        setGroupedActions(grouped);
      } catch (error) {
        console.error("Error loading eco actions:", error);
        setError("Nie udało się załadować EkoDziałań");
      } finally {
        setLoadingActions(false);
      }
    };

    loadEcoActions();
  }, []);

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
    if (!selectedAction) return;

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

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setSelectedAction(null);
        setComment("");
        setPhoto(null);
        setPhotoPreview(null);
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
      <div className="flex items-center justify-center p-4">
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

  // const selectedCategoryData = activityCategories.find(
  //   (cat) => cat.id === selectedCategory,
  // );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-4 text-4xl">🌍</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Zgłoś EkoDziałanie
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Wybierz działanie ekologiczne, które wykonałeś!
        </p>
      </motion.div>

      <ErrorMessage error={error} />

      {/* Loading state */}
      {loadingActions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Ładowanie EkoDziałań...
          </span>
        </motion.div>
      )}

      {/* No actions available */}
      {!loadingActions && ecoActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-yellow-50 p-8 text-center dark:bg-yellow-900/20"
        >
          <div className="mb-4 text-4xl">📝</div>
          <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            Brak dostępnych EkoDziałań
          </h3>
          <p className="text-yellow-600 dark:text-yellow-400">
            W bazie danych nie ma jeszcze żadnych EkoDziałań do zgłoszenia.
          </p>
        </motion.div>
      )}

      {!loadingActions && ecoActions.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Action Selection by Category */}
          {Object.entries(groupedActions).map(
            ([category, actions], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                  <span className="text-2xl">
                    {category === "Recykling"
                      ? "♻️"
                      : category === "Edukacja"
                        ? "📚"
                        : category === "Oszczędzanie"
                          ? "💡"
                          : "🌱"}
                  </span>
                  {category}
                  <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {actions.length}
                  </span>
                </h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => setSelectedAction(action)}
                      className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                        selectedAction?.id === action.id
                          ? "scale-105 border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900"
                          : "border-gray-200 hover:border-green-300 dark:border-gray-700 dark:hover:border-green-600"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {action.name}
                        </h4>
                        <div
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            action.style?.color === "green"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : action.style?.color === "blue"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : action.style?.color === "yellow"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : action.style?.color === "purple"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          {action.category}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ),
          )}

          {/* Selected Action Details */}
          {selectedAction && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
              >
                <div className="mb-4 flex items-center">
                  <div className="mr-3 text-2xl">
                    {selectedAction.category === "Recykling"
                      ? "♻️"
                      : selectedAction.category === "Edukacja"
                        ? "📚"
                        : selectedAction.category === "Oszczędzanie"
                          ? "💡"
                          : "🌱"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedAction.name}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Kategoria: {selectedAction.category}
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
                    Opis działania:
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedAction.description}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dodatkowy komentarz (opcjonalny)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Opisz szczegóły wykonania tego EkoDziałania..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </motion.div>

              {/* Photo Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
              >
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                  Dodaj zdjęcie (opcjonalne)
                </h3>

                {!photoPreview ? (
                  <label className="block cursor-pointer">
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-green-400 dark:border-gray-700 dark:hover:border-green-600">
                      <Camera className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-300" />
                      <p className="mb-2 text-gray-600 dark:text-gray-300">
                        Kliknij, aby dodać zdjęcie
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-400">
                        PNG, JPG do 5MB
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
                      className="h-48 w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
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
                transition={{ delay: 0.4 }}
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 text-lg font-semibold text-white transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 dark:from-green-700 dark:to-emerald-800 dark:hover:from-green-800 dark:hover:to-emerald-900"
              >
                {loading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Wyślij działanie
                  </>
                )}
              </motion.button>
            </>
          )}
        </form>
      )}
    </>
  );
}
