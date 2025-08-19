import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
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

  return (
    <div className="flex h-svh flex-col bg-gray-50 dark:bg-gray-900">
      <ScrollToTop scrollContainerRef={scrollRef} />
      <Navbar />
      <main className="h-full flex-1 overflow-auto" ref={scrollRef}>
        <div className="flex flex-col justify-normal gap-6 p-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
