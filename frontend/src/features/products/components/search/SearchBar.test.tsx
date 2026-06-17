/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./SearchBar";
import { vi } from "vitest";

vi.mock("../hooks/useProductSearch", () => ({
    useProductSearch: () => ({
        query: "",
        setQuery: vi.fn(),
        handleChange: vi.fn(),
        results: [],
        isFetching: false,
        showResults: false,
    }),
}));

vi.mock("./SearchInput", () => ({
    SearchInput: ({ onClose }: any) => (
        <button onClick={onClose}>close</button>
    ),
}));

vi.mock("./SearchResults", () => ({
    SearchResults: () => <div>results</div>,
}));

describe("SearchBar", () => {
    it("renders input (SearchInput) when open", () => {
        render(<SearchBar isOpen={true} setIsOpen={vi.fn()} />);

        expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    });

    it("does not render overlay when closed", () => {
        render(<SearchBar isOpen={false} setIsOpen={vi.fn()} />);

        expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });

    it("calls setIsOpen(false) when overlay is clicked", () => {
        const setIsOpen = vi.fn();

        render(<SearchBar isOpen={true} setIsOpen={setIsOpen} />);

        const overlay = screen.getByTestId("overlay");
        fireEvent.click(overlay);

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("calls setIsOpen(false) when close button is clicked", () => {
        const setIsOpen = vi.fn();

        render(<SearchBar isOpen={true} setIsOpen={setIsOpen} />);

        fireEvent.click(screen.getByRole("button", { name: /close/i }));

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("calls setIsOpen(false) when Escape key is pressed", () => {
        const setIsOpen = vi.fn();

        render(<SearchBar isOpen={true} setIsOpen={setIsOpen} />);

        fireEvent.keyDown(window, { key: "Escape" });

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("is hidden when closed", () => {
        render(<SearchBar isOpen={false} setIsOpen={vi.fn()} />);

        const bar = screen.getByTestId("search-bar");
        expect(bar).toHaveClass("-translate-y-full");
    });

    it("is visible when open", () => {
        render(<SearchBar isOpen={true} setIsOpen={vi.fn()} />);

        const bar = screen.getByTestId("search-bar");
        expect(bar).toHaveClass("translate-y-0");
    });
});