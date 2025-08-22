import clsx from "clsx";

export default function Button({
  loading,
  icon: Icon,
  children,
  onClick = () => {},
  style = "normal", // "normal" | "loading" | "danger"
  className,
}) {
  const buttonStyles = {
    normal: {
      background: "bg-gradient-to-r from-green-500 to-emerald-600",
      hover: "hover:from-green-600 hover:to-emerald-700",
      dark: "dark:from-green-700 dark:to-emerald-800 dark:hover:from-green-800 dark:hover:to-emerald-900",
    },
    loading: {
      background: "bg-gray-200",
      dark: "dark:bg-gray-700",
    },
    danger: {
      background: "bg-gradient-to-r from-red-500 to-red-600",
      hover: "hover:from-red-600 hover:to-red-700",
      dark: "dark:from-red-700 dark:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900",
    },
  };

  return (
    <button
      type="submit"
      disabled={loading}
      onClick={onClick}
      className={clsx(
        "w-full rounded-xl py-3 font-semibold text-white transition duration-200 disabled:opacity-50",
        buttonStyles[style].background,
        buttonStyles[style].hover,
        buttonStyles[style].dark,
        // Loading
        loading && buttonStyles.loading.background,
        loading && buttonStyles.loading.dark,

        className,
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {Icon && <Icon size={20} />}
        {children}
      </div>
    </button>
  );
}
