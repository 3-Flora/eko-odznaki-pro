export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    </div>
  );
}
