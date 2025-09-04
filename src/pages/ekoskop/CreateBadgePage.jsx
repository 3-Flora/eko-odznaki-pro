import { useState } from "react";
import { useNavigate } from "react-router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";
import { ECO_CATEGORIES } from "../../constants/ecoCategories";
import { useToast } from "../../contexts/ToastContext";
import { Trash2, Plus } from "lucide-react";

export default function CreateBadgePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    counterToCheck: "",
    badgeImage: "",
    description: "",
    levels: [
      {
        level: 1,
        description: "",
        requiredCount: 1,
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const category = ECO_CATEGORIES.find((cat) => cat.id === categoryId);
    setFormData((prev) => ({
      ...prev,
      category: category?.name || "",
      counterToCheck: category?.counterKey || "",
    }));
  };

  const handleLevelChange = (index, field, value) => {
    const updatedLevels = [...formData.levels];
    updatedLevels[index] = {
      ...updatedLevels[index],
      [field]: field === "requiredCount" ? parseInt(value) || 0 : value,
    };
    setFormData((prev) => ({
      ...prev,
      levels: updatedLevels,
    }));
  };

  const addLevel = () => {
    const newLevel = {
      level: formData.levels.length + 1,
      description: "",
      requiredCount: 1,
    };
    setFormData((prev) => ({
      ...prev,
      levels: [...prev.levels, newLevel],
    }));
  };

  const removeLevel = (index) => {
    if (formData.levels.length > 1) {
      const updatedLevels = formData.levels
        .filter((_, i) => i !== index)
        .map((level, i) => ({ ...level, level: i + 1 }));

      setFormData((prev) => ({
        ...prev,
        levels: updatedLevels,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.counterToCheck) {
      showToast("Wypełnij wszystkie wymagane pola", "error");
      return;
    }

    if (
      formData.levels.some(
        (level) => !level.description || level.requiredCount < 1,
      )
    ) {
      showToast("Wypełnij wszystkie dane poziomów", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Tworzenie ID na podstawie nazwy
      const badgeId = formData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const badgeData = {
        id: badgeId,
        name: formData.name,
        category: formData.category,
        counterToCheck: formData.counterToCheck,
        badgeImage: formData.badgeImage || `${badgeId}.png`,
        description: formData.description,
        levels: formData.levels,
        createdAt: new Date(),
        isActive: true,
      };

      await addDoc(collection(db, "badgeTemplates"), badgeData);

      showToast("Odznaka została utworzona pomyślnie", "success");
      navigate("/ekoskop/badges");
    } catch (error) {
      console.error("Błąd podczas tworzenia odznaki:", error);
      showToast("Wystąpił błąd podczas tworzenia odznaki", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nowa odznaka"
        subtitle="Utwórz nową odznakę dla uczniów"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Podstawowe informacje */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Podstawowe informacje
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nazwa odznaki *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="np. Mistrz Recyklingu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kategoria *
              </label>
              <select
                value={
                  ECO_CATEGORIES.find((cat) => cat.name === formData.category)
                    ?.id || ""
                }
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Wybierz kategorię</option>
                {ECO_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
                <option value="total">🌍 Ogólne (wszystkie kategorie)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nazwa pliku obrazu
              </label>
              <input
                type="text"
                value={formData.badgeImage}
                onChange={(e) =>
                  handleInputChange("badgeImage", e.target.value)
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="np. mistrz_recyklingu.png"
              />
              <p className="mt-1 text-xs text-gray-500">
                Pozostaw puste, aby automatycznie wygenerować nazwę
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Opis odznaki
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Krótki opis celu i znaczenia odznaki"
              />
            </div>
          </div>
        </div>

        {/* Poziomy odznaki */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Poziomy odznaki
            </h3>
            <button
              type="button"
              onClick={addLevel}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Dodaj poziom
            </button>
          </div>

          <div className="space-y-4">
            {formData.levels.map((level, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Poziom {level.level}
                  </h4>
                  {formData.levels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLevel(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Opis poziomu *
                    </label>
                    <input
                      type="text"
                      value={level.description}
                      onChange={(e) =>
                        handleLevelChange(index, "description", e.target.value)
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="np. Wykonaj 3 EkoDziałania z kategorii Recykling"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wymagana liczba *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={level.requiredCount}
                      onChange={(e) =>
                        handleLevelChange(
                          index,
                          "requiredCount",
                          e.target.value,
                        )
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Przyciski akcji */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/ekoskop/badges")}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Tworzenie...
              </div>
            ) : (
              "Utwórz odznakę"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
