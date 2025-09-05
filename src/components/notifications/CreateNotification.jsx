import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  createNotification,
  createClassNotification,
  createSchoolNotification,
  createGlobalNotification,
  createRoleNotification,
} from "../../services/notificationService";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { ChevronLeft, Send, Info, AlertTriangle, Clock } from "lucide-react";
import Button from "../ui/Button";
import PageHeader from "../ui/PageHeader";
import Loading from "../routing/Loading";
import Label from "../ui/Label";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Input from "../ui/Input";

/**
 * Komponent do tworzenia nowych powiadomień
 */
const CreateNotification = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  // Stan formularza
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [targetType, setTargetType] = useState("class");
  const [targetClassId, setTargetClassId] = useState("");
  const [targetSchoolId, setTargetSchoolId] = useState("");
  const [targetRole, setTargetRole] = useState("student");

  // Stan ładowania
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Dane do wyboru
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSchools, setAvailableSchools] = useState([]);

  // Alert potwierdzenia
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  /**
   * Ładuje dostępne klasy i szkoły
   */
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      setLoadingData(true);
      try {
        // Nauczyciel widzi tylko swoją klasę
        if (currentUser.role === "teacher") {
          if (currentUser.classId) {
            // Pobierz informacje o klasie nauczyciela
            const classesRef = collection(db, "classes");
            const classQuery = query(
              classesRef,
              where("teacherId", "==", currentUser.id),
            );
            const classSnapshot = await getDocs(classQuery);

            const teacherClasses = [];
            classSnapshot.docs.forEach((doc) => {
              teacherClasses.push({
                id: doc.id,
                ...doc.data(),
              });
            });
            setAvailableClasses(teacherClasses);

            // Ustaw domyślnie klasę nauczyciela
            if (teacherClasses.length > 0) {
              setTargetClassId(teacherClasses[0].id);
            }
          }
        }

        // EkoSkop widzi wszystkie klasy i szkoły
        if (currentUser.role === "ekoskop") {
          // Pobierz wszystkie szkoły
          const schoolsSnapshot = await getDocs(collection(db, "schools"));
          const schools = [];
          schoolsSnapshot.docs.forEach((doc) => {
            schools.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setAvailableSchools(schools);

          // Pobierz wszystkie klasy
          const classesSnapshot = await getDocs(collection(db, "classes"));
          const classes = [];
          classesSnapshot.docs.forEach((doc) => {
            classes.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setAvailableClasses(classes);
        }
      } catch (error) {
        console.error("❌ Błąd podczas ładowania danych:", error);
        showError("Nie udało się załadować danych");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [currentUser, showError]);

  /**
   * Waliduje formularz
   */
  const validateForm = () => {
    if (!title.trim()) {
      showError("Tytuł jest wymagany");
      return false;
    }

    if (!message.trim()) {
      showError("Treść wiadomości jest wymagana");
      return false;
    }

    if (targetType === "class" && !targetClassId) {
      showError("Wybierz klasę docelową");
      return false;
    }

    if (targetType === "school" && !targetSchoolId) {
      showError("Wybierz szkołę docelową");
      return false;
    }

    return true;
  };

  /**
   * Obsługuje wysłanie powiadomienia
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let notificationId;

      switch (targetType) {
        case "class":
          notificationId = await createClassNotification(
            title.trim(),
            message.trim(),
            currentUser.id,
            targetClassId,
            type,
          );
          break;

        case "school":
          notificationId = await createSchoolNotification(
            title.trim(),
            message.trim(),
            currentUser.id,
            targetSchoolId,
            type,
          );
          break;

        case "global":
          notificationId = await createGlobalNotification(
            title.trim(),
            message.trim(),
            currentUser.id,
            type,
          );
          break;

        case "role":
          notificationId = await createRoleNotification(
            title.trim(),
            message.trim(),
            currentUser.id,
            targetRole,
            targetSchoolId || null,
            targetClassId || null,
            type,
          );
          break;

        default:
          throw new Error("Nieznany typ docelowy");
      }

      showSuccess("Powiadomienie zostało wysłane!");
      onClose();
    } catch (error) {
      console.error("❌ Błąd podczas wysyłania powiadomienia:", error);
      showError("Nie udało się wysłać powiadomienia");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Pobiera opis dla typu celu
   */
  const getTargetDescription = () => {
    switch (targetType) {
      case "class":
        return "Powiadomienie zostanie wysłane do wszystkich uczniów wybranej klasy";
      case "school":
        return "Powiadomienie zostanie wysłane do wszystkich uczniów i nauczycieli wybranej szkoły";
      case "global":
        return "Powiadomienie zostanie wysłane do wszystkich użytkowników aplikacji";
      case "role":
        return "Powiadomienie zostanie wysłane do wszystkich użytkowników o wybranej roli";
      default:
        return "";
    }
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">
          Musisz być zalogowany, aby tworzyć powiadomienia
        </p>
      </div>
    );
  }

  // Sprawdź uprawnienia
  if (currentUser.role !== "teacher" && currentUser.role !== "ekoskop") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">
          Nie masz uprawnień do tworzenia powiadomień
        </p>
      </div>
    );
  }

  const typeOptions = [
    { value: "info", label: "Informacja", icon: Info, color: "text-blue-500" },
    {
      value: "reminder",
      label: "Przypomnienie",
      icon: Clock,
      color: "text-orange-500",
    },
    {
      value: "alert",
      label: "Ważne",
      icon: AlertTriangle,
      color: "text-red-500",
    },
  ];

  const targetOptions = [
    ...(currentUser.role === "teacher"
      ? [{ value: "class", label: "Moja klasa" }]
      : []),
    ...(currentUser.role === "ekoskop"
      ? [
          { value: "class", label: "Konkretna klasa" },
          { value: "school", label: "Konkretna szkoła" },
          { value: "role", label: "Użytkownicy o roli" },
          { value: "global", label: "Wszyscy użytkownicy" },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Nowe powiadomienie"
        subtitle="Utwórz nowe powiadomienie"
        emoji="📢"
      />
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingData ? (
          <Loading />
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Tytuł */}
            <div>
              <Label>Tytuł powiadomienia *</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Wprowadź tytuł..."
                maxLength={100}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {title.length}/100
              </p>
            </div>

            {/* Treść */}
            <div>
              <Label>Treść wiadomości *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Wprowadź treść powiadomienia..."
                minRows={1}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {message.length}/500
              </p>
            </div>

            {/* Typ powiadomienia */}
            <div>
              <Label>Typ powiadomienia</Label>
              <div className="space-y-2">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Label
                      key={option.value}
                      className="flex items-center gap-3"
                    >
                      <Input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={type === option.value}
                        onChange={(e) => setType(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <Icon className={`h-5 w-5 ${option.color}`} />
                      <span className="text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>

            {/* Typ celu */}
            <div>
              <Label>Docelowi odbiorcy</Label>
              <Select value={targetType} onChange={setTargetType}>
                <option value="">Wybierz grupę docelową</option>
                {targetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Wybór klasy */}
            {targetType === "class" && (
              <div>
                <Label>Wybierz klasę</Label>
                <Select value={targetClassId} onChange={setTargetClassId}>
                  <option value="">Wybierz klasę...</option>
                  {availableClasses.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Wybór szkoły */}
            {targetType === "school" && (
              <div>
                <Label>Wybierz szkołę</Label>
                <Select value={targetSchoolId} onChange={setTargetSchoolId}>
                  <option value="">Wybierz szkołę...</option>
                  {availableSchools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Wybór roli */}
            {targetType === "role" && (
              <div>
                <Label>Wybierz rolę</Label>
                <Select value={targetRole} onChange={setTargetRole}>
                  <option value="student">Uczniowie</option>
                  <option value="teacher">Nauczyciele</option>
                  <option value="all">Wszyscy</option>
                </Select>
              </div>
            )}

            {/* Opis celu */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {getTargetDescription()}
              </p>
            </div>

            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || loadingData}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Wyślij
            </Button>
          </div>
        )}
      </div>
      {/* Modal potwierdzenia */}
      {showConfirmModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Potwierdzenie wysyłki
            </h3>
            <p className="mt-2 wrap-break-word text-gray-600 dark:text-gray-400">
              Czy na pewno chcesz wysłać powiadomienie "{title}"?
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1"
                disabled={loading}
              >
                Anuluj
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                }}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Wysyłanie..." : "Wyślij"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNotification;
