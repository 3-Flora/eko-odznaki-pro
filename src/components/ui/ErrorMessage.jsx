import { motion } from "framer-motion";
import clsx from "clsx";

export default function ErrorMessage({ error, className }) {
  return (
    <>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "rounded-xl border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-300",
            className,
          )}
        >
          {error}
        </motion.div>
      )}
    </>
  );
}
