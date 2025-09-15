import clsx from "clsx";

export default function Button({
  loading,
  icon: Icon,
  children,
  onClick = () => {},
  style = "normal", // "normal" | "loading" | "danger" | "outline" | "gray" | "lightBlue" | "success"
  size = "md", // "xs" | "sm" | "md" | "lg"
  fullWidth = true,
  className,
}) {
  const buttonStyles = {
    normal: {
      background: "bg-gradient-to-r from-green-500 to-emerald-600",
      hover: "hover:from-green-600 hover:to-emerald-700",
      dark: "dark:from-green-700 dark:to-emerald-800 dark:hover:from-green-800 dark:hover:to-green-900",
      text: "text-white",
    },
    loading: {
      background: "bg-gray-200",
      dark: "dark:bg-gray-700",
      text: "text-gray-600 dark:text-gray-300",
    },
    lightBlue: {
      background: "bg-gradient-to-r from-blue-500 to-blue-600",
      hover: "hover:from-blue-600 hover:to-blue-700",
      dark: "dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900",
      text: "text-white",
    },
    danger: {
      background: "bg-gradient-to-r from-red-500 to-red-600",
      hover: "hover:from-red-600 hover:to-red-700",
      dark: "dark:from-red-700 dark:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900",
      text: "text-white",
    },
    gray: {
      background: "bg-gray-50",
      hover: "hover:bg-gray-100",
      dark: "dark:bg-gray-800 dark:hover:bg-gray-700",
      text: "text-gray-800 dark:text-gray-200",
    },
    outline: {
      background: "bg-transparent border border-gray-300",
      hover: "hover:bg-gray-50 hover:border-gray-400",
      dark: "dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500",
      text: "text-gray-700 dark:text-gray-300",
    },
    success: {
      background: "bg-gradient-to-r from-green-500 to-green-600",
      hover: "hover:from-green-600 hover:to-green-700",
      dark: "dark:from-green-700 dark:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900",
      text: "text-white",
    },
  };

  const buttonSizes = {
    xs: {
      padding: "py-1 px-2",
      text: "text-xs",
    },
    sm: {
      padding: "py-2 px-4",
      text: "text-sm",
    },
    md: {
      padding: "py-3 px-6",
      text: "text-base",
    },
    lg: {
      padding: "py-4 px-8",
      text: "text-lg",
    },
  };

  return (
    <button
      type="submit"
      disabled={loading}
      onClick={(e) => {
        onClick();
      }}
      className={clsx(
        "cursor-pointer rounded-xl font-semibold transition duration-200 disabled:opacity-50",
        buttonStyles[style].background,
        buttonStyles[style].hover,
        buttonStyles[style].dark,
        // Text color (light + dark)
        buttonStyles[style].text,
        // Loading
        loading && buttonStyles.loading.background,
        loading && buttonStyles.loading.dark,
        // Loading text override
        loading && buttonStyles.loading.text,

        buttonSizes[size].padding,
        buttonSizes[size].text,

        fullWidth && "w-full",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {Icon && (
          <Icon
            size={20}
            className={clsx(
              buttonStyles[style].text,
              loading && buttonStyles.loading.text,
            )}
          />
        )}
        {children}
      </div>
    </button>
  );
}
