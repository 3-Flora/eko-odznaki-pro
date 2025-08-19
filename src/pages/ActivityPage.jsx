import { useState } from "react";
import { Camera, Upload, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { activityCategories } from "../data/data";
import { useAuth } from "../contexts/AuthContext";
import ErrorMessage from "../components/ui/ErrorMessage";

export default function ActivityPage() {
  const { submitActivity } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
    if (!selectedCategory) return;

    setLoading(true);
    setError("");

    try {
      // TODO: Upload photo to Firebase Storage if photo exists
      let photoURL;
      if (photo) {
        // For now, we'll use the preview URL - in production you'd upload to Firebase Storage
        photoURL = photoPreview || undefined;
      }

      await submitActivity({
        category: selectedCategory,
        title,
        description,
        photoURL,
      });

      setSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setSelectedCategory("");
        setTitle("");
        setDescription("");
        setPhoto(null);
        setPhotoPreview(null);
      }, 3000);
    } catch (err) {
      console.error("Error submitting activity:", err);
      setError("Wystąpił błąd podczas wysyłania aktywności. Spróbuj ponownie.");
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
            Twoje działanie zostało przesłane do weryfikacji przez nauczyciela
          </p>
          <div className="inline-block rounded-full bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="mr-1 inline h-4 w-4" />
            Oczekuje na zatwierdzenie
          </div>
        </motion.div>
      </div>
    );
  }

  const selectedCategoryData = activityCategories.find(
    (cat) => cat.id === selectedCategory,
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-4 text-4xl">🌍</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Dodaj działanie
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Podziel się swoimi eko-działaniami!
        </p>
      </motion.div>

      <ErrorMessage error={error} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Wybierz kategorię
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {activityCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-xl border-2 p-4 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "scale-105 border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900"
                    : "border-gray-200 hover:border-green-300 dark:border-gray-700 dark:hover:border-green-600"
                }`}
              >
                <div className="mb-2 text-2xl">{category.icon}</div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {category.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  +{category.points} pkt
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity Details */}
        {selectedCategory && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center">
                <div className="mr-3 text-2xl">
                  {selectedCategoryData?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {selectedCategoryData?.name}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    +{selectedCategoryData?.points} punktów
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tytuł działania
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="np. Przejazd rowerem do szkoły"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Opis działania
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz szczegóły swojego eko-działania..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>
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
    </>
  );
}
