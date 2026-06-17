import { useEffect } from "react";
import { useProductSearch } from "../../hooks/useProductSearch";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";

type SearchBarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const SearchBar = ({ isOpen, setIsOpen }: SearchBarProps) => {
  const {
    query,
    setQuery,
    handleChange,
    results,
    isFetching,
    showResults,
  } = useProductSearch();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setIsOpen]);

  return (
    <>
      {isOpen && (
        <div
          data-testid="overlay"
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        data-testid="search-bar"
        className={`
          fixed top-0 left-0 w-full z-50
          bg-white shadow-md
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        `}
      >
        <SearchInput
          value={query}
          onChange={handleChange}
          onClose={() => {
            setQuery("");
            setIsOpen(false);
          }}
        />

        {isOpen && showResults && (
          <div className="border-t max-h-[70vh] overflow-y-auto px-4 pb-4">
            <SearchResults
              results={results}
              isFetching={isFetching}
              query={query}
              onSelect={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};