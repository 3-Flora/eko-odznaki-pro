import { useState } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../contexts/ToastContext";
import {
  createEcoChallenge,
  validateEcoChallengeData,
} from "../../services/ecoChallengeService";
import PageHeader from "../../components/ui/PageHeader";
import { ECO_CATEGORIES } from "../../constants/ecoCategories";

export default function CreateChallengePage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    maxDaily: 1,
    maxWeekly: 1,
    style: {
      color: "green",
      icon: "🎯",
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Wyczyść błąd dla tego pola
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleStyleChange = (styleField, value) => {
    setFormData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [styleField]: value,
      },
    }));
  };

  const handleCategoryChange = (categoryName) => {
    const category = ECO_CATEGORIES.find((cat) => cat.name === categoryName);
    setFormData((prev) => ({
      ...prev,
      category: categoryName,
      style: {
        color: category?.color || "green",
        icon: category?.icon || "🎯",
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja
    const validationErrors = validateEcoChallengeData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Konwertuj daty na obiekty Date
      const challengeData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        maxDaily: parseInt(formData.maxDaily),
        maxWeekly: parseInt(formData.maxWeekly),
      };

      await createEcoChallenge(challengeData);
      showSuccess("EkoWyzwanie zostało utworzone pomyślnie!");
      navigate("/ekoskop/challenges");
    } catch (error) {
      console.error("Error creating challenge:", error);
      showError("Nie udało się utworzyć EkoWyzwania");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nowe EkoWyzwanie"
        subtitle="Utwórz nowe wyzwanie dla uczniów"
      />

      <div className="mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
        >
          {/* Nazwa wyzwania */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nazwa wyzwania *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-200 focus:outline-none dark:bg-gray-700 dark:text-white ${
                errors.name
                  ? "border-red-500 focus:border-red-500 dark:border-red-400"
                  : "border-gray-300 focus:border-green-500 dark:border-gray-600 dark:focus:border-green-400"
              }`}
              placeholder="np. Nakrętkowy challenge"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Opis */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Opis wyzwania *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-200 focus:outline-none dark:bg-gray-700 dark:text-white ${
                errors.description
                  ? "border-red-500 focus:border-red-500 dark:border-red-400"
                  : "border-gray-300 focus:border-green-500 dark:border-gray-600 dark:focus:border-green-400"
              }`}
              placeholder="Opisz szczegółowo na czym polega wyzwanie..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          {/* Kategoria */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Kategoria *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-200 focus:outline-none dark:bg-gray-700 dark:text-white ${
                errors.category
                  ? "border-red-500 focus:border-red-500 dark:border-red-400"
                  : "border-gray-300 focus:border-green-500 dark:border-gray-600 dark:focus:border-green-400"
              }`}
            >
              <option value="">Wybierz kategorię</option>
              {ECO_CATEGORIES.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.category}
              </p>
            )}
          </div>

          {/* Daty */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data rozpoczęcia *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-200 focus:outline-none dark:bg-gray-700 dark:text-white ${
                  errors.startDate
                    ? "border-red-500 focus:border-red-500 dark:border-red-400"
                    : "border-gray-300 focus:border-green-500 dark:border-gray-600 dark:focus:border-green-400"
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data zakończenia *
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-200 focus:outline-none dark:bg-gray-700 dark:text-white ${
                  errors.endDate
                    ? "border-red-500 focus:border-red-500 dark:border-red-400"
                    : "border-gray-300 focus:border-green-500 dark:border-gray-600 dark:focus:border-green-400"
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Limity */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="maxDaily"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Limit dzienny
              </label>
              <input
                type="number"
                id="maxDaily"
                min="1"
                value={formData.maxDaily}
                onChange={(e) => handleChange("maxDaily", e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-200 focus:outline-none dark:bg-gray-700 dark:text-white ${
                  errors.maxDaily
                    ? "border-red-500 focus:border-red-500 dark:border-red-400"
                    : "border-gray-300 focus:border-green-500 dark:border-gray-600 dark:focus:border-green-400"
                }`}
              />
              {errors.maxDaily && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.maxDaily}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="maxWeekly"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Limit tygodniowy
              </label>
              <input
                type="number"
                id="maxWeekly"
                min="1"
                value={formData.maxWeekly}
                onChange={(e) => handleChange("maxWeekly", e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-200 focus:outline-none dark:bg-gray-700 dark:text-white ${
                  errors.maxWeekly
                    ? "border-red-500 focus:border-red-500 dark:border-red-400"
                    : "border-gray-300 focus:border-green-500 dark:border-gray-600 dark:focus:border-green-400"
                }`}
              />
              {errors.maxWeekly && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.maxWeekly}
                </p>
              )}
            </div>
          </div>

          {/* Podgląd stylu */}
          {formData.category && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Podgląd
              </label>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    ECO_CATEGORIES.find((cat) => cat.name === formData.category)
                      ?.bgColor || "bg-gray-100 dark:bg-gray-600"
                  }`}
                >
                  <span className="text-2xl">{formData.style.icon}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formData.name || "Nazwa wyzwania"}
                  </div>
                  <div
                    className={`text-sm ${
                      ECO_CATEGORIES.find(
                        (cat) => cat.name === formData.category,
                      )?.color || "text-gray-600"
                    }`}
                  >
                    {formData.category}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Przyciski */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/ekoskop/challenges")}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Tworzenie..." : "Utwórz wyzwanie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
