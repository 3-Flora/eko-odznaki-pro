import { useState } from "react";
import { useNavigate } from "react-router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import PageHeader from "../../components/ui/PageHeader";
import { ECO_CATEGORIES } from "../../constants/ecoCategories";
import { useToast } from "../../contexts/ToastContext";
import { Trash2, Plus } from "lucide-react";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";

export default function CreateBadgePage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

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
      showError("Wypełnij wszystkie wymagane pola", "error");
      return;
    }

    if (
      formData.levels.some(
        (level) => !level.description || level.requiredCount < 1,
      )
    ) {
      showError("Wypełnij wszystkie dane poziomów", "error");
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
        // id: badgeId,
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

      showSuccess("Odznaka została utworzona pomyślnie", "success");
      navigate("/ekoskop/badges");
    } catch (error) {
      console.error("Błąd podczas tworzenia odznaki:", error);
      showError("Wystąpił błąd podczas tworzenia odznaki", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        emoji="🎖️"
        title="Nowa odznaka"
        subtitle="Utwórz nową odznakę dla uczniów"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Podstawowe informacje */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Podstawowe informacje
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label isRequired>Nazwa odznaki</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="np. Mistrz Recyklingu"
                required
              />
            </div>

            <div>
              <Label isRequired>Kategoria</Label>
              <Select
                value={
                  ECO_CATEGORIES.find((cat) => cat.name === formData.category)
                    ?.id || ""
                }
                onChange={handleCategoryChange}
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
              </Select>
            </div>

            <div>
              <Label>Obrazek Odznaki</Label>
              <Input
                type="file"
                value={formData.badgeImage}
                onChange={(e) => handleInputChange("badgeImage", e.target.file)}
                min="0"
                max="1"
                accept="image/*"
                placeholder="Wybierz plik z obrazkiem odznaki"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Opis odznaki</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                minRows={3}
                maxLength={256}
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
            <Button
              type="button"
              onClick={addLevel}
              fullWidth={false}
              icon={Plus}
              size="sm"
            >
              Dodaj poziom
            </Button>
          </div>

          <div className="space-y-4">
            {formData.levels.map((level, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-medium text-gray-900 dark:text-white">
                    Poziom {level.level}
                  </h4>
                  {formData.levels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLevel(index)}
                      className="cursor-pointer rounded-full p-1 text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label isRequired>Opis poziomu</Label>
                    <Input
                      type="text"
                      value={level.description}
                      onChange={(e) =>
                        handleLevelChange(index, "description", e.target.value)
                      }
                      placeholder="np. Wykonaj 3 EkoDziałania z kategorii Recykling"
                      required
                    />
                  </div>

                  <div>
                    <Label isRequired>Wymagana ilość</Label>
                    <Input
                      type="number"
                      value={level.requiredCount}
                      onChange={(e) =>
                        handleLevelChange(
                          index,
                          "requiredCount",
                          e.target.value,
                        )
                      }
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
          <Button onClick={() => navigate("/ekoskop/badges")} style="outline">
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            style="success"
            loading={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Tworzenie...
              </div>
            ) : (
              "Utwórz odznakę"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
