import { useState } from "react";
import { Camera, Upload, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { activityCategories } from "../../data/badges";
import { useAuth } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/routing/ProtectedRoute";

export default function ActivityPage() {
  const { submitActivity, currentUser } = useAuth();
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
      <div className="flex min-h-screen items-center justify-center p-4 pb-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="mb-4 text-6xl">🎉</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Wysłano!</h2>
          <p className="mb-4 text-gray-600">
            Twoje działanie zostało przesłane do weryfikacji przez nauczyciela
          </p>
          <div className="inline-block rounded-full bg-green-100 px-4 py-2 text-green-800">
            <CheckCircle className="mr-1 inline h-4 w-4" />
            Oczekuje na zatwierdzenie
          </div>
        </motion.div>
      </div>
    );
  }

  // Show guest message if user is a guest
  if (currentUser?.isGuest) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="mb-4 text-6xl">👤</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Tryb gościa</h2>
          <p className="mb-4 text-gray-600">
            Aby zgłaszać działania i zdobywać punkty, musisz się zalogować do
            swojego konta.
          </p>
          <div className="inline-block rounded-full bg-blue-100 px-4 py-2 text-blue-800">
            Zaloguj się, aby kontynuować
          </div>
        </motion.div>
      </div>
    );
  }

  const selectedCategoryData = activityCategories.find(
    (cat) => cat.id === selectedCategory,
  );

  return (
    <div className="flex flex-col justify-normal gap-6 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-4 text-4xl">🌍</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Dodaj działanie
        </h1>
        <p className="text-gray-600">Podziel się swoimi eko-działaniami!</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-400 bg-red-100 px-4 py-3 text-red-700"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white p-6 shadow-lg"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
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
                    ? "scale-105 border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="mb-2 text-2xl">{category.icon}</div>
                <p className="text-sm font-medium text-gray-800">
                  {category.name}
                </p>
                <p className="text-xs text-gray-600">+{category.points} pkt</p>
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
              className="rounded-2xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center">
                <div className="mr-3 text-2xl">
                  {selectedCategoryData?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedCategoryData?.name}
                  </h3>
                  <p className="text-sm text-green-600">
                    +{selectedCategoryData?.points} punktów
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tytuł działania
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="np. Przejazd rowerem do szkoły"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Opis działania
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz szczegóły swojego eko-działania..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
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
              className="rounded-2xl bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Dodaj zdjęcie (opcjonalne)
              </h3>

              {!photoPreview ? (
                <label className="block cursor-pointer">
                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-green-400">
                    <Camera className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="mb-2 text-gray-600">
                      Kliknij, aby dodać zdjęcie
                    </p>
                    <p className="text-sm text-gray-400">PNG, JPG do 5MB</p>
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 text-lg font-semibold text-white transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
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
    </div>
  );
}
