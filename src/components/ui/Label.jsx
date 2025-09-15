import clsx from "clsx";

export default function Label({
  htmlFor,
  children,
  className,
  isRequired = false,
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        "mb-2 block text-lg font-medium text-gray-700 dark:text-gray-300",
        className,
      )}
    >
      {children}
      {isRequired && <span className="text-red-500">*</span>}
    </label>
  );
}
