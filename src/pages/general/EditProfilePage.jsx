import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, User, Trash2, Save, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../../services/firebase";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import PageHeader from "../../components/ui/PageHeader";
import SuccessMessage from "../../components/ui/SuccessMessage";
import Button from "../../components/ui/Button";
import { useToast } from "../../contexts/ToastContext";

export default function EditProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const { showError } = useToast();

  const { currentUser, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth", { replace: true });
      return;
    }

    setDisplayName(currentUser.displayName || "");
  }, [currentUser, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      // Zaktualizuj nazwę użytkownika w Firestore (jeśli została zmieniona)
      const updates = {};
      if (displayName !== currentUser.displayName) {
        updates.displayName = displayName;
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        setSuccess("Profil został pomyślnie zaktualizowany");
      } else {
        setSuccess("Brak zmian do zapisania");
      }
    } catch (err) {
      console.error("Błąd aktualizacji profilu:", err);

      if (err.code === "permission-denied") {
        showError("Brak uprawnień do wykonania tej operacji");
      } else if (err.code === "network-request-failed") {
        showError(
          "Błąd połączenia sieciowego. Sprawdź połączenie internetowe.",
        );
      } else {
        showError(err.message || "Wystąpił błąd podczas aktualizacji profilu");
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

    try {
      if (!currentPassword) {
        showError("Podaj aktualne hasło, aby usunąć konto");
        setLoading(false);
        return;
      }

      // Reautentykacja przed usunięciem konta
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );
        await reauthenticateWithCredential(user, credential);
      }

      await deleteAccount();

      // Przekieruj do strony logowania po usunięciu konta
      navigate("/auth", { replace: true });
    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        setCurrentPassword("");
        showError("Nieprawidłowe hasło");
      } else {
        showError(err.message || "Wystąpił błąd podczas usuwania konta");
      }
    } finally {
      setLoading(false);
      // setShowDeleteConfirmation(false);
    }
  };

  return (
    <div>
      <PageHeader
        emoji="⚙️"
        title="Ustawienia konta"
        subtitle="Zarządzaj swoim profilem i ustawieniami"
      />

      <SuccessMessage success={success} />

      <form onSubmit={handleUpdateProfile} className="mb-4 space-y-4">
        <Label htmlFor="displayName">Zmień nazwę wyświetlaną</Label>
        <Input
          id="displayName"
          icon={User}
          placeholder="Nazwa użytkownika"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <Label>Email</Label>
        <button
          type="button"
          onClick={() => navigate("/profile/edit/email")}
          className="w-full rounded-xl border-1 border-gray-200 bg-white p-3 text-left transition duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                Zmień e-mail
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </button>

        {/* Przycisk do zmiany hasła */}
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

        <Button icon={Save} loading={loading} buttonStyle="danger">
          {loading ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </form>

      {/* Sekcja usuwania konta */}
      <div className="space-y-4">
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

        <Button
          onClick={handleDeleteAccount}
          disabled={loading}
          icon={Trash2}
          style="danger"
        >
          {showDeleteConfirmation ? "Potwierdź usunięcie konta" : "Usuń konto"}
        </Button>

        {showDeleteConfirmation && (
          <Button
            onClick={() => {
              setShowDeleteConfirmation(false);
              setCurrentPassword("");
            }}
            style="gray"
          >
            Anuluj
          </Button>
        )}
      </div>
    </div>
  );
}
