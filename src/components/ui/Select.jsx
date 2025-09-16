import { useState, Children } from "react";
import { Users } from "lucide-react";
import clsx from "clsx";

export default function Select({ icon: Icon, value, onChange, children }) {
  const [open, setOpen] = useState(false);

  const getLabel = (childrenList) => {
    let foundLabel = "";
    Children.forEach(childrenList, (child) => {
      if (child?.props?.value === value) {
        foundLabel = child.props.children;
      }
      if (!foundLabel && child?.props?.children) {
        foundLabel = getLabel(child.props.children);
      }
    });
    return foundLabel;
  };

  const selectedLabel = getLabel(children) || "Wybierz";

  const renderOptions = (childrenList, level = 0) => {
    return Children.map(childrenList, (child) => {
      if (!child) return null;

      if (child.type === "option") {
        const isNull = child.props.value === "";

        return (
          <div
            key={child.props.value}
            onClick={
              isNull
                ? undefined
                : () => {
                    onChange(child.props.value);
                    setOpen(false);
                  }
            }
            className={clsx(
              isNull &&
                "border-b border-gray-200 font-semibold dark:border-gray-700",
              !isNull &&
                "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
              "px-4 py-3 text-center text-gray-700 dark:text-gray-300",
              value === child.props.value && "bg-gray-100 dark:bg-gray-800",
            )}
          >
            {child.props.children}
          </div>
        );
      }

      if (child.type === "optgroup") {
        return (
          <div key={child.props.label}>
            <div
              className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-white"
              style={{ paddingLeft: `${level * 8}px` }}
            >
              {child.props.label}
            </div>
            {renderOptions(child.props.children, level + 1)}
          </div>
        );
      }

      return null;
    });
  };

  return (
    <>
      <div className="relative">
        {Icon ? (
          <Icon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-white" />
        ) : (
          <Users className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-white" />
        )}
        <div
          onClick={() => setOpen(true)}
          className="w-full cursor-pointer rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition focus-within:border-transparent focus-within:ring-2 focus-within:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          {selectedLabel}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 m-0 flex items-center justify-center bg-black/50">
          <div className="max-h-[70vh] w-80 overflow-y-auto rounded-xl bg-white shadow-lg dark:bg-gray-800">
            {renderOptions(children)}
            <button
              onClick={() => setOpen(false)}
              className="w-full cursor-pointer border-t border-gray-200 py-3 text-center font-semibold text-green-600 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </>
  );
}
