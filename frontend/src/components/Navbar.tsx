import { useEffect, useState } from "react";
import { Button } from "./button/Button";
import { Sidebar } from "./Sidebar";
import { SearchBar } from "./SearchBar";

export const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isSidebarOpen]);

  return (
    <>
      <nav className="flex flex-wrap items-center justify-between w-full max-w-6xl px-6 py-4 gap-4 mt-7">
        <div className="flex items-center gap-4">
          <Button
            variant="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            ☰
          </Button>

          <div className="hidden md:flex items-center gap-4">
            <Button onClick={() => setIsSidebarOpen(true)}>Menu</Button>
            <Button onClick={() => setIsSearchOpen(true)}>Search</Button>
          </div>
        </div>

        <div className="font-bold text-xl">Logo</div>

        <div className="flex items-center gap-4">
          <Button>Account</Button>
          <Button variant="outline">Cart: 0</Button>
        </div>

        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </nav>

      <SearchBar isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
    </>
  );
};
