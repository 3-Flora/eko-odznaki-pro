import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, User, School, Users } from "lucide-react";
import { useNavigate } from "react-router";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../contexts/ToastContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const { showError } = useToast();

  const { login, register, loginWithGoogle, currentUser } = useAuth();

  const navigate = useNavigate();

  // Automatyczna nawigacja po zalogowaniu
  useEffect(() => {
    if (currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          showError("Hasła nie pasują do siebie");
          setLoading(false);
          return;
        }
        await register(email, password, {
          displayName,
        });
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reszta komponentu bez zmian
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center p-8">
      <object
        data="/logo.svg"
        type="image/svg+xml"
        className="mx-auto h-20 w-20"
      ></object>
      <PageHeader
        title="EKO Odznaki"
        subtitle={
          isLogin ? "Zaloguj się do swojego konta" : "Stwórz nowe konto"
        }
        className="block! text-center!"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          icon={Mail}
          type="email"
          placeholder="Adres e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!isLogin && (
          <Input
            icon={User}
            placeholder="Nazwa użytkownika"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        )}

        <Input
          icon={Lock}
          placeholder="Hasło"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {!isLogin && (
          <>
            <Input
              icon={Lock}
              placeholder="Powtórz hasło"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-semibold text-white transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 dark:from-green-700 dark:to-emerald-800 dark:hover:from-green-800 dark:hover:to-emerald-900"
        >
          {loading
            ? "Ładowanie..."
            : isLogin
              ? "Zaloguj się"
              : "Zarejestruj się"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin((p) => !p)}
          className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          {isLogin
            ? "Nie masz konta? Zarejestruj się"
            : "Masz już konto? Zaloguj się"}
        </button>
      </div>

      <div className="mt-4 text-center">
        <a
          href="/teacher-application"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Jesteś nauczycielem? Złóż wniosek o konto →
        </a>
      </div>
    </div>
  );
}
