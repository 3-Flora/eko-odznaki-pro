import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Loading from "../../components/routing/Loading";

export default function EkoskopArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, published, draft
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);

      const articlesQuery = query(
        collection(db, "articles"),
        orderBy("createdAt", "desc"),
      );
      const articlesSnapshot = await getDocs(articlesQuery);

      const articlesData = articlesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));

      setArticles(articlesData);
    } catch (error) {
      console.error("Error loading articles:", error);
      showError("Nie udało się załadować artykułów");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć artykuł "${articleTitle}"? Ta operacja nie może być cofnięta.`,
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "articles", articleId));
      setArticles(articles.filter((article) => article.id !== articleId));
      showSuccess("Artykuł został usunięty");
    } catch (error) {
      console.error("Error deleting article:", error);
      showError("Nie udało się usunąć artykułu");
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && article.published) ||
      (filterStatus === "draft" && !article.published);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "—";
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zarządzanie artykułami"
        subtitle="Twórz i publikuj artykuły edukacyjne dla społeczności"
      />

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <input
            type="text"
            placeholder="Szukaj artykułów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-green-400"
          >
            <option value="all">Wszystkie</option>
            <option value="published">Opublikowane</option>
            <option value="draft">Szkice</option>
          </select>
        </div>

        <Link
          to="/ekoskop/articles/create"
          className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nowy artykuł
        </Link>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-800">
          <div className="mb-4 text-4xl">📝</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {searchTerm || filterStatus !== "all"
              ? "Brak wyników"
              : "Brak artykułów"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus !== "all"
              ? "Spróbuj zmienić kryteria wyszukiwania lub filtry"
              : "Utwórz pierwszy artykuł edukacyjny dla społeczności"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {article.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        article.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }`}
                    >
                      {article.published ? "Opublikowane" : "Szkic"}
                    </span>
                  </div>

                  {article.excerpt && (
                    <p className="mb-3 text-gray-600 dark:text-gray-400">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>📅 Utworzono: {formatDate(article.createdAt)}</span>
                    {article.updatedAt &&
                      article.updatedAt !== article.createdAt && (
                        <span>
                          ✏️ Edytowano: {formatDate(article.updatedAt)}
                        </span>
                      )}
                    {article.category && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {article.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  <Link
                    to={`/ekoskop/articles/edit/${article.id}`}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                    title="Edytuj artykuł"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>

                  <button
                    onClick={() =>
                      handleDeleteArticle(article.id, article.title)
                    }
                    className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                    title="Usuń artykuł"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
