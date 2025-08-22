export default function Button({ loading, icon: Icon, text, loadingText }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 font-semibold text-white transition duration-200 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 dark:from-green-700 dark:to-emerald-800 dark:hover:from-green-800 dark:hover:to-emerald-900"
    >
      <div className="flex items-center justify-center gap-2">
        {Icon && <Icon size={20} />}
        {loading ? loadingText : text}
      </div>
    </button>
  );
}
