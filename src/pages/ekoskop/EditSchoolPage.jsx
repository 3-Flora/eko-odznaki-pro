import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { School, Mail, MapPin, Save } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import BackButton from "../../components/ui/BackButton";
import Loading from "../../components/routing/Loading";
import TextareaAutosize from "react-textarea-autosize";
import Label from "../../components/ui/Label";
import Textarea from "../../components/ui/Textarea";
import InfoBox from "../../components/ui/InfoBox";

export default function EditSchoolPage() {
  const navigate = useNavigate();
  const { schoolId } = useParams();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    description: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (schoolId) {
      loadSchoolData();
    }
  }, [schoolId]);

  const loadSchoolData = async () => {
    try {
      setLoading(true);
      const schoolDoc = await getDoc(doc(db, "schools", schoolId));

      if (!schoolDoc.exists()) {
        showError("Nie znaleziono szkoły");
        navigate("/ekoskop/schools");
        return;
      }

      const schoolData = schoolDoc.data();
      const dataToSet = {
        name: schoolData.name || "",
        address: schoolData.address || "",
        email: schoolData.email || "",
        phone: schoolData.phone || "",
        website: schoolData.website || "",
        description: schoolData.description || "",
      };

      setFormData(dataToSet);
      setOriginalData(dataToSet);
    } catch (error) {
      console.error("Error loading school:", error);
      showError("Nie udało się załadować danych szkoły");
      navigate("/ekoskop/schools");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Usuń błąd dla pola, które jest teraz edytowane
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nazwa szkoły jest wymagana";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nazwa szkoły musi mieć co najmniej 3 znaki";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Adres szkoły jest wymagany";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Nieprawidłowy format adresu email";
    }

    if (
      formData.phone.trim() &&
      !/^[\d\s\-\+\(\)]{9,}$/.test(formData.phone.trim())
    ) {
      newErrors.phone = "Nieprawidłowy format numeru telefonu";
    }

    if (
      formData.website.trim() &&
      !/^https?:\/\/.+\..+/.test(formData.website.trim())
    ) {
      newErrors.website =
        "Nieprawidłowy format strony internetowej (wymagany protokół http:// lub https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkIfSchoolExists = async (name) => {
    try {
      const q = query(
        collection(db, "schools"),
        where("name", "==", name.trim()),
      );
      const snapshot = await getDocs(q);

      // Sprawdź, czy inna szkoła (nie edytowana) ma tę samą nazwę
      const existingSchools = snapshot.docs.filter(
        (doc) => doc.id !== schoolId,
      );
      return existingSchools.length > 0;
    } catch (error) {
      console.error("Error checking school existence:", error);
      return false;
    }
  };

  const hasChanges = () => {
    return Object.keys(formData).some(
      (key) => formData[key].trim() !== originalData[key].trim(),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      showError("Nie wprowadzono żadnych zmian");
      return;
    }

    setSaving(true);

    try {
      // Sprawdź, czy inna szkoła o tej nazwie już istnieje (tylko jeśli zmieniono nazwę)
      if (formData.name.trim() !== originalData.name.trim()) {
        const schoolExists = await checkIfSchoolExists(formData.name);
        if (schoolExists) {
          setErrors({ name: "Szkoła o tej nazwie już istnieje" });
          setSaving(false);
          return;
        }
      }

      // Przygotuj dane do aktualizacji
      const updateData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        website: formData.website.trim() || null,
        description: formData.description.trim() || null,
        updatedAt: new Date(),
        updatedBy: currentUser.id,
      };

      // Aktualizuj szkołę w Firestore
      await updateDoc(doc(db, "schools", schoolId), updateData);

      showSuccess("Dane szkoły zostały pomyślnie zaktualizowane");
      navigate("/ekoskop/schools");
    } catch (error) {
      console.error("Error updating school:", error);
      showError("Nie udało się zaktualizować danych szkoły. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edytuj szkołę"
        subtitle="Zaktualizuj informacje o szkole"
        emoji="📝"
      />

      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Nazwa szkoły */}
            <div>
              <Label htmlFor="name">Nazwa szkoły *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="np. Szkoła Podstawowa nr 15"
                icon={School}
                className={
                  errors.name ? "border-red-500 focus:ring-red-500" : ""
                }
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Adres */}
            <div>
              <Label htmlFor="address">Adres *</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="np. ul. Szkolna 10, 00-123 Warszawa"
                icon={MapPin}
                className={
                  errors.address ? "border-red-500 focus:ring-red-500" : ""
                }
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Adres email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="np. kontakt@szkola15.edu.pl"
                icon={Mail}
                className={
                  errors.email ? "border-red-500 focus:ring-red-500" : ""
                }
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Telefon */}
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="np. +48 22 123 45 67"
                className={
                  errors.phone ? "border-red-500 focus:ring-red-500" : ""
                }
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Strona internetowa */}
            <div>
              <Label htmlFor="website">Strona internetowa</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="np. https://szkola15.edu.pl"
                className={
                  errors.website ? "border-red-500 focus:ring-red-500" : ""
                }
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>

            {/* Opis */}
            <div>
              <Label htmlFor="description">Opis szkoły</Label>
              <Textarea
                id="description"
                name="description"
                minRows={4}
                maxLength={256}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Krótki opis szkoły, jej misji i wartości..."
              />
            </div>

            {/* Przyciski */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate("/ekoskop/schools")}
                style="outline"
                className="max-w-[125px]"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={saving || !hasChanges()}
                fullWidth
              >
                <Save className="h-4 w-4" />
                {saving ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        </div>

        {/* Informacje pomocnicze */}
        <InfoBox style="warning">
          <School />
          <h3> Uwagi dotyczące edycji szkoły</h3>
          <ul>
            <li>
              Zmiany będą widoczne dla wszystkich użytkowników przypisanych do
              tej szkoły
            </li>
            <li>
              Aktualizacja nazwy szkoły może wpłynąć na wyniki wyszukiwania
            </li>
            <li>Sprawdź poprawność danych kontaktowych przed zapisaniem</li>
          </ul>
        </InfoBox>
      </div>
    </div>
  );
}
