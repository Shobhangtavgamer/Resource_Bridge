import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { FullPageLoader } from "@/components/ui/Spinner";
import { PageTransition } from "@/components/motion/PageTransition";
import { SkipLink } from "./SkipLink";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function RootLayout() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!initialized) {
    return <FullPageLoader label="Loading Resource Bridge…" />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <Navbar />
      <main id="main" className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}