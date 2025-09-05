import React from "react";
import { RefreshCw } from "lucide-react";
import { useGlobalRefresh } from "../../contexts/RefreshContext";
import clsx from "clsx";

export default function RefreshButton({
  className = "",
  showText = false,
  variant = "navbar", // "navbar", "button", "floating"
}) {
  const { isRefreshing, triggerGlobalRefresh } = useGlobalRefresh();

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    default: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  const variantClasses = {
    navbar: "text-gray-600 dark:text-gray-400",
    button:
      "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl dark:bg-green-600 dark:hover:bg-green-700",
    floating:
      "bg-white shadow-lg hover:shadow-xl border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
  };

  if (showText && variant !== "navbar") {
    return (
      <button
        onClick={triggerGlobalRefresh}
        disabled={isRefreshing}
        className={clsx(
          "flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200",
          "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:disabled:opacity-40",
          variantClasses[variant],
          className,
        )}
        title="Odśwież dane"
      >
        <RefreshCw
          className={clsx(
            iconSizes[size],
            "transition-transform duration-500",
            isRefreshing && "animate-spin",
          )}
        />
        <span className="ml-2">
          {isRefreshing ? "Odświeżanie..." : "Odśwież"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={triggerGlobalRefresh}
      disabled={isRefreshing}
      className={clsx(
        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-200 transition-colors dark:bg-gray-800",
        variantClasses[variant],
        className,
      )}
      title="Odśwież dane"
    >
      <RefreshCw
        className={clsx(
          "transition-transform duration-500",
          isRefreshing && "animate-spin",
        )}
      />
      {showText && (
        <span className="ml-2 text-sm">
          {isRefreshing ? "Odświeżanie..." : "Odśwież"}
        </span>
      )}
    </button>
  );
}
