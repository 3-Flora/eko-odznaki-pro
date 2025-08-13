export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    </div>
  );
}
