import { motion } from "framer-motion";
import clsx from "clsx";

export default function SuccessMessage({ success, className }) {
  return (
    <>
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "mb-4 rounded-xl bg-green-100 p-3 text-green-800 dark:bg-green-900 dark:text-green-200",
            className,
          )}
        >
          {success}
        </motion.div>
      )}
    </>
  );
}
