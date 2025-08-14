export default function Label({ children }) {
  return (
    <label className="mb-2 block text-lg font-medium text-gray-700 dark:text-gray-300">
      {children}
    </label>
  );
}
