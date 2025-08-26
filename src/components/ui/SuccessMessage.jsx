import clsx from "clsx";

export default function SuccessMessage({ success, className }) {
  return (
    <>
      {success && (
        <div
          className={clsx(
            "mb-4 rounded-xl bg-green-100 p-3 text-green-800 dark:bg-green-900 dark:text-green-200",
            className,
          )}
        >
          {success}
        </div>
      )}
    </>
  );
}
