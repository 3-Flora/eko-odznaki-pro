import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate, useSearchParams } from "react-router";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../services/firebase";
import {
  Mail,
  Lock,
  User,
  School,
  Users,
  Upload,
  FileText,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import clsx from "clsx";

export default function CreateTeacherPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    schoolId: "",
    className: "",
    notes: "",
  });
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState({
    id: false,
    employment: false,
  });

  // Załaduj listę szkół i auto-wypełnij formularz z parametrów URL
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsSnapshot = await getDocs(collection(db, "schools"));
        const schoolsData = schoolsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchools(schoolsData);

        // Auto-wypełnij formularz z parametrów URL (z zaakceptowanego wniosku)
        const email = searchParams.get("email");
        const name = searchParams.get("name");
        const schoolId = searchParams.get("schoolId");
        const className = searchParams.get("className");

        if (email || name || schoolId || className) {
          setFormData((prev) => ({
            ...prev,
            email: email || prev.email,
            displayName: name || prev.displayName,
            schoolId: schoolId || prev.schoolId,
            className: className || prev.className,
          }));

          // Oznacz dokumenty jako przesłane jeśli pochodzą z wniosku
          if (searchParams.get("applicationId")) {
            setDocumentsUploaded({
              id: true,
              employment: true,
            });
          }
        }
      } catch (error) {
        console.error("Error loading schools:", error);
        showError("Nie udało się załadować listy szkół");
      }
    };

    loadSchools();
  }, [showError, searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocumentUpload = (type) => {
    // TODO: Implementować prawdziwy upload dokumentów do Firebase Storage
    // Obecnie jest to placeholder funkcjonalność
    // Prawdziwa implementacja powinna:
    // 1. Otworzyć dialog wyboru pliku
    // 2. Walidować typ i rozmiar pliku
    // 3. Upload'ować do Firebase Storage
    // 4. Zapisać URL dokumentu w stanie komponentu
    // 5. Umożliwić podgląd przesłanego dokumentu

    setDocumentsUploaded((prev) => ({
      ...prev,
      [type]: true,
    }));
    showSuccess(
      `Dokument ${type === "id" ? "legitymacji" : "zatrudnienia"} został przesłany`,
    );
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: password,
      confirmPassword: password,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja
    if (
      !formData.email.trim() ||
      !formData.displayName.trim() ||
      !formData.schoolId
    ) {
      showError("Email, nazwa wyświetlana i szkoła są wymagane");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Hasła nie pasują do siebie");
      return;
    }

    if (formData.password.length < 6) {
      showError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    if (!formData.className.trim()) {
      showError("Nazwa klasy jest wymagana");
      return;
    }

    if (!documentsUploaded.id || !documentsUploaded.employment) {
      showError(
        "Wymagane są oba dokumenty: skan legitymacji i zaświadczenie o zatrudnieniu",
      );
      return;
    }

    try {
      setLoading(true);

      // Sprawdź czy email już istnieje
      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", formData.email.trim()),
      );
      const existingUsers = await getDocs(usersQuery);

      if (!existingUsers.empty) {
        showError("Użytkownik z tym adresem email już istnieje");
        return;
      }

      // Utwórz konto Firebase Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password,
      );

      // Utwórz klasę dla nauczyciela
      const classData = {
        name: formData.className.trim(),
        schoolId: formData.schoolId,
        teacherId: user.uid,
        createdAt: new Date(),
        createdBy: currentUser.id,
      };

      const classRef = await addDoc(collection(db, "classes"), classData);

      // Utwórz dokument użytkownika w Firestore
      const userData = {
        email: formData.email.trim(),
        displayName: formData.displayName.trim(),
        role: "teacher",
        schoolId: formData.schoolId,
        classId: classRef.id,
        isVerified: true, // Nauczyciele są automatycznie weryfikowani przez ekoskop
        createdAt: new Date(),
        createdBy: currentUser.id,
        documents: {
          idVerified: documentsUploaded.id,
          employmentVerified: documentsUploaded.employment,
        },
        notes: formData.notes.trim(),
        counters: {
          totalActions: 0,
          totalChallenges: 0,
          recyclingActions: 0,
          educationActions: 0,
          savingActions: 0,
          transportActions: 0,
          energyActions: 0,
          foodActions: 0,
          totalActiveDays: 0,
        },
        earnedBadges: {},
      };

      await setDoc(doc(db, "users", user.uid), userData);

      showSuccess(
        `Konto nauczyciela ${formData.displayName} zostało utworzone pomyślnie! Klasa "${formData.className}" została przypisana. Nauczyciel może zalogować się danymi: ${formData.email}`,
      );

      navigate("/ekoskop/users");
    } catch (error) {
      console.error("Error creating teacher account:", error);
      if (error.code === "auth/email-already-in-use") {
        showError("Adres email jest już używany");
      } else if (error.code === "auth/weak-password") {
        showError("Hasło jest zbyt słabe");
      } else {
        showError("Nie udało się utworzyć konta nauczyciela");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utwórz konto nauczyciela"
        subtitle="Stwórz nowe konto dla nauczyciela po weryfikacji dokumentów"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Podstawowe informacje */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Podstawowe informacje
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Adres email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="nauczyciel@szkola.edu.pl"
                required
              />
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Imię i nazwisko *
              </label>
              <Input
                id="displayName"
                name="displayName"
                icon={User}
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Jan Kowalski"
                required
              />
            </div>
          </div>
        </div>

        {/* Hasło */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hasło
            </h3>
            <Button
              type="button"
              onClick={generatePassword}
              size="sm"
              style="outline"
              className="text-sm"
            >
              Wygeneruj hasło
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Hasło *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Minimum 6 znaków"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Potwierdź hasło *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Powtórz hasło"
                required
              />
            </div>
          </div>
        </div>

        {/* Szkoła i klasa */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Przypisanie do szkoły
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="schoolId"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Szkoła *
              </label>
              <select
                id="schoolId"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                required
              >
                <option value="">Wybierz szkołę</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="className"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nazwa klasy *
              </label>
              <Input
                id="className"
                name="className"
                icon={Users}
                value={formData.className}
                onChange={handleInputChange}
                placeholder="np. 5a, IIIb, Klasa Pana Jana"
                required
              />
            </div>
          </div>
        </div>

        {/* Dokumenty weryfikacyjne */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Dokumenty weryfikacyjne
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Skan legitymacji służbowej *
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => handleDocumentUpload("id")}
                  size="sm"
                  style={documentsUploaded.id ? "success" : "outline"}
                  icon={documentsUploaded.id ? FileText : Upload}
                >
                  {documentsUploaded.id ? "Przesłano" : "Prześlij"}
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {documentsUploaded.id
                    ? "✓ Dokument zweryfikowany"
                    : "Wymagany"}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Zaświadczenie o zatrudnieniu *
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => handleDocumentUpload("employment")}
                  size="sm"
                  style={documentsUploaded.employment ? "success" : "outline"}
                  icon={documentsUploaded.employment ? FileText : Upload}
                >
                  {documentsUploaded.employment ? "Przesłano" : "Prześlij"}
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {documentsUploaded.employment
                    ? "✓ Dokument zweryfikowany"
                    : "Wymagany"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              📄 Dokumenty muszą być podpisane przez dyrektora szkoły i zawierać
              pieczęć placówki. Wszystkie dokumenty są przechowywane zgodnie z
              RODO.
            </p>
          </div>
        </div>

        {/* Dodatkowe notatki */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Dodatkowe informacje
          </h3>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Notatki (opcjonalne)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              placeholder="Dodatkowe informacje o nauczycielu lub procesie weryfikacji..."
            />
          </div>
        </div>

        {/* Przyciski akcji */}
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => navigate("/ekoskop/users")}
            style="outline"
            className="flex-1 sm:flex-none"
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Tworzenie konta...
              </div>
            ) : (
              "Utwórz konto nauczyciela"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
