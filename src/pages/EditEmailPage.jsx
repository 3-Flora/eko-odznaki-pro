import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import { useState } from "react";
import { Mail, Lock, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth } from "../services/firebase";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import SuccessMessage from "../components/ui/SuccessMessage";
import { useToast } from "../contexts/ToastContext";

export default function EditEmailPage() {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { showError } = useToast();

  const { currentUser } = useAuth();

  const reauthenticate = async (currentPassword) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Użytkownik nie jest zalogowany");
    }

    if (!user.email) {
      throw new Error("Nie można zidentyfikować adresu e-mail użytkownika");
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      throw error;
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }

      // Walidacja
      if (!newEmail) {
        showError("Podaj nowy adres e-mail");
        setLoading(false);
        return;
      }

      if (newEmail === currentUser.email) {
        showError("Nowy adres e-mail jest taki sam jak aktualny");
        setLoading(false);
        return;
      }

      if (!currentPassword) {
        showError("Podaj aktualne hasło");
        setLoading(false);
        return;
      }

      // Reautentykacja
      await reauthenticate(currentPassword);

      // Wysłanie e-mail weryfikacyjnego
      await verifyBeforeUpdateEmail(user, newEmail);

      setSuccess(
        `Wysłano e-mail weryfikacyjny na adres ${newEmail}. Po kliknięciu w link weryfikacyjny Twój e-mail zostanie zmieniony. Sprawdź swoją skrzynkę pocztową.`,
      );

      setNewEmail("");
      setCurrentPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        showError("Nieprawidłowe aktualne hasło");
      } else if (err.code === "auth/email-already-in-use") {
        showError("Ten adres e-mail jest już używany przez inne konto");
      } else if (err.code === "auth/invalid-email") {
        showError("Nieprawidłowy format adresu e-mail");
      } else if (err.code === "auth/requires-recent-login") {
        showError("Ze względów bezpieczeństwa musisz się ponownie zalogować");
      } else if (err.code === "auth/too-many-requests") {
        showError("Zbyt wiele prób. Spróbuj ponownie później.");
      } else if (err.code === "auth/network-request-failed") {
        showError(
          "Błąd połączenia sieciowego. Sprawdź połączenie internetowe.",
        );
      } else if (err.code === "auth/invalid-credential") {
        showError("Nieprawidłowe hasło. Spróbuj ponownie.");
      } else {
        showError(err.message || "Wystąpił błąd podczas zmiany e-mail");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        emoji="📧"
        title="Zmień adres e-mail"
        subtitle="Zaktualizuj swój adres e-mail"
      />

      <div className="mb-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <div className="text-blue-800 dark:text-blue-200">
            <p className="mb-1 font-semibold">ℹ️ Jak działa zmiana e-mail:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Podaj nowy adres e-mail i aktualne hasło</li>
              <li>Zostanie wysłany e-mail weryfikacyjny na nowy adres</li>
              <li>Kliknij w link w e-mail, aby potwierdzić zmianę</li>
              <li>Twój e-mail zostanie automatycznie zmieniony</li>
            </ol>
          </div>
        </div>
      </div>

      <SuccessMessage success={success} />

      <form onSubmit={handleEmailChange} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentEmail">Aktualny adres e-mail</Label>
          <Input
            id="currentEmail"
            icon={Mail}
            type="email"
            value={currentUser?.email || ""}
            disabled
          />
        </div>

        <Label htmlFor="newEmail">Nowy adres e-mail</Label>
        <Input
          id="newEmail"
          icon={Mail}
          type="email"
          placeholder="Wpisz nowy adres e-mail"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />

        <Label htmlFor="currentPassword">Aktualne hasło</Label>
        <Input
          id="currentPassword"
          icon={Lock}
          placeholder="Wpisz aktualne hasło"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <Button icon={Mail} loading={loading}>
          {loading ? "Wysyłanie..." : "Wyślij e-mail weryfikacyjny"}
        </Button>
      </form>
    </div>
  );
}
