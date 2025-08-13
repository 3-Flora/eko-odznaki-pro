import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="h-full flex-1 overflow-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
