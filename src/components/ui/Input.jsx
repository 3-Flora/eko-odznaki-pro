import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Input({
  type = "text",
  disablePasswordVisibilityToggle,
  icon: Icon,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState(type);

  function togglePasswordVisibility() {
    setShowPassword((prev) => !prev);
    setInputType((prev) => (prev === "password" ? "text" : "password"));
  }

  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-300" />
      )}
      <input
        type={inputType}
        className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        {...props}
      />
      {type === "password" && !disablePasswordVisibilityToggle && (
        <button
          type="button"
          className="absolute top-1/2 right-3 -translate-y-1/2 transform px-2 py-1 text-xs text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      )}
    </div>
  );
}
