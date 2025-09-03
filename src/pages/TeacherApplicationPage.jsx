import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useToast } from "../contexts/ToastContext";
import {
  Mail,
  User,
  School,
  Phone,
  MessageSquare,
  Upload,
  FileText,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import BackButton from "../components/ui/BackButton";
import DocumentUpload from "../components/upload/DocumentUpload";

export default function TeacherApplicationPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    schoolId: "",
    requestedClassName: "",
    message: "",
  });
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [documents, setDocuments] = useState({
    idCard: null,
    employmentCertificate: null,
  });

  // Załaduj listę szkół
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsSnapshot = await getDocs(collection(db, "schools"));
        const schoolsData = schoolsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchools(schoolsData);
      } catch (error) {
        console.error("Error loading schools:", error);
        showError("Nie udało się załadować listy szkół");
      }
    };

    loadSchools();
  }, [showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocumentUpload = (documentType, documentData) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: documentData
    }));
    
    if (documentData) {
      showSuccess(
        `Dokument ${documentType === "idCard" ? "legitymacji" : "zatrudnienia"} został przesłany`
      );
    }
  };

  const handleDocumentError = (error) => {
    showError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja podstawowa
    if (
      !formData.email.trim() ||
      !formData.displayName.trim() ||
      !formData.schoolId
    ) {
      showError("Email, imię i nazwisko oraz szkoła są wymagane");
      return;
    }

    try {
      setLoading(true);

      // Jeśli nie ma jeszcze applicationId, utwórz wniosek
      if (!applicationId) {
        // Znajdź nazwę szkoły dla denormalizacji
        const selectedSchool = schools.find(school => school.id === formData.schoolId);

        const applicationData = {
          displayName: formData.displayName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          schoolId: formData.schoolId,
          schoolName: selectedSchool?.name || "Nieznana szkoła",
          proposedClassName: formData.requestedClassName.trim(),
          additionalInfo: formData.message.trim(),
          status: "pending",
          createdAt: new Date(),
          // Dokumenty będą dodane później przez upload
          documents: {},
          // Audit log dla bezpieczeństwa
          auditLog: [
            {
              action: "created",
              timestamp: new Date(),
              performedBy: "anonymous", // Będzie zaktualizowane po auth
              details: "Teacher application created",
            }
          ],
          metadata: {
            submissionSource: "web",
            userAgent: navigator.userAgent,
          },
        };

        const docRef = await addDoc(collection(db, "teacherApplications"), applicationData);
        setApplicationId(docRef.id);

        showSuccess(
          "Podstawowe dane zostały zapisane. Teraz możesz przesłać wymagane dokumenty."
        );
      } else {
        // Walidacja finalnego wysłania - sprawdź czy są dokumenty
        if (!documents.idCard || !documents.employmentCertificate) {
          showError(
            "Wymagane są oba dokumenty: skan legitymacji i zaświadczenie o zatrudnieniu"
          );
          return;
        }

        showSuccess(
          "Wniosek został wysłany pomyślnie. Ekoskop skontaktuje się z Tobą w ciągu 2-3 dni roboczych."
        );

        // Przekieruj do strony głównej
        navigate("/");
      }
    } catch (error) {
      console.error("Error submitting teacher application:", error);
      showError("Nie udało się zapisać wniosku. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <BackButton />
      <PageHeader
        title="Wniosek o konto nauczyciela"
        subtitle="Zgłoś się, aby otrzymać konto nauczyciela w systemie Eko Odznaki"
        className="text-center"
      />

      <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
          Procedura weryfikacji
        </h3>
        <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>Wypełnij formularz i prześlij wymagane dokumenty</li>
          <li>Ekoskop zweryfikuje Twoje dane w ciągu 2-3 dni roboczych</li>
          <li>Po pozytywnej weryfikacji otrzymasz dane do logowania</li>
          <li>Będziesz mógł zarządzać swoją klasą i weryfikować uczniów</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Podstawowe informacje */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Podstawowe informacje
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
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
          </div>

          <div className="mt-6">
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Numer telefonu (opcjonalny)
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              icon={Phone}
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+48 123 456 789"
            />
          </div>
        </div>

        {/* Szkoła i klasa */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Miejsce pracy
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Nie widzisz swojej szkoły? Skontaktuj się z ekoskopem.
              </p>
            </div>

            <div>
              <label
                htmlFor="requestedClassName"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Preferowana nazwa klasy (opcjonalnie)
              </label>
              <Input
                id="requestedClassName"
                name="requestedClassName"
                icon={School}
                value={formData.requestedClassName}
                onChange={handleInputChange}
                placeholder="np. 5a, IIIb, Klasa Pana Jana"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Możesz to zmienić później
              </p>
            </div>
          </div>
        </div>

        {/* Dokumenty weryfikacyjne */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Dokumenty weryfikacyjne
          </h3>

          {applicationId ? (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              <DocumentUpload
                applicationId={applicationId}
                documentType="idCard"
                currentDocument={documents.idCard}
                onUploadSuccess={handleDocumentUpload}
                onUploadError={handleDocumentError}
                userId="anonymous" // Tymczasowo dla anonimowych wniosków
              />

              <DocumentUpload
                applicationId={applicationId}
                documentType="employmentCertificate"
                currentDocument={documents.employmentCertificate}
                onUploadSuccess={handleDocumentUpload}
                onUploadError={handleDocumentError}
                userId="anonymous" // Tymczasowo dla anonimowych wniosków
              />
            </div>
          ) : (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Informacja:</strong> Po wypełnieniu podstawowych danych będziesz mógł przesłać dokumenty.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              📄 <strong>Wymagania dokumentów:</strong>
              <br />
              • Dokumenty muszą być podpisane przez dyrektora szkoły
              <br />
              • Dokumenty muszą zawierać pieczęć placówki
              <br />• Skan musi być czytelny (format JPG, PNG lub PDF)
            </p>
          </div>
        </div>

        {/* Dodatkowa wiadomość */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Dodatkowe informacje
          </h3>

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Wiadomość do ekoskopu (opcjonalnie)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              placeholder="Dodatkowe informacje o sobie, doświadczeniu w edukacji ekologicznej, itp."
            />
          </div>
        </div>

        {/* Przycisk wysyłania */}
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => navigate("/")}
            style="outline"
            className="flex-1"
          >
            Anuluj
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                {applicationId ? "Wysyłanie wniosku..." : "Zapisywanie danych..."}
              </div>
            ) : applicationId ? (
              documents.idCard && documents.employmentCertificate 
                ? "Wyślij wniosek" 
                : "Najpierw prześlij dokumenty"
            ) : (
              "Zapisz dane i przejdź do dokumentów"
            )}
          </Button>
        </div>
      </form>

      {/* Informacje kontaktowe */}
      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
          Potrzebujesz pomocy?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          W przypadku pytań skontaktuj się bezpośrednio z ekoskopem:
          <br />
          📧 ekoskop@example.com
          <br />
          📞 +48 123 456 789
        </p>
      </div>
    </div>
  );
}
