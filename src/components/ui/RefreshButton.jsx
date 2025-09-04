import React from "react";
import { RefreshCw } from "lucide-react";
import { useGlobalRefresh } from "../../contexts/RefreshContext";
import clsx from "clsx";

export default function RefreshButton({
  className = "",
  size = "default",
  showText = false,
  variant = "navbar", // "navbar", "button", "floating"
}) {
  const { isRefreshing, triggerGlobalRefresh } = useGlobalRefresh();

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    default: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const variantClasses = {
    navbar: "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white",
    button:
      "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl",
    floating:
      "bg-white shadow-lg hover:shadow-xl border border-gray-200 text-gray-700 hover:bg-gray-50",
  };

  if (showText && variant !== "navbar") {
    return (
      <button
        onClick={triggerGlobalRefresh}
        disabled={isRefreshing}
        className={clsx(
          "flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200",
          "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
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
        "flex items-center justify-center rounded-full transition-all duration-200",
        "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
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
      {showText && (
        <span className="ml-2 text-sm">
          {isRefreshing ? "Odświeżanie..." : "Odśwież"}
        </span>
      )}
    </button>
  );
}
