import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Mail,
  Lock,
  User,
  School,
  Users,
  Chrome,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router";

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
  // Show/hide password state for confirm password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLogin, setIsLogin] = useState(true);

  const { login, register, loginWithGoogle } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(email, password);
        navigate("/");
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
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex h-svh w-full max-w-md flex-col justify-center bg-white p-8 dark:bg-gray-800">
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">🌱</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
          EKO-odznaki
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {isLogin ? "Zaloguj się do swojego konta" : "Stwórz nowe konto"}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-300" />
          <input
            type="email"
            placeholder="Adres e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-300" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 transform px-2 py-1 text-xs text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {!isLogin && (
          <>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-300" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Powtórz hasło"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pr-12 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 transform px-2 py-1 text-xs text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <div className="relative">
              <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Nazwa wyświetlana"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="relative">
              <School className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-300" />
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              >
                <option value="">Wybierz szkołę</option>
                <option value="szkola1">Szkoła 1</option>
                <option value="szkola2">Szkoła 2</option>
                <option value="szkola3">Szkoła 3</option>
              </select>
            </div>

            <div className="relative">
              <Users className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-300" />
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              >
                <option value="">Wybierz klasę</option>
                <option value="klasa1">Klasa 1</option>
                <option value="klasa2">Klasa 2</option>
                <option value="klasa3">Klasa 3</option>
                <option value="klasa3">Klasa 4</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                className={`text flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 font-semibold transition ${
                  role === "student"
                    ? "border-green-500 bg-green-500 text-white shadow-lg"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                }`}
                onClick={() => setRole("student")}
              >
                <span>🧑‍🎓 Uczeń</span>
              </button>
              <button
                type="button"
                className={`text flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 font-semibold transition ${
                  role === "teacher"
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-lg"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                }`}
                onClick={() => setRole("teacher")}
              >
                <span>👨‍🏫 Nauczyciel</span>
              </button>
            </div>
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

      {/* <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300">lub</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center w-full py-3 mt-4 font-semibold text-gray-700 bg-white border border-gray-300 gap-2 transition duration-200 rounded-xl hover:bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <Chrome className="w-5 h-5" />
          Zaloguj się przez Google
        </button>
      </div> */}

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
