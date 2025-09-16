export default function getColorClasses(lvl) {
  // Szare tlo gdy lvl 0, Brazawe tlo gdy lvl 1, srebre tlo gdy lvl 2, zlote gdy lvl 3, a diamentowe gdy lvl max
  switch (lvl) {
    case 0:
      return "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-gray-400";
    case 1:
      return "bg-gradient-to-br from-brown-500 to-brown-600 text-white";
    case 2:
      return "bg-gradient-to-br from-slate-500 to-slate-600 text-white";
    case 3:
      return "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white";
    case 4:
      return "bg-gradient-to-br from-blue-500 to-blue-600 text-white";
    default:
      return "";
  }
}
