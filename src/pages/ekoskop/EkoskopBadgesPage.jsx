import { useState, useEffect } from "react";
import { Link } from "react-router";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";
import { ECO_CATEGORIES } from "../../constants/ecoCategories";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import NavButton from "../../components/ui/NavButton";
import EkoSkopBadge from "../../components/badges/EkoSkopBadge";
import { Plus } from "lucide-react";

export default function EkoskopBadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);

      const badgesSnapshot = await getDocs(collection(db, "badgeTemplates"));

      const badgesData = badgesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBadges(badgesData);
    } catch (error) {
      console.error("Error loading badges:", error);
      showError("Nie udało się załadować odznak");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBadge = async (badgeId, badgeName) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć odznakę "${badgeName}"? Ta operacja nie może być cofnięta.`,
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "badgeTemplates", badgeId));
      console.log(badgeId);
      setBadges(badges.filter((badge) => badge.id !== badgeId));
      showSuccess("Odznaka została usunięta");
    } catch (error) {
      console.error("Error deleting badge:", error);
      showError("Nie udało się usunąć odznaki");
    }
  };

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch =
      badge.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || badge.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zarządzanie odznakami"
        subtitle="Twórz i edytuj odznaki przyznawane uczniom za EkoDziałania"
        emoji="🏆"
      />

      {/* Search and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <Input
            type="text"
            placeholder="Szukaj odznak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
          >
            <option value="all">Wszystkie kategorie</option>
            {ECO_CATEGORIES.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex gap-4">
          <NavButton href="/ekoskop/badges/create" className="w-full sm:w-auto">
            <Plus />
            Nowa odznaka
          </NavButton>
        </div>
      </div>

      {/* Badges Grid */}
      {filteredBadges.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-800">
          <div className="mb-4 text-4xl">🏆</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {searchTerm || filterCategory !== "all"
              ? "Brak wyników wyszukiwania"
              : "Brak odznak"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterCategory !== "all"
              ? "Spróbuj zmienić kryteria wyszukiwania lub filtry"
              : "Utwórz pierwszą odznakę dla uczniów"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBadges.map((badge) => {
            return (
              <EkoSkopBadge
                key={badge.id}
                badge={badge}
                handleDeleteBadge={handleDeleteBadge}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
