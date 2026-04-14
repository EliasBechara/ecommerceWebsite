import { useEffect } from "react";

type SearchBarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const SearchBar = ({ isOpen, setIsOpen }: SearchBarProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Bar */}
      <div
        className={`
          fixed top-0 left-0 w-full z-50
          bg-white shadow-md
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        `}
      >
        <div className="p-4 flex items-center gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            className="w-full border p-2 rounded outline-none"
          />

          <button onClick={() => setIsOpen(false)}>✕</button>
        </div>
      </div>
    </>
  );
};
