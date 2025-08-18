import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Select from "../../components/ui/Select";
import { School, Users } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function SelectSchoolPage() {
  const { currentUser, updateProfile, loading } = useAuth();
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Przekieruj uzytkownika gdy posiada classID
  useEffect(() => {
    if (!loading && currentUser) {
      if (currentUser.classId) {
        navigate("/", { replace: true });
      }
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    // zaladuj szkoly z firestora
    const load = async () => {
      const snap = await getDocs(collection(db, "schools"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSchools(list);
    };
    load().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedSchool) {
      setClasses([]);
      setSelectedClass("");
      return;
    }

    const loadClasses = async () => {
      const q = query(
        collection(db, "classes"),
        where("schoolId", "==", selectedSchool),
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setClasses(list);
    };

    loadClasses().catch((e) => setError(e.message));
  }, [selectedSchool]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedSchool || !selectedClass) {
      setError("Wybierz szkołę i klasę");
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({ schoolId: selectedSchool, classId: selectedClass });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-8">
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">🏫</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
          Wybierz szkołę i klasę
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Aby dokończyć rejestrację wybierz swoją szkołę i klasę.
        </p>
      </div>

      <ErrorMessage error={error} className="mb-4" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          icon={School}
          value={selectedSchool}
          onChange={setSelectedSchool}
        >
          <option value="">Wybierz szkołę</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name || s.title || s.id}
            </option>
          ))}
        </Select>

        <Select icon={Users} value={selectedClass} onChange={setSelectedClass}>
          <option value="">Wybierz klasę</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name || c.title || c.id}
            </option>
          ))}
        </Select>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-semibold text-white transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 dark:from-green-700 dark:to-emerald-800 dark:hover:from-green-800 dark:hover:to-emerald-900"
        >
          {submitting ? "Zapis..." : "Zapisz"}
        </button>
      </form>
    </div>
  );
}
