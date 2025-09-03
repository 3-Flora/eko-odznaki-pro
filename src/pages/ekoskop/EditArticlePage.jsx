import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";

export default function EditArticlePage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    published: false,
    featuredImageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    "Edukacja ekologiczna",
    "Recykling",
    "Oszczędzanie energii",
    "Transport ekologiczny",
    "Zrównoważone odżywianie",
    "Przyroda i środowisko",
    "Porady praktyczne",
    "Aktualności",
  ];

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);

      const articleDoc = await getDoc(doc(db, "articles", articleId));
      if (!articleDoc.exists()) {
        showError("Nie znaleziono artykułu");
        navigate("/ekoskop/articles");
        return;
      }

      const articleData = articleDoc.data();
      setFormData({
        title: articleData.title || "",
        excerpt: articleData.excerpt || "",
        content: articleData.content || "",
        category: articleData.category || "",
        tags: (articleData.tags || []).join(", "),
        published: articleData.published || false,
        featuredImageUrl: articleData.featuredImageUrl || "",
      });
    } catch (error) {
      console.error("Error loading article:", error);
      showError("Nie udało się załadować artykułu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      showError("Tytuł i treść artykułu są wymagane");
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        published: formData.published,
        featuredImageUrl: formData.featuredImageUrl.trim(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "articles", articleId), updateData);

      showSuccess("Artykuł został zaktualizowany pomyślnie");
      navigate("/ekoskop/articles");
    } catch (error) {
      console.error("Error updating article:", error);
      showError("Nie udało się zaktualizować artykułu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edytuj artykuł"
        subtitle="Wprowadź zmiany w artykule edukacyjnym"
        breadcrumbs={[
          { name: "Artykuły", href: "/ekoskop/articles" },
          { name: "Edytuj artykuł", current: true },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tytuł artykułu *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              placeholder="Wpisz tytuł artykułu..."
              required
            />
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label
              htmlFor="excerpt"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Krótki opis (excerpt)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              placeholder="Krótki opis artykułu, który będzie wyświetlany na liście..."
            />
          </div>

          {/* Category and Tags */}
          <div className="mb-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Kategoria
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              >
                <option value="">Wybierz kategorię</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tagi (oddzielone przecinkami)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                placeholder="ekologia, recykling, energia..."
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-6">
            <label
              htmlFor="featuredImageUrl"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              URL zdjęcia głównego
            </label>
            <input
              type="url"
              id="featuredImageUrl"
              name="featuredImageUrl"
              value={formData.featuredImageUrl}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Treść artykułu *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={15}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
              placeholder="Wpisz treść artykułu..."
              required
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Możesz używać prostego formatowania markdown (np. **pogrubienie**,
              *kursywa*, [link](url))
            </p>
          </div>

          {/* Publish Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label
              htmlFor="published"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Opublikuj artykuł
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/ekoskop/articles")}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Anuluj
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Zapisywanie...
              </div>
            ) : (
              "Zapisz zmiany"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
