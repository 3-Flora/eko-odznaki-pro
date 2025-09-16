import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { useSidebar } from "../../contexts/SidebarContext";
import { Outlet, useLocation } from "react-router";
import { useRef, useEffect } from "react";

/*
  FIX: zeby strona przewijala sie do gory przy zmianie sciezki
*/
function ScrollToTop({ scrollContainerRef }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [pathname, scrollContainerRef]);

  return null;
}

export default function Layout() {
  const scrollRef = useRef(null);
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ScrollToTop scrollContainerRef={scrollRef} />

      {/* Sidebar for desktop */}
      <SideNav />

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        <div className="flex h-svh flex-col lg:max-w-none">
          <Navbar />
          <main className="h-full flex-1 overflow-auto" ref={scrollRef}>
            <div className="flex flex-col justify-normal gap-6 p-4 lg:mx-auto lg:max-w-7xl lg:px-8">
              <Outlet />
            </div>
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
