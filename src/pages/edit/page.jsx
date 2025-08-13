import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { User, School, Users, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function EditProfilePage() {
  const navigate = useNavigate();

  // Example state, replace with context values if needed
  const [displayName, setDisplayName] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { currentUser, updateProfile } = useAuth();

  console.log(currentUser);

  useEffect(() => {
    // Fetch user data and populate form fields
    const fetchUserData = async () => {
      const userData = currentUser; // Replace with actual data fetching
      setDisplayName(userData.displayName);
      setSchool(userData.school);
      setClassName(userData.className);
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await updateProfile({ displayName, school, className });
    setLoading(false);
    navigate(-1);
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 font-semibold text-green-600 hover:text-green-800"
      >
        <ArrowLeft className="h-5 w-5" /> Powrót
      </button>

      <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
        Edytuj profil
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Nazwa wyświetlana"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="relative">
          <School className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Wybierz szkołę</option>
            <option value="szkola1">Szkoła 1</option>
            <option value="szkola2">Szkoła 2</option>
            <option value="szkola3">Szkoła 3</option>
          </select>
        </div>

        <div className="relative">
          <Users className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Wybierz klasę</option>
            <option value="klasa1">Klasa 1</option>
            <option value="klasa2">Klasa 2</option>
            <option value="klasa3">Klasa 3</option>
            <option value="klasa4">Klasa 4</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-semibold text-white transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
        >
          {loading ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </form>
    </div>
  );
}
