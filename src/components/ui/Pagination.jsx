import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / itemsPerPage));

  return (
    <div
      className={
        "mt-4 flex flex-col items-center justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 " +
        className
      }
    >
      <div className="mb-2 text-gray-600 dark:text-gray-400">
        Strona {currentPage} z {totalPages} • Wyników: {totalItems}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Poprzednia
        </button>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Następna
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
