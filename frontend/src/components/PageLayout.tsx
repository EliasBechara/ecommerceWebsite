import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

type PageLayoutProps = {
  children: ReactNode;
};

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="bg-greyOne min-h-screen w-full flex flex-col items-center text-black">
      <Navbar />

      <main className="w-full max-w-6xl grow px-6">{children}</main>

      <Footer />
    </div>
  );
}
