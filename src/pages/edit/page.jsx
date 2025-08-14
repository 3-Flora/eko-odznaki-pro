import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { User, School, Users, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { currentUser, updateProfile } = useAuth();

  useEffect(() => {
    // Fetch user data and populate form fields
    const fetchUserData = async () => {
      const userData = currentUser; // Replace with actual data fetching
      setDisplayName(userData.displayName);
      setSchool(userData.school);
      setClassName(userData.className);
      setEmail(userData.email);
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await updateProfile({ displayName, school, className, email });
    setLoading(false);
    // TODO: Zamiast cofania, informacja o pomyślnej zmianie
    navigate(-1);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-md rounded-2xl p-4 shadow-lg dark:bg-gray-800">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 font-semibold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
        >
          <ArrowLeft className="h-5 w-5" /> Powrót
        </button>

        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
          Edytuj profil
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Label>Nazwa wyświetlana</Label>
          <Input
            type="text"
            placeholder="Nazwa wyświetlana"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            icon={User}
          />

          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
          />

          <Label>Szkoła</Label>
          <Select value={school} onChange={setSchool}>
            <option value="">Wybierz szkołę</option>
            <option value="szkola1">Szkoła 1</option>
            <option value="szkola2">Szkoła 2</option>
            <option value="szkola3">Szkoła 3</option>
          </Select>

          <Label>Klasa</Label>
          <Select value={className} onChange={setClassName}>
            <option value="">Wybierz klasę</option>
            <option value="klasa1">Klasa 1</option>
            <option value="klasa2">Klasa 2</option>
            <option value="klasa3">Klasa 3</option>
            <option value="klasa4">Klasa 4</option>
          </Select>

          <Button loading={loading} />
        </form>
      </div>
    </>
  );
}
