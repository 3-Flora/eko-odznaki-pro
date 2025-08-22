import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, User, Trash2, Save, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth } from "../services/firebase";
import ErrorMessage from "../components/ui/ErrorMessage";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import PageHeader from "../components/ui/PageHeader";
import SuccessMessage from "../components/ui/SuccessMessage";

export default function EditProfilePage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const { currentUser, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth", { replace: true });
      return;
    }

    setEmail(currentUser.email || "");
    setDisplayName(currentUser.displayName || "");
  }, [currentUser, navigate]);

  const reauthenticate = async (currentPassword) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Użytkownik nie jest zalogowany");
    }

    if (!user.email) {
      throw new Error("Nie można zidentyfikować adresu e-mail użytkownika");
    }

    try {
      console.log("Tworzę credentials dla:", user.email);
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      console.log("Wykonuję reautentykację...");
      await reauthenticateWithCredential(user, credential);
      console.log("Reautentykacja pomyślna");
    } catch (error) {
      console.error("Szczegóły błędu reautentykacji:", {
        code: error.code,
        message: error.message,
        userEmail: user.email,
        errorDetails: error,
      });
      throw error;
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = auth.currentUser;

      // Sprawdź czy potrzebujemy reautentykacji (tylko dla zmiany email)
      const needsReauth = email !== currentUser.email;

      if (needsReauth && !currentPassword) {
        setError("Podaj aktualne hasło, aby potwierdzić zmianę e-mail");
        setLoading(false);
        return;
      }

      // Reautentykacja jeśli potrzebna
      if (needsReauth) {
        try {
          await user.reload();
          await reauthenticate(currentPassword);
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (reauthError) {
          console.error("Błąd reautentykacji:", reauthError);
          throw reauthError;
        }
      }

      // Obsługa zmiany e-mail
      let emailVerificationSent = false;
      if (email !== currentUser.email) {
        await verifyBeforeUpdateEmail(user, email);
        emailVerificationSent = true;
      }

      // Zaktualizuj nazwę użytkownika w Firestore (jeśli została zmieniona)
      const updates = {};
      if (displayName !== currentUser.displayName) {
        updates.displayName = displayName;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }

      // Ustaw odpowiedni komunikat sukcesu
      let successMessages = [];

      if (emailVerificationSent) {
        successMessages.push(
          `Wysłano e-mail weryfikacyjny na adres ${email}. Po weryfikacji Twój e-mail zostanie zmieniony`,
        );
        // Przywróć oryginalny e-mail w formularzu, dopóki nie zostanie zweryfikowany
        setEmail(currentUser.email);
      }

      if (Object.keys(updates).length > 0) {
        successMessages.push("Profil został zaktualizowany");
      }

      if (successMessages.length > 0) {
        setSuccess(successMessages.join(". ") + ".");
      } else if (!emailVerificationSent) {
        setSuccess("Profil został pomyślnie zaktualizowany");
      }

      setCurrentPassword("");
    } catch (err) {
      console.error("Błąd aktualizacji profilu:", err);

      if (err.code === "auth/wrong-password") {
        setError("Nieprawidłowe aktualne hasło");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Ten adres e-mail jest już używany przez inne konto");
      } else if (err.code === "auth/invalid-email") {
        setError("Nieprawidłowy format adresu e-mail");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Ze względów bezpieczeństwa musisz się ponownie zalogować");
      } else if (err.code === "auth/too-many-requests") {
        setError("Zbyt wiele prób. Spróbuj ponownie później.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Błąd połączenia sieciowego. Sprawdź połączenie internetowe.");
      } else if (err.code === "permission-denied") {
        setError("Brak uprawnień do wykonania tej operacji");
      } else {
        setError(err.message || "Wystąpił błąd podczas aktualizacji profilu");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!currentPassword) {
        setError("Podaj aktualne hasło, aby usunąć konto");
        setLoading(false);
        return;
      }

      await reauthenticate(currentPassword);
      await deleteAccount();

      // Przekieruj do strony logowania po usunięciu konta
      navigate("/auth", { replace: true });
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Nieprawidłowe hasło");
      } else {
        setError(err.message || "Wystąpił błąd podczas usuwania konta");
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div>
      <PageHeader
        emoji="⚙️"
        title="Ustawienia konta"
        subtitle="Zarządzaj swoim profilem i ustawieniami"
      />

      <ErrorMessage error={error} />
      <SuccessMessage success={success} />

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <Label htmlFor="displayName">Zmień nazwę wyświetlaną</Label>
        <Input
          id="displayName"
          icon={User}
          placeholder="Nazwa użytkownika"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <Label htmlFor="email">Zmień e-mail</Label>
        <Input
          id="email"
          icon={Mail}
          type="email"
          placeholder="Adres e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Wymagaj hasła jeśli zmieniamy email lub hasło */}
        {email !== currentUser.email && (
          <>
            <Label htmlFor="currentPassword">
              Hasło wymagane do zmiany e-mail
            </Label>
            <Input
              icon={Lock}
              placeholder="Aktualne hasło"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
              <strong>ℹ️ Zmiana e-mail:</strong> Po zapisaniu zostanie wysłany
              e-mail weryfikacyjny na nowy adres. E-mail zostanie zmieniony
              dopiero po kliknięciu w link weryfikacyjny.
            </div>
          </>
        )}

        {/* Przycisk do zmiany hasła */}
        <div className="space-y-2">
          <Label>Hasło</Label>
          <button
            type="button"
            onClick={() => navigate("/profile/edit/password")}
            className="w-full rounded-xl border-1 border-gray-200 bg-white p-3 text-left transition duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Zmień hasło
                </span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-semibold text-white transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 dark:from-green-700 dark:to-emerald-800 dark:hover:from-green-800 dark:hover:to-emerald-900"
        >
          <div className="flex items-center justify-center gap-2">
            <Save size={20} />
            {loading ? "Zapisywanie..." : "Zapisz zmiany"}
          </div>
        </button>
      </form>

      {/* Sekcja usuwania konta */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
          Strefa niebezpieczna
        </h3>

        {showDeleteConfirmation && (
          <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <p className="mb-4 text-sm text-red-800 dark:text-red-200">
              Ta akcja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale
              usunięte.
            </p>

            <Input
              icon={Lock}
              placeholder="Potwierdź hasło, aby usunąć konto"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 py-3 font-semibold text-white transition duration-200 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <Trash2 size={20} />
            {showDeleteConfirmation
              ? "Potwierdź usunięcie konta"
              : "Usuń konto"}
          </div>
        </button>

        {showDeleteConfirmation && (
          <button
            type="button"
            onClick={() => {
              setShowDeleteConfirmation(false);
              setCurrentPassword("");
              setError("");
            }}
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-2 font-medium text-gray-700 transition duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Anuluj
          </button>
        )}
      </div>
    </div>
  );
}
