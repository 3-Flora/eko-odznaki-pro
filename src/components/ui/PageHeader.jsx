import clsx from "clsx";
import { Link } from "react-router";

export default function PageHeader({
  emoji,
  title,
  subtitle,
  className,
  breadcrumbs,
}) {
  return (
    <div className={clsx("relative mt-2 mb-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg
                    className="mx-2 h-4 w-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {breadcrumb.current ? (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {breadcrumb.name}
                  </span>
                ) : (
                  <Link
                    to={breadcrumb.href}
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {breadcrumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="text-center lg:flex lg:items-center lg:gap-6 lg:text-left">
        {emoji && (
          <div className="mb-4 text-6xl lg:mb-0 lg:text-8xl">{emoji}</div>
        )}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800 lg:text-4xl dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 lg:text-lg dark:text-gray-300">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
