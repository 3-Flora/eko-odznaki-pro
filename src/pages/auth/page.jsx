import { useEffect, useState } from "react"; // Dodajemy useEffect
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, User, School, Users } from "lucide-react";
import { useNavigate } from "react-router"; // Poprawiony import
import ErrorMessage from "../../components/ui/ErrorMessage";
import Select from "../../components/ui/Select";
import UserTypeSelect from "../../components/ui/UserTypeSelect";
import Input from "../../components/ui/Input";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);

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
    setError("");

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError("Hasła nie pasują do siebie");
          setLoading(false);
          return;
        }
        await register(email, password, {
          displayName,
          school,
          className,
          role,
        });
      }
      // Usuwamy navigate("/") - useEffect się tym zajmie
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      // Usuwamy navigate("/") - useEffect się tym zajmie
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reszta komponentu bez zmian
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-8">
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">🌱</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
          EKO Odznaki
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {isLogin ? "Zaloguj się do swojego konta" : "Stwórz nowe konto"}
        </p>
      </div>

      <ErrorMessage error={error} className="mb-4" />

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
            placeholder="Nazwa wyświetlana"
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

            <Select icon={School} value={school} onChange={setSchool}>
              <option value="">Wybierz szkołę</option>
              <option value="szkola1">Szkoła 1</option>
              <option value="szkola2">Szkoła 2</option>
              <option value="szkola3">Szkoła 3</option>
            </Select>

            <Select icon={Users} value={className} onChange={setClassName}>
              <option value="">Wybierz klasę</option>
              <option value="klasa1">Klasa 1</option>
              <option value="klasa2">Klasa 2</option>
              <option value="klasa3">Klasa 3</option>
              <option value="klasa4">Klasa 4</option>
            </Select>

            {/* Do usunięcia po skończeniu apki */}
            <UserTypeSelect onRoleChange={setRole} role={role} />
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
    </div>
  );
}
