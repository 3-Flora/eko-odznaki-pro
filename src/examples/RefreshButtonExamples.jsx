// Przykłady użycia RefreshButton z różnymi wariantami i dark mode

import RefreshButton from "../components/ui/RefreshButton";

// 1. W navbarze (domyślnie)
function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-900">
      <RefreshButton size="sm" variant="navbar" />
    </nav>
  );
}

// 2. Jako główny przycisk akcji
function ActionSection() {
  return (
    <div className="flex gap-4">
      <RefreshButton variant="button" size="default" showText={true} />
    </div>
  );
}

// 3. Pływający przycisk w prawym dolnym rogu
function FloatingRefresh() {
  return (
    <RefreshButton
      variant="floating"
      size="lg"
      className="fixed right-4 bottom-4 z-50"
    />
  );
}

// 4. Custom styling z dodatkowymi klasami dark mode
function CustomRefresh() {
  return (
    <RefreshButton
      variant="floating"
      className="border-2 border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40"
    />
  );
}

// 5. W karcie/sekcji z tłem
function CardWithRefresh() {
  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dane
        </h3>
        <RefreshButton
          variant="floating"
          size="sm"
          className="border border-gray-300 !bg-transparent !shadow-none dark:border-gray-600"
        />
      </div>
    </div>
  );
}
