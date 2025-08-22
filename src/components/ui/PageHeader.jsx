import BackButton from "./BackButton";

export default function PageHeader({
  emoji,
  title,
  subtitle,
  disableBackButton,
}) {
  return (
    <div className="mb-4 text-center">
      {!disableBackButton && <BackButton />}

      <div className="mb-4 text-6xl">{emoji}</div>
      <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
    </div>
  );
}
