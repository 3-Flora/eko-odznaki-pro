import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import { useState } from "react";
import { Lock, Save } from "lucide-react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../services/firebase";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import SuccessMessage from "../components/ui/SuccessMessage";
import { useToast } from "../contexts/ToastContext";

export default function EditPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { showError } = useToast();

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }

      // Walidacja haseł
      if (newPassword !== confirmNewPassword) {
        showError("Nowe hasła nie pasują do siebie");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        showError("Nowe hasło musi mieć co najmniej 6 znaków");
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

      // Zmiana hasła
      await updatePassword(user, newPassword);

      setSuccess("Hasło zostało pomyślnie zmienione");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        showError("Nieprawidłowe aktualne hasło");
      } else if (err.code === "auth/requires-recent-login") {
        showError("Ze względów bezpieczeństwa musisz się ponownie zalogować");
      } else if (err.code === "auth/too-many-requests") {
        showError("Zbyt wiele prób. Spróbuj ponownie później.");
      } else if (err.code === "auth/network-request-failed") {
        showError(
          "Błąd połączenia sieciowego. Sprawdź połączenie internetowe.",
        );
      } else {
        showError(err.message || "Wystąpił błąd podczas zmiany hasła");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        emoji="🔒"
        title="Zmień hasło"
        subtitle="Zabezpiecz swoje konto nowym hasłem"
      />

      <SuccessMessage success={success} />

      <form onSubmit={handlePasswordChange} className="space-y-4">
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

        <Label htmlFor="newPassword">Nowe hasło</Label>
        <Input
          id="newPassword"
          icon={Lock}
          placeholder="Wpisz nowe hasło"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <Label htmlFor="confirmNewPassword">Powtórz nowe hasło</Label>
        <Input
          id="confirmNewPassword"
          icon={Lock}
          placeholder="Powtórz nowe hasło"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />

        <Button icon={Save} loading={loading}>
          {loading ? "Zapisuję..." : "Zmień Hasło"}
        </Button>
      </form>
    </div>
  );
}
