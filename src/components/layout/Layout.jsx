import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="h-full flex-1 overflow-auto">
        <div className="flex flex-col justify-normal gap-6 p-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
