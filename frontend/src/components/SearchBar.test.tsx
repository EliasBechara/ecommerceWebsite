import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./SearchBar";
import { vi } from "vitest";

describe("SearchBar", () => {
    it("renders input when open", () => {
        render(<SearchBar isOpen={true} setIsOpen={vi.fn()} />);

        expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("does not render overlay when closed", () => {
        render(<SearchBar isOpen={false} setIsOpen={vi.fn()} />);

        const overlay = document.querySelector(".bg-black\\/30");
        expect(overlay).not.toBeInTheDocument();
    });

    it("calls setIsOpen(false) when overlay is clicked", () => {
        const setIsOpen = vi.fn();

        render(<SearchBar isOpen={true} setIsOpen={setIsOpen} />);

        const overlay = document.querySelector(".bg-black\\/30");
        expect(overlay).toBeInTheDocument();

        fireEvent.click(overlay!);

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("calls setIsOpen(false) when close button is clicked", () => {
        const setIsOpen = vi.fn();

        render(<SearchBar isOpen={true} setIsOpen={setIsOpen} />);

        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("calls setIsOpen(false) when Escape key is pressed", () => {
        const setIsOpen = vi.fn();

        render(<SearchBar isOpen={true} setIsOpen={setIsOpen} />);

        fireEvent.keyDown(window, { key: "Escape" });

        expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it("applies hidden class when closed", () => {
        render(<SearchBar isOpen={false} setIsOpen={vi.fn()} />);

        const bar = document.querySelector(".fixed.top-0.left-0");
        expect(bar?.className).toContain("-translate-y-full");
    });

    it("applies visible class when open", () => {
        render(<SearchBar isOpen={true} setIsOpen={vi.fn()} />);

        const bar = document.querySelector(".fixed.top-0.left-0");
        expect(bar?.className).toContain("translate-y-0");
    });
});