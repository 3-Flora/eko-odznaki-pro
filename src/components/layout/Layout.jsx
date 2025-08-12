import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 h-full overflow-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
