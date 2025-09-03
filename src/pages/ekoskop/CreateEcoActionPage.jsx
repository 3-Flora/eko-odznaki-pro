import { useState } from "react";
import { useNavigate } from "react-router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import { ECO_CATEGORIES } from "../../constants/ecoCategories";

export default function CreateEcoActionPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    counterToIncrement: "",
    maxDaily: "",
    maxWeekly: "",
    style: {
      color: "green",
      shape: "circle",
      icon: "🌱",
    },
  });
  const [loading, setLoading] = useState(false);

  const shapes = ["circle", "square", "hexagon"];
  const colors = ["green", "blue", "orange", "purple", "red", "yellow", "cyan"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("style.")) {
      const styleKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        style: {
          ...prev.style,
          [styleKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Auto-fill counterToIncrement based on category
      if (name === "category") {
        const category = ECO_CATEGORIES.find((cat) => cat.name === value);
        if (category) {
          setFormData((prev) => ({
            ...prev,
            counterToIncrement: category.counterKey,
          }));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category
    ) {
      showError("Nazwa, opis i kategoria są wymagane");
      return;
    }

    try {
      setLoading(true);

      const ecoActionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        counterToIncrement: formData.counterToIncrement,
        maxDaily: formData.maxDaily ? parseInt(formData.maxDaily) : undefined,
        maxWeekly: formData.maxWeekly
          ? parseInt(formData.maxWeekly)
          : undefined,
        style: formData.style,
        createdAt: new Date(),
      };

      // Remove undefined values
      Object.keys(ecoActionData).forEach((key) => {
        if (ecoActionData[key] === undefined || ecoActionData[key] === "") {
          delete ecoActionData[key];
        }
      });

      await addDoc(collection(db, "ecoActions"), ecoActionData);

      showSuccess("EkoDziałanie zostało utworzone pomyślnie");
      navigate("/ekoskop/eco-actions");
    } catch (error) {
      console.error("Error creating eco action:", error);
      showError("Nie udało się utworzyć EkoDziałania");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nowe EkoDziałanie"
        subtitle="Utwórz nowy szablon EkoDziałania dla uczniów"
        breadcrumbs={[
          { name: "EkoDziałania", href: "/ekoskop/eco-actions" },
          { name: "Nowe EkoDziałanie", current: true },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          {/* Basic Info */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nazwa EkoDziałania *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              placeholder="np. Gaszenie światła"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Opis *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              placeholder="Opisz co uczeń ma zrobić..."
              required
            />
          </div>

          {/* Category */}
          <div className="mb-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Kategoria *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                required
              >
                <option value="">Wybierz kategorię</option>
                {ECO_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="counterToIncrement"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Licznik do zwiększenia
              </label>
              <input
                type="text"
                id="counterToIncrement"
                name="counterToIncrement"
                value={formData.counterToIncrement}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                placeholder="np. recyclingActions"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Automatycznie wypełniane na podstawie kategorii
              </p>
            </div>
          </div>

          {/* Limits */}
          <div className="mb-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="maxDaily"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Maksymalnie dziennie
              </label>
              <input
                type="number"
                id="maxDaily"
                name="maxDaily"
                value={formData.maxDaily}
                onChange={handleInputChange}
                min="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                placeholder="np. 3"
              />
            </div>

            <div>
              <label
                htmlFor="maxWeekly"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Maksymalnie tygodniowo
              </label>
              <input
                type="number"
                id="maxWeekly"
                name="maxWeekly"
                value={formData.maxWeekly}
                onChange={handleInputChange}
                min="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                placeholder="np. 10"
              />
            </div>
          </div>

          {/* Style Settings */}
          <div className="mb-6">
            <h4 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Wygląd
            </h4>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="style.icon"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ikona (emoji)
                </label>
                <input
                  type="text"
                  id="style.icon"
                  name="style.icon"
                  value={formData.style.icon}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                  placeholder="🌱"
                />
              </div>

              <div>
                <label
                  htmlFor="style.color"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Kolor
                </label>
                <select
                  id="style.color"
                  name="style.color"
                  value={formData.style.color}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                >
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="style.shape"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Kształt
                </label>
                <select
                  id="style.shape"
                  name="style.shape"
                  value={formData.style.shape}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                >
                  {shapes.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-600">
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Podgląd:
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${formData.style.color}-50 dark:bg-${formData.style.color}-900/20`}
                >
                  <span className="text-2xl">{formData.style.icon}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formData.name || "Nazwa EkoDziałania"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.category || "Kategoria"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/ekoskop/eco-actions")}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Anuluj
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Tworzenie...
              </div>
            ) : (
              "Utwórz EkoDziałanie"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
