import PageHeader from "../../components/ui/PageHeader";

export default function EditEcoActionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Edytuj EkoDziałanie"
        subtitle="Wprowadź zmiany w szablonie EkoDziałania"
      />

      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
        <div className="mb-4 text-4xl">🚧</div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Strona w budowie
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Ta funkcjonalność zostanie wkrótce zaimplementowana.
        </p>
      </div>
    </div>
  );
}
