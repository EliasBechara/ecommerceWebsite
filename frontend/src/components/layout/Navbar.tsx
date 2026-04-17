import { useEffect } from "react";
import { Button } from "../button/Button";
import { NavSidebar } from "./NavSidebar";
import { SearchBar } from "../SearchBar";
import { Cart } from "../../features/cart/components/Cart";
import { useSelector } from "react-redux";
import { selectTotalItems } from "../../features/cart/cartSlice";
import { useUIOverlay } from "../../hooks/useUIOverlay";

export const Navbar = () => {
  const { activePanel, open, close, isOpen } = useUIOverlay();

  const totalItems = useSelector(selectTotalItems);

  useEffect(() => {
    document.body.style.overflow = activePanel ? "hidden" : "unset";
  }, [activePanel]);

  return (
    <>
      <nav className="flex flex-wrap items-center justify-between w-full max-w-6xl px-6 py-4 gap-4 mt-7 mb-15">
        <div className="flex items-center gap-4">
          <Button
            variant="icon"
            className="md:hidden"
            onClick={() => open("sidebar")}
          >
            ☰
          </Button>

          <div className="hidden md:flex items-center gap-4">
            <Button onClick={() => open("sidebar")}>Menu</Button>
            <Button onClick={() => open("search")}>Search</Button>
          </div>
        </div>

        <div className="font-bold text-xl">Logo</div>

        <div className="flex items-center gap-4">
          <Button>Account</Button>
          <Button variant="outline" onClick={() => open("cart")}>
            Cart: {totalItems > 9 ? "+9" : totalItems}
          </Button>
        </div>

        <NavSidebar
          isSidebarOpen={isOpen("sidebar")}
          setIsSidebarOpen={(v) => (v ? open("sidebar") : close())}
        />
      </nav>

      <SearchBar
        isOpen={isOpen("search")}
        setIsOpen={(v) => (v ? open("search") : close())}
      />
      <Cart
        isOpen={isOpen("cart")}
        setIsOpen={(v) => (v ? open("cart") : close())}
      />
    </>
  );
};
