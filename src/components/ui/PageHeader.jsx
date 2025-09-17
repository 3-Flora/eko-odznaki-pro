import clsx from "clsx";

export default function PageHeader({ emoji, title, subtitle, className }) {
  return (
    <div className={"relative mt-2 mb-4"}>
      {/* Header Content */}
      <div
        className={clsx(
          "text-center lg:flex lg:items-center lg:gap-6 lg:text-left",
          className,
        )}
      >
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
