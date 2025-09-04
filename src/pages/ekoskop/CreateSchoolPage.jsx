import { useState } from "react";
import { useNavigate } from "react-router";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { School, Mail, MapPin, Save, ArrowLeft } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import BackButton from "../../components/ui/BackButton";
import Label from "../../components/ui/Label";
import Textarea from "../../components/ui/Textarea";

export default function CreateSchoolPage() {
  const navigate = useNavigate();
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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking school existence:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Sprawdź, czy szkoła o tej nazwie już istnieje
      const schoolExists = await checkIfSchoolExists(formData.name);
      if (schoolExists) {
        setErrors({ name: "Szkoła o tej nazwie już istnieje" });
        setLoading(false);
        return;
      }

      // Przygotuj dane szkoły
      const schoolData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        website: formData.website.trim() || null,
        description: formData.description.trim() || null,
        createdAt: new Date(),
        createdBy: currentUser.id,
        updatedAt: new Date(),
      };

      // Dodaj szkołę do Firestore
      const docRef = await addDoc(collection(db, "schools"), schoolData);

      showSuccess("Szkoła została pomyślnie dodana do systemu");
      navigate("/ekoskop/schools");
    } catch (error) {
      console.error("Error creating school:", error);
      showError("Nie udało się dodać szkoły. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Nowa szkoła" subtitle="Dodaj nową szkołę do systemu" />

      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nazwa szkoły */}
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nazwa szkoły *
              </Label>
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
              <Label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Adres *
              </Label>
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
              <Label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Adres email
              </Label>
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
              <Label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Telefon
              </Label>
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
              <Label
                htmlFor="website"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Strona internetowa
              </Label>
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
              <Label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Opis szkoły
              </Label>
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

            {/* Przycisk dodawania */}
            <Button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? "Dodawanie..." : "Dodaj szkołę"}
            </Button>
          </form>
        </div>

        {/* Informacje pomocnicze */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <School className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Informacje o dodawaniu szkół
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-inside list-disc space-y-1">
                  <li>Pola oznaczone * są wymagane</li>
                  <li>Nazwa szkoły musi być unikalna w systemie</li>
                  <li>
                    Podaj jak najdokładniejszy adres dla łatwiejszego
                    wyszukiwania
                  </li>
                  <li>Kontakt email i telefon ułatwią komunikację z szkołą</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
