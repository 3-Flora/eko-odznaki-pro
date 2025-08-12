import React, { useState } from "react";
import { Camera, Upload, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { activityCategories } from "../../data/badges";
import { useAuth } from "../../contexts/AuthContext";

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
      <div className="flex items-center justify-center min-h-screen p-4 pb-20">
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
          <div className="inline-block px-4 py-2 text-green-800 bg-green-100 rounded-full">
            <CheckCircle className="inline w-4 h-4 mr-1" />
            Oczekuje na zatwierdzenie
          </div>
        </motion.div>
      </div>
    );
  }

  // Show guest message if user is a guest
  if (currentUser?.isGuest) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mb-4 text-6xl">👤</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Tryb gościa</h2>
          <p className="mb-4 text-gray-600">
            Aby zgłaszać działania i zdobywać punkty, musisz się zalogować do
            swojego konta.
          </p>
          <div className="inline-block px-4 py-2 text-blue-800 bg-blue-100 rounded-full">
            Zaloguj się, aby kontynuować
          </div>
        </motion.div>
      </div>
    );
  }

  const selectedCategoryData = activityCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="flex flex-col gap-6 p-4 justify-normal">
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
          className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded-xl"
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
          className="p-6 bg-white shadow-lg rounded-2xl"
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
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "border-green-500 bg-green-50 scale-105"
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
              className="p-6 bg-white shadow-lg rounded-2xl"
            >
              <div className="flex items-center mb-4">
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Tytuł działania
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="np. Przejazd rowerem do szkoły"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Opis działania
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz szczegóły swojego eko-działania..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 resize-none rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="p-6 bg-white shadow-lg rounded-2xl"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Dodaj zdjęcie (opcjonalne)
              </h3>

              {!photoPreview ? (
                <label className="block cursor-pointer">
                  <div className="p-8 text-center transition border-2 border-gray-300 border-dashed rounded-xl hover:border-green-400">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
                    className="object-cover w-full h-48 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute p-2 text-white transition bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
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
              className="flex items-center justify-center w-full gap-2 py-4 text-lg font-semibold text-white transition duration-200 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
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
