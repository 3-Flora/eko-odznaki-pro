import { useNavigate } from "react-router";
import clsx from "clsx";

export default function DashboardCard({
  title,
  subtitle,
  emoji,
  className,
  href,
}) {
  const navigate = useNavigate();

  return (
    <div
      className={clsx(
        "cursor-pointer rounded-2xl bg-gradient-to-br p-6 text-white",
        className,
      )}
      onClick={() => navigate(href)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-100">{title}</p>
          <p className="text-lg font-bold">{subtitle}</p>
        </div>
        <div className="text-3xl opacity-80">{emoji}</div>
      </div>
    </div>
  );
}
